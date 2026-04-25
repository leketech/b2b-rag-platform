"""Ingestion pipeline: load → chunk → embed → store in pgvector."""

import hashlib
import uuid
from pathlib import Path
from typing import Any  # ✅ Added

import structlog
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import DocumentChunk

logger = structlog.get_logger()

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def _detect_doc_type(filename: str) -> str:
    name = filename.lower()
    if any(k in name for k in ["nda", "contract", "agreement", "msa", "sow", "sla"]):
        return "contract"
    if any(k in name for k in ["invoice", "bill", "receipt"]):
        return "invoice"
    if any(k in name for k in ["policy", "term", "gdpr", "privacy"]):
        return "policy"
    return "template"


def _load_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".txt" or suffix == ".md":
        return path.read_text(encoding="utf-8")
    if suffix == ".pdf":
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(str(path))
            return "\n".join(page.get_text() for page in doc)
        except ImportError as e:
            raise RuntimeError("PyMuPDF not installed. Run: pip install pymupdf") from e
    if suffix == ".docx":
        from docx import Document

        doc = Document(str(path))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    raise ValueError(f"Unsupported file type: {suffix}")


def _chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " "],
    )
    return splitter.split_text(text)


class IngestionService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
        )

    async def ingest_file(
        self,
        db: AsyncSession,
        path: Path,
        organization_id: str | None = None,
        metadata: dict[str, Any] | None = None,  # ✅ Tighter type
    ) -> int:
        """Ingest a single file. Returns number of chunks stored."""
        logger.info("ingest.start", file=str(path))
        text = _load_text(path)
        chunks = _chunk_text(text)
        doc_type = _detect_doc_type(path.name)

        embeddings = await self.embeddings.aembed_documents(chunks)

        records = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings, strict=False)):
            records.append(
                DocumentChunk(
                    id=uuid.uuid4(),
                    organization_id=(
                        uuid.UUID(organization_id)
                        if organization_id is not None
                        else None  # ✅ Explicit narrowing
                    ),
                    doc_type=doc_type,
                    source_filename=path.name,
                    chunk_index=i,
                    content=chunk,
                    embedding=embedding,
                    metadata_={
                        "file_hash": hashlib.md5(text.encode()).hexdigest(),
                        **(metadata or {}),
                    },
                )
            )

        db.add_all(records)
        await db.commit()
        logger.info("ingest.complete", file=str(path), chunks=len(records), doc_type=doc_type)
        return len(records)

    async def ingest_directory(
        self,
        db: AsyncSession,
        directory: Path,
        organization_id: str | None = None,
    ) -> dict[str, int]:
        """Ingest all supported files in a directory."""
        results: dict[str, int] = {}  # ✅ Explicit type
        supported = {".txt", ".md", ".pdf", ".docx"}
        for path in directory.rglob("*"):
            if path.suffix.lower() in supported:
                try:
                    count = await self.ingest_file(db, path, organization_id)
                    results[path.name] = count
                except Exception as e:
                    logger.error("ingest.error", file=str(path), error=str(e))
                    results[path.name] = -1
        return results


# ✅ Optional: Singleton instance for easy imports
ingestion_service = IngestionService()
__all__ = ["IngestionService", "ingestion_service"]
