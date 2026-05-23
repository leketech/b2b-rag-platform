"""Unit tests for the document ingestion pipeline."""
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

from app.services.documents.ingestion import (
    IngestionService,
    _chunk_text,
    _detect_doc_type,
    _load_text,
)


# ── _detect_doc_type ────────────────────────────────────────────────────────

@pytest.mark.parametrize(
    "filename,expected",
    [
        ("nda_signed.pdf", "contract"),
        ("Master_Service_Agreement.docx", "contract"),
        ("msa_v2.txt", "contract"),
        ("sow_project_alpha.pdf", "contract"),
        ("sla_support.pdf", "contract"),
        ("invoice_jan.pdf", "invoice"),
        ("bill_003.txt", "invoice"),
        ("receipt_amazon.md", "invoice"),
        ("privacy_policy.md", "policy"),
        ("gdpr_compliance.pdf", "policy"),
        ("terms_and_conditions.txt", "policy"),
        ("report_q4.txt", "template"),
        ("unknown_document.pdf", "template"),
    ],
)
def test_detect_doc_type(filename, expected):
    assert _detect_doc_type(filename) == expected


# ── _load_text ───────────────────────────────────────────────────────────────

def test_load_text_txt(tmp_path):
    f = tmp_path / "sample.txt"
    f.write_text("Hello contract world", encoding="utf-8")
    assert _load_text(f) == "Hello contract world"


def test_load_text_md(tmp_path):
    f = tmp_path / "notes.md"
    f.write_text("# Invoice\n\nDetails here.", encoding="utf-8")
    assert _load_text(f) == "# Invoice\n\nDetails here."


def test_load_text_unsupported_raises(tmp_path):
    f = tmp_path / "data.csv"
    f.write_text("col1,col2\n1,2")
    with pytest.raises(ValueError, match="Unsupported file type"):
        _load_text(f)


# ── _chunk_text ──────────────────────────────────────────────────────────────

def test_chunk_text_returns_nonempty_list():
    text = "This is a sentence about a contract clause. " * 200
    chunks = _chunk_text(text)
    assert len(chunks) > 0
    assert all(isinstance(c, str) and len(c) > 0 for c in chunks)


def test_chunk_text_short_input_is_single_chunk():
    text = "Short document."
    chunks = _chunk_text(text)
    assert len(chunks) == 1
    assert chunks[0] == "Short document."


def test_chunk_text_splits_long_input():
    # 3000 words ≈ 15 000 chars, well above CHUNK_SIZE=800
    text = "word " * 3000
    chunks = _chunk_text(text)
    assert len(chunks) > 1
    for chunk in chunks:
        # Generous upper bound: CHUNK_SIZE + CHUNK_OVERLAP + separator slack
        assert len(chunk) <= 1100


# ── IngestionService ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_ingest_file_returns_chunk_count(tmp_path):
    f = tmp_path / "contract_agreement.txt"
    f.write_text("contract clause. " * 100, encoding="utf-8")

    mock_db = AsyncMock()

    with patch("app.services.documents.ingestion.OpenAIEmbeddings"):
        svc = IngestionService()
        svc.embeddings.aembed_documents = AsyncMock(
            side_effect=lambda chunks: [[0.1] * 1536 for _ in chunks]
        )
        count = await svc.ingest_file(mock_db, f)

    assert count > 0
    mock_db.add_all.assert_called_once()
    records = mock_db.add_all.call_args[0][0]
    assert len(records) == count
    mock_db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_ingest_file_detects_doc_type(tmp_path):
    f = tmp_path / "invoice_march.txt"
    f.write_text("Invoice total: $500 due on 2024-04-01", encoding="utf-8")

    mock_db = AsyncMock()

    with patch("app.services.documents.ingestion.OpenAIEmbeddings"):
        svc = IngestionService()
        svc.embeddings.aembed_documents = AsyncMock(
            side_effect=lambda chunks: [[0.0] * 1536 for _ in chunks]
        )
        await svc.ingest_file(mock_db, f)

    records = mock_db.add_all.call_args[0][0]
    assert all(r.doc_type == "invoice" for r in records)


@pytest.mark.asyncio
async def test_ingest_file_sets_source_filename(tmp_path):
    f = tmp_path / "nda_final.txt"
    f.write_text("Non-disclosure agreement content.", encoding="utf-8")

    mock_db = AsyncMock()

    with patch("app.services.documents.ingestion.OpenAIEmbeddings"):
        svc = IngestionService()
        svc.embeddings.aembed_documents = AsyncMock(
            side_effect=lambda chunks: [[0.0] * 1536 for _ in chunks]
        )
        await svc.ingest_file(mock_db, f)

    records = mock_db.add_all.call_args[0][0]
    assert all(r.source_filename == "nda_final.txt" for r in records)


@pytest.mark.asyncio
async def test_ingest_file_stores_chunk_index(tmp_path):
    f = tmp_path / "sla_contract.txt"
    f.write_text("SLA clause. " * 200, encoding="utf-8")

    mock_db = AsyncMock()

    with patch("app.services.documents.ingestion.OpenAIEmbeddings"):
        svc = IngestionService()
        svc.embeddings.aembed_documents = AsyncMock(
            side_effect=lambda chunks: [[0.0] * 1536 for _ in chunks]
        )
        count = await svc.ingest_file(mock_db, f)

    records = mock_db.add_all.call_args[0][0]
    indices = [r.chunk_index for r in records]
    assert indices == list(range(count))


@pytest.mark.asyncio
async def test_ingest_directory_processes_supported_files(tmp_path):
    (tmp_path / "contract.txt").write_text("contract content", encoding="utf-8")
    (tmp_path / "notes.md").write_text("notes content", encoding="utf-8")
    (tmp_path / "data.csv").write_text("a,b,c")  # unsupported — must be skipped

    mock_db = AsyncMock()

    with patch("app.services.documents.ingestion.OpenAIEmbeddings"):
        svc = IngestionService()
        svc.embeddings.aembed_documents = AsyncMock(
            side_effect=lambda chunks: [[0.0] * 1536 for _ in chunks]
        )
        results = await svc.ingest_directory(mock_db, tmp_path)

    assert "contract.txt" in results
    assert "notes.md" in results
    assert "data.csv" not in results


@pytest.mark.asyncio
async def test_ingest_directory_records_error_as_negative_one(tmp_path):
    (tmp_path / "broken.txt").write_text("some content", encoding="utf-8")

    mock_db = AsyncMock()

    with patch("app.services.documents.ingestion.OpenAIEmbeddings"):
        svc = IngestionService()
        svc.embeddings.aembed_documents = AsyncMock(
            side_effect=RuntimeError("embedding service unavailable")
        )
        results = await svc.ingest_directory(mock_db, tmp_path)

    assert results["broken.txt"] == -1
