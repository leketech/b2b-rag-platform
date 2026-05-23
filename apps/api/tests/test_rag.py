"""Unit tests for the RAG retrieval service."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.services.rag.retrieval import RAGService


@pytest.fixture
def rag():
    with (
        patch("app.services.rag.retrieval.OpenAIEmbeddings"),
        patch("app.services.rag.retrieval.ChatOpenAI"),
        patch("app.services.rag.retrieval.ChatAnthropic"),
    ):
        svc = RAGService()
        svc.embeddings = MagicMock()
        svc.embeddings.aembed_query = AsyncMock(return_value=[0.1] * 1536)
        yield svc


def _mock_db_with_rows(rows):
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.fetchall.return_value = rows
    mock_db.execute = AsyncMock(return_value=mock_result)
    return mock_db


# ── embed_query ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_embed_query_delegates_to_embeddings(rag):
    result = await rag.embed_query("payment terms")
    rag.embeddings.aembed_query.assert_awaited_once_with("payment terms")
    assert result == [0.1] * 1536


# ── retrieve_chunks ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_retrieve_chunks_returns_rows(rag):
    mock_row = MagicMock()
    mock_row.content = "The payment is due within 30 days."
    mock_db = _mock_db_with_rows([mock_row])

    rows = await rag.retrieve_chunks(mock_db, query="payment", doc_type="contract", top_k=5)

    assert len(rows) == 1
    assert rows[0].content == "The payment is due within 30 days."
    mock_db.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_retrieve_chunks_empty_result(rag):
    mock_db = _mock_db_with_rows([])
    rows = await rag.retrieve_chunks(mock_db, query="nonexistent topic")
    assert rows == []


@pytest.mark.asyncio
async def test_retrieve_chunks_embeds_the_query(rag):
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(mock_db, query="invoice due date")
    rag.embeddings.aembed_query.assert_awaited_once_with("invoice due date")


@pytest.mark.asyncio
async def test_retrieve_chunks_passes_top_k_to_query(rag):
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(mock_db, query="something", top_k=3)
    call_params = mock_db.execute.call_args[0][1]
    assert call_params["top_k"] == 3


@pytest.mark.asyncio
async def test_retrieve_chunks_no_filters_passes_none_params(rag):
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(mock_db, query="anything")
    params = mock_db.execute.call_args[0][1]
    assert params["doc_type"] is None
    assert params["organization_id"] is None


@pytest.mark.asyncio
async def test_retrieve_chunks_doc_type_passed_as_param(rag):
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(mock_db, query="policy", doc_type="policy")
    params = mock_db.execute.call_args[0][1]
    assert params["doc_type"] == "policy"


@pytest.mark.asyncio
async def test_retrieve_chunks_org_id_passed_as_param(rag):
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(mock_db, query="refund policy", organization_id="org-999")
    params = mock_db.execute.call_args[0][1]
    assert params["organization_id"] == "org-999"


@pytest.mark.asyncio
async def test_retrieve_chunks_both_filters_passed_as_params(rag):
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(
        mock_db, query="SLA terms", doc_type="contract", organization_id="org-42"
    )
    params = mock_db.execute.call_args[0][1]
    assert params["doc_type"] == "contract"
    assert params["organization_id"] == "org-42"


@pytest.mark.asyncio
async def test_retrieve_chunks_no_user_values_in_sql_text(rag):
    """Verify user-supplied values never appear as literals in the SQL string."""
    mock_db = _mock_db_with_rows([])
    await rag.retrieve_chunks(
        mock_db, query="anything", doc_type="contract", organization_id="org-evil'; DROP TABLE document_chunks;--"
    )
    sql_str = str(mock_db.execute.call_args[0][0])
    assert "DROP TABLE" not in sql_str
    assert "org-evil" not in sql_str


# ── _build_llm ───────────────────────────────────────────────────────────────

def test_build_llm_uses_openai_by_default(rag):
    with (
        patch("app.services.rag.retrieval.settings") as mock_settings,
        patch("app.services.rag.retrieval.ChatOpenAI") as MockOAI,
        patch("app.services.rag.retrieval.ChatAnthropic") as MockAnthropic,
    ):
        mock_settings.LLM_PROVIDER = "openai"
        mock_settings.LLM_MODEL = "gpt-4o"
        mock_settings.OPENAI_API_KEY = "sk-test"
        mock_settings.ANTHROPIC_API_KEY = ""
        rag._build_llm()

    MockOAI.assert_called_once()
    MockAnthropic.assert_not_called()


def test_build_llm_uses_anthropic_when_configured(rag):
    with (
        patch("app.services.rag.retrieval.settings") as mock_settings,
        patch("app.services.rag.retrieval.ChatOpenAI") as MockOAI,
        patch("app.services.rag.retrieval.ChatAnthropic") as MockAnthropic,
    ):
        mock_settings.LLM_PROVIDER = "anthropic"
        mock_settings.LLM_MODEL = "claude-sonnet-4-6"
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.ANTHROPIC_API_KEY = "sk-ant-test"
        rag._build_llm()

    MockAnthropic.assert_called_once()
    MockOAI.assert_not_called()
