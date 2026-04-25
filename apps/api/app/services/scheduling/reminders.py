"""Reminder & notification endpoints — full implementation in Phase 4."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


class ReminderRequest(BaseModel):
    organization_id: str
    related_type: str  # contract | invoice | meeting
    related_id: str
    channel: str  # email | sms | slack
    recipient: str  # email address or phone number
    message: str = ""  # override auto-generated message
    send_at: str = ""  # ISO8601, empty = send immediately


@router.post("/send")
async def send_reminder(
    req: ReminderRequest,
    db: AsyncSession = Depends(get_db),
):
    # TODO Phase 4: validate → enqueue Celery task → log to notification_logs
    raise HTTPException(status_code=501, detail="Reminders coming in Phase 4")


@router.get("/logs")
async def notification_logs(organization_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 4")


@router.post("/rules")
async def create_reminder_rule(
    organization_id: str,
    db: AsyncSession = Depends(get_db),
):
    # TODO: configurable rules e.g. "send invoice reminder 3 days before due"
    raise HTTPException(status_code=501, detail="Coming in Phase 4")
