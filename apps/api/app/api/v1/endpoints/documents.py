from fastapi import APIRouter, UploadFile, File, HTTPException, status

router = APIRouter()

SUPPORTED_EXTENSIONS = {".txt", ".md", ".pdf", ".docx"}

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_document(
    file: UploadFile = File(...),
):
    """Ingest a single document file into the RAG knowledge base."""
    # Validate file extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    from pathlib import Path
    ext = Path(file.filename).suffix.lower()
    
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Supported: {', '.join(SUPPORTED_EXTENSIONS)}"
        )
    
    # TODO: Implement actual ingestion logic here
    # For now, return a placeholder success response
    return {
        "status": "queued",
        "filename": file.filename,
        "message": "Document ingestion started"
    }