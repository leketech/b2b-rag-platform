# Add this new method to IngestionService class in ingestion.py:

async def ingest_file_from_bytes(
    self,
    db: AsyncSession,
    filename: str,
    content: bytes,
    organization_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> int:
    """Ingest a file from raw bytes (for API uploads)."""
    logger.info("ingest.start", filename=filename)
    
    # ✅ Use _load_text logic adapted for bytes
    text = self._load_text_from_bytes(filename, content)
    chunks = _chunk_text(text)
    doc_type = _detect_doc_type(filename)
    
    embeddings = await self.embeddings.aembed_documents(chunks)
    
    records = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings, strict=False)):
        records.append(
            DocumentChunk(
                id=uuid.uuid4(),
                organization_id=(
                    uuid.UUID(organization_id)
                    if organization_id is not None
                    else None
                ),
                doc_type=doc_type,
                source_filename=filename,
                chunk_index=i,
                content=chunk,
                embedding=embedding,
                metadata_={
                    "file_hash": hashlib.md5(content).hexdigest(),
                    **(metadata or {}),
                },
            )
        )
    
    db.add_all(records)
    await db.commit()
    logger.info("ingest.complete", filename=filename, chunks=len(records), doc_type=doc_type)
    return len(records)

def _load_text_from_bytes(self, filename: str, content: bytes) -> str:
    """Load text from bytes based on file extension."""
    suffix = Path(filename).suffix.lower()
    if suffix in {".txt", ".md"}:
        return content.decode("utf-8")
    if suffix == ".pdf":
        try:
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            return "\n".join(page.get_text() for page in doc)
        except ImportError as e:
            raise RuntimeError("PyMuPDF not installed. Run: pip install pymupdf") from e
    if suffix == ".docx":
        from docx import Document
        from io import BytesIO
        doc = Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    raise ValueError(f"Unsupported file type: {suffix}")