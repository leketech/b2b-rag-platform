"""Core RAG retrieval service used by all feature modules."""
from typing import Any
import structlog
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import DocumentChunk

logger = structlog.get_logger()


class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
        )
        self.llm = self._build_llm()

    def _build_llm(self):
        if settings.LLM_PROVIDER == "anthropic":
            return ChatAnthropic(
                model=settings.LLM_MODEL,
                anthropic_api_key=settings.ANTHROPIC_API_KEY,
            )
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.2,
        )

    async def embed_query(self, query: str) -> list[float]:
        return await self.embeddings.aembed_query(query)

    async def retrieve_chunks(
        self,
        db: AsyncSession,
        query: str,
        doc_type: str | None = None,
        organization_id: str | None = None,
        top_k: int = 5,
    ) -> list[DocumentChunk]:
        """Semantic search over document_chunks using pgvector cosine similarity."""
        query_embedding = await self.embed_query(query)

        filters = []
        if doc_type:
            filters.append(f"doc_type = '{doc_type}'")
        if organization_id:
            filters.append(f"(organization_id = '{organization_id}' OR organization_id IS NULL)")

        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

        sql = text(f"""
            SELECT id, content, doc_type, source_filename, metadata
            FROM document_chunks
            {where_clause}
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)

        result = await db.execute(sql, {"embedding": str(query_embedding), "top_k": top_k})
        rows = result.fetchall()

        logger.info("rag.retrieval", query=query[:80], doc_type=doc_type, chunks_found=len(rows))
        return rows

    async def generate(
        self,
        db: AsyncSession,
        prompt_template: ChatPromptTemplate,
        query: str,
        doc_type: str | None = None,
        organization_id: str | None = None,
        extra_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Full RAG: retrieve → augment → generate."""
        chunks = await self.retrieve_chunks(db, query, doc_type, organization_id)
        context = "\n\n---\n\n".join([row.content for row in chunks])

        chain = (
            {"context": RunnablePassthrough(), "query": RunnablePassthrough()}
            | prompt_template
            | self.llm
            | StrOutputParser()
        )

        input_vars = {"context": context, "query": query, **(extra_context or {})}
        output = await chain.ainvoke(input_vars)

        return {
            "output": output,
            "sources": [
                {"id": str(row.id), "source": row.source_filename, "doc_type": row.doc_type}
                for row in chunks
            ],
        }


# Singleton
rag_service = RAGService()
