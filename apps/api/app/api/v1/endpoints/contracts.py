import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_org
from app.db.session import get_db
from app.models.models import Contract

router = APIRouter()


class PartyInfo(BaseModel):
    name: str
    email: str = ""


class ContractCreate(BaseModel):
    title: str
    contract_type: str = "NDA"  # NDA | MSA | SoW
    client: PartyInfo
    vendor: PartyInfo
    key_terms: dict = {}
    content: str = ""


class ContractResponse(BaseModel):
    id: str
    title: str
    contract_type: str
    status: str
    parties: dict
    content: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


def _serialize(c: Contract) -> dict:
    return {
        "id": str(c.id),
        "title": c.title,
        "contract_type": c.contract_type,
        "status": c.status,
        "parties": c.parties,
        "content": c.content or "",
        "created_at": c.created_at.isoformat() if c.created_at else "",
        "updated_at": c.updated_at.isoformat() if c.updated_at else "",
    }


@router.get("/")
async def list_contracts(
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contract)
        .where(Contract.organization_id == uuid.UUID(current_org["org_id"]))
        .order_by(Contract.created_at.desc())
    )
    return [_serialize(c) for c in result.scalars().all()]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_contract(
    req: ContractCreate,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    contract = Contract(
        organization_id=uuid.UUID(current_org["org_id"]),
        title=req.title,
        contract_type=req.contract_type,
        status="draft",
        parties={"client": req.client.model_dump(), "vendor": req.vendor.model_dump()},
        content=req.content,
        generation_metadata={"key_terms": req.key_terms},
    )
    db.add(contract)
    await db.flush()
    return _serialize(contract)


@router.get("/{contract_id}")
async def get_contract(
    contract_id: str,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        cid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found.") from None

    result = await db.execute(
        select(Contract).where(
            Contract.id == cid,
            Contract.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found.")
    return _serialize(contract)


@router.patch("/{contract_id}/status")
async def update_contract_status(
    contract_id: str,
    body: dict,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        cid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found.") from None

    result = await db.execute(
        select(Contract).where(
            Contract.id == cid,
            Contract.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found.")

    allowed = {"draft", "sent", "signed", "expired", "cancelled"}
    new_status = body.get("status", "")
    if new_status not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Status must be one of {allowed}.")

    contract.status = new_status
    if new_status == "signed":
        contract.signed_at = datetime.utcnow()
    await db.flush()
    return _serialize(contract)
