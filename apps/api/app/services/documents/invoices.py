"""Invoice generation endpoints — full implementation in Phase 2."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


class LineItem(BaseModel):
    description: str
    quantity: float
    unit_price: float


class InvoiceRequest(BaseModel):
    organization_id: str
    client_info: dict       # {name, email, address, company}
    line_items: list[LineItem]
    tax_rate: float = 0.0
    currency: str = "USD"
    due_days: int = 30      # days from today
    notes: str = ""
    create_stripe_link: bool = False


@router.post("/generate")
async def generate_invoice(
    req: InvoiceRequest,
    db: AsyncSession = Depends(get_db),
):
    # TODO Phase 2: compute totals → render PDF → upload S3 → optionally create Stripe invoice
    raise HTTPException(status_code=501, detail="Invoice generation coming in Phase 2")


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 2")


@router.get("/")
async def list_invoices(organization_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 2")


@router.post("/{invoice_id}/send")
async def send_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: trigger Celery task to email invoice PDF
    raise HTTPException(status_code=501, detail="Coming in Phase 2")
