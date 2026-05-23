import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_org
from app.db.session import get_db
from app.models.models import Invoice

router = APIRouter()


class LineItem(BaseModel):
    description: str
    quantity: float = 1
    unit_price: float
    total: float = 0.0


class InvoiceCreate(BaseModel):
    client_name: str
    client_email: str = ""
    line_items: list[LineItem] = []
    tax_rate: float = 0.0
    currency: str = "USD"
    due_date: str = ""
    notes: str = ""


def _invoice_number() -> str:
    return f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


def _serialize(inv: Invoice) -> dict:
    return {
        "id": str(inv.id),
        "invoice_number": inv.invoice_number,
        "status": inv.status,
        "client_info": inv.client_info,
        "line_items": inv.line_items,
        "subtotal": inv.subtotal,
        "tax_rate": inv.tax_rate,
        "tax_amount": inv.tax_amount,
        "total": inv.total,
        "currency": inv.currency,
        "due_date": inv.due_date.isoformat() if inv.due_date else "",
        "notes": inv.notes or "",
        "created_at": inv.created_at.isoformat() if inv.created_at else "",
    }


@router.get("/")
async def list_invoices(
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice)
        .where(Invoice.organization_id == uuid.UUID(current_org["org_id"]))
        .order_by(Invoice.created_at.desc())
    )
    return [_serialize(inv) for inv in result.scalars().all()]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    req: InvoiceCreate,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    items = [item.model_dump() for item in req.line_items]
    for item in items:
        item["total"] = round(item["quantity"] * item["unit_price"], 2)

    subtotal = round(sum(i["total"] for i in items), 2)
    tax_amount = round(subtotal * req.tax_rate / 100, 2)
    total = round(subtotal + tax_amount, 2)

    due = None
    if req.due_date:
        try:
            due = datetime.fromisoformat(req.due_date)
        except ValueError:
            pass

    invoice = Invoice(
        organization_id=uuid.UUID(current_org["org_id"]),
        invoice_number=_invoice_number(),
        status="draft",
        client_info={"name": req.client_name, "email": req.client_email},
        line_items=items,
        subtotal=subtotal,
        tax_rate=req.tax_rate,
        tax_amount=tax_amount,
        total=total,
        currency=req.currency,
        due_date=due,
        notes=req.notes,
    )
    db.add(invoice)
    await db.flush()
    return _serialize(invoice)


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        iid = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

    result = await db.execute(
        select(Invoice).where(
            Invoice.id == iid,
            Invoice.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    return _serialize(invoice)


@router.patch("/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: str,
    body: dict,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        iid = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

    result = await db.execute(
        select(Invoice).where(
            Invoice.id == iid,
            Invoice.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

    allowed = {"draft", "sent", "paid", "overdue", "cancelled"}
    new_status = body.get("status", "")
    if new_status not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Status must be one of {allowed}.")

    invoice.status = new_status
    if new_status == "paid":
        invoice.paid_at = datetime.utcnow()
    await db.flush()
    return _serialize(invoice)
