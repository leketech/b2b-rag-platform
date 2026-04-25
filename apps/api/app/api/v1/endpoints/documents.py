import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.db.session import AsyncSessionLocal
from app.services.documents.ingestion import ingestion_service

router = APIRouter()

SUPPORTED_EXTENSIONS = {".txt", ".md", ".pdf", ".docx"}


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_document(file: UploadFile = File(...)):
    """Ingest a single document file into the RAG knowledge base."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Supported: {', '.join(SUPPORTED_EXTENSIONS)}",
        )

    # Save UploadFile to temp Path for ingestion service
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        async with AsyncSessionLocal() as db:
            chunks = await ingestion_service.ingest_file(db, tmp_path)
            return {"status": "success", "filename": file.filename, "chunks": chunks}
    finally:
        # Clean up temp file
        tmp_path.unlink(missing_ok=True)
