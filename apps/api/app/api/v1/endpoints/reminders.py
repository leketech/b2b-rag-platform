import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_org
from app.db.session import get_db
from app.models.models import NotificationLog

router = APIRouter()


class ReminderCreate(BaseModel):
    title: str
    message: str
    channel: str = "email"  # email | slack | sms
    recipient: str
    remind_at: str
    related_type: str = ""
    related_id: str = ""


def _serialize(n: NotificationLog) -> dict:
    return {
        "id": str(n.id),
        "channel": n.channel,
        "recipient": n.recipient,
        "subject": n.subject or "",
        "body": n.body,
        "status": n.status,
        "related_type": n.related_type or "",
        "related_id": str(n.related_id) if n.related_id else "",
        "sent_at": n.sent_at.isoformat() if n.sent_at else "",
    }


@router.get("/")
async def list_reminders(
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NotificationLog)
        .where(NotificationLog.organization_id == uuid.UUID(current_org["org_id"]))
        .order_by(NotificationLog.sent_at.desc())
    )
    return [_serialize(n) for n in result.scalars().all()]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_reminder(
    req: ReminderCreate,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        remind_at = datetime.fromisoformat(req.remind_at)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid remind_at format. Use ISO 8601.",
        )

    related_id = None
    if req.related_id:
        try:
            related_id = uuid.UUID(req.related_id)
        except ValueError:
            pass

    reminder = NotificationLog(
        organization_id=uuid.UUID(current_org["org_id"]),
        channel=req.channel,
        recipient=req.recipient,
        subject=req.title,
        body=req.message,
        status="pending",
        related_type=req.related_type or None,
        related_id=related_id,
        sent_at=remind_at,
    )
    db.add(reminder)
    await db.flush()
    return _serialize(reminder)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: str,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        rid = uuid.UUID(reminder_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")

    result = await db.execute(
        select(NotificationLog).where(
            NotificationLog.id == rid,
            NotificationLog.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")
    await db.delete(reminder)
