"""Ingestion pipeline: load → chunk → embed → store in pgvector."""

import hashlib
import os
import uuid
from pathlib import Path
from typing import Any, Optional

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
    """Detect document type based on filename keywords."""
    name = filename.lower()
    if any(k in name for k in ["nda", "contract", "agreement", "msa", "sow", "sla"]):
        return "contract"
    if any(k in name for k in ["invoice", "bill", "receipt"]):
        return "invoice"
    if any(k in name for k in ["policy", "term", "gdpr", "privacy"]):
        return "policy"
    return "template"


def _load_text(path: Path) -> str:
    """Load text content from supported file types."""
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md"}:
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
    """Split text into overlapping chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " "],
    )
    return splitter.split_text(text)


class IngestionService:
    """Service for ingesting documents into pgvector."""

    def __init__(self):
        # ✅ LAZY INIT: Don't create embeddings here — wait until first use
        self._embeddings: Optional[OpenAIEmbeddings] = None
        logger.debug("IngestionService initialized (embeddings lazy-loaded)")

    @property
    def embeddings(self) -> OpenAIEmbeddings:
        """
        Initialize OpenAI embeddings only when first accessed.
        
        This avoids import-time API key validation errors during test collection.
        """
        if self._embeddings is None:
            api_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
            if not api_key:
                # ✅ Free Tier fallback: return a mock-like object for testing
                # This allows tests to run without a real API key
                logger.warning("OPENAI_API_KEY not set — using dummy embeddings for testing")
                self._embeddings = _DummyEmbeddings()
            else:
                logger.info("Initializing OpenAI embeddings", model=settings.EMBEDDING_MODEL)
                self._embeddings = OpenAIEmbeddings(
                    model=settings.EMBEDDING_MODEL,
                    openai_api_key=api_key,
                    # Free Tier optimization: use smaller model to reduce token usage
                    # model="text-embedding-3-small",  # Uncomment if you want to override
                )
        return self._embeddings

    async def ingest_file(
        self,
        db: AsyncSession,
        path: Path,
        organization_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> int:
        """Ingest a single file. Returns number of chunks stored."""
        logger.info("ingest.start", file=str(path))
        
        text = _load_text(path)
        chunks = _chunk_text(text)
        doc_type = _detect_doc_type(path.name)

        # ✅ Embeddings initialize here on first call (not at import)
        embeddings = await self.embeddings.aembed_documents(chunks)

        records = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings, strict=False)):
            records.append(
                DocumentChunk(
                    id=uuid.uuid4(),
                    organization_id=(
                        uuid.UUID(organization_id) if organization_id is not None else None
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
        results: dict[str, int] = {}
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


# =============================================================================
# Dummy Embeddings for Testing (Free Tier: no API key required)
# =============================================================================

class _DummyEmbeddings:
    """
    Minimal embeddings implementation for testing without OpenAI API key.
    
    Returns deterministic fake embeddings so tests can run in CI without
    consuming OpenAI quota or requiring real credentials.
    """
    
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension
    
    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        """Return fake embeddings for a list of texts."""
        return [self._fake_embedding(text) for text in texts]
    
    async def aembed_query(self, text: str) -> list[float]:
        """Return fake embedding for a single query."""
        return self._fake_embedding(text)
    
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Sync version for compatibility."""
        return [self._fake_embedding(text) for text in texts]
    
    def embed_query(self, text: str) -> list[float]:
        """Sync version for compatibility."""
        return self._fake_embedding(text)
    
    def _fake_embedding(self, text: str) -> list[float]:
        """Generate a deterministic fake embedding based on text hash."""
        # Use hash of text to generate reproducible fake vectors
        hash_val = int(hashlib.md5(text.encode()).hexdigest()[:8], 16)
        # Create a simple deterministic vector
        return [(hash_val >> (i * 8) & 0xFF) / 255.0 for i in range(self.dimension)]


# =============================================================================
# Singleton Instance (safe with lazy init)
# =============================================================================

# ✅ This is safe now because __init__ doesn't require API key
ingestion_service = IngestionService()

__all__ = ["IngestionService", "ingestion_service"]