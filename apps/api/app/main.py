from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

# Explicit router imports (Mypy-friendly)
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.contracts import router as contracts_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.invoices import router as invoices_router
from app.api.v1.endpoints.meetings import router as meetings_router
from app.api.v1.endpoints.reminders import router as reminders_router
from app.core.config import settings
from app.services.scheduling.scheduling import router as scheduling_router
from app.core.logging import configure_logging, logger
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    try:
        await init_db()
    except Exception as exc:
        logger.warning("db.init.failed", error=str(exc))
    yield


app = FastAPI(
    title="B2B RAG Platform",
    description="AI-powered contract, invoice, scheduling, and reminder platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Routers
app.include_router(health_router, prefix="/api/v1", tags=["health"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(documents_router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(contracts_router, prefix="/api/v1/contracts", tags=["contracts"])
app.include_router(invoices_router, prefix="/api/v1/invoices", tags=["invoices"])
app.include_router(meetings_router, prefix="/api/v1/meetings", tags=["meetings"])
app.include_router(reminders_router, prefix="/api/v1/reminders", tags=["reminders"])
app.include_router(scheduling_router, prefix="/api/v1/scheduling", tags=["scheduling"])


@app.get("/healthz", include_in_schema=False)
async def root_healthz() -> dict[str, str]:
    return {"status": "ok"}
