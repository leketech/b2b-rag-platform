"""Contract generation endpoints — full implementation in Phase 2."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


class ContractRequest(BaseModel):
    organization_id: str
    contract_type: str  # NDA | MSA | SoW
    parties: dict  # {client: {name, email}, vendor: {name, email}}
    key_terms: dict  # {duration, payment_terms, jurisdiction, ...}
    additional_context: str = ""


@router.post("/generate")
async def generate_contract(
    req: ContractRequest,
    db: AsyncSession = Depends(get_db),
):
    # TODO Phase 2: invoke RAG → generate → render PDF → upload S3
    raise HTTPException(status_code=501, detail="Contract generation coming in Phase 2")


@router.get("/{contract_id}")
async def get_contract(contract_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 2")


@router.get("/")
async def list_contracts(organization_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 2")
