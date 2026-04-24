"""Document ingestion endpoints — used to feed the RAG knowledge base."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from pathlib import Path
import tempfile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.documents.ingestion import ingestion_service

router = APIRouter()


@router.post("/ingest")
async def ingest_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    organization_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Upload a document (PDF, DOCX, TXT, MD) to the RAG knowledge base."""
    allowed = {".pdf", ".docx", ".txt", ".md"}
    suffix = Path(file.filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

    # Save to temp file and ingest
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)

    async def _ingest():
        await ingestion_service.ingest_file(db, tmp_path, organization_id)
        tmp_path.unlink(missing_ok=True)

    background_tasks.add_task(_ingest)

    return {
        "message": "Document queued for ingestion",
        "filename": file.filename,
        "organization_id": organization_id,
    }


@router.get("/chunks")
async def list_chunks(
    organization_id: str | None = None,
    doc_type: str | None = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List ingested document chunks (for debugging / auditing)."""
    from sqlalchemy import select
    from app.models.models import DocumentChunk

    q = select(
        DocumentChunk.id,
        DocumentChunk.doc_type,
        DocumentChunk.source_filename,
        DocumentChunk.chunk_index,
        DocumentChunk.created_at,
    )
    if organization_id:
        q = q.where(DocumentChunk.organization_id == organization_id)
    if doc_type:
        q = q.where(DocumentChunk.doc_type == doc_type)
    q = q.offset(offset).limit(limit).order_by(DocumentChunk.created_at.desc())

    result = await db.execute(q)
    rows = result.fetchall()

    return {
        "chunks": [
            {
                "id": str(r.id),
                "doc_type": r.doc_type,
                "source_filename": r.source_filename,
                "chunk_index": r.chunk_index,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
        "limit": limit,
        "offset": offset,
    }
