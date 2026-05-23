import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_org
from app.db.session import get_db
from app.models.models import Meeting

router = APIRouter()


class Attendee(BaseModel):
    name: str
    email: str = ""


class MeetingCreate(BaseModel):
    title: str
    scheduled_at: str
    duration_minutes: int = 30
    location: str = ""
    attendees: list[Attendee] = []
    notes: str = ""


def _serialize(m: Meeting) -> dict:
    return {
        "id": str(m.id),
        "title": m.title,
        "status": m.status,
        "attendees": m.attendees,
        "scheduled_at": m.scheduled_at.isoformat() if m.scheduled_at else "",
        "duration_minutes": m.duration_minutes,
        "location": m.location or "",
        "notes": m.notes or "",
        "created_at": m.created_at.isoformat() if m.created_at else "",
    }


@router.get("/")
async def list_meetings(
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Meeting)
        .where(Meeting.organization_id == uuid.UUID(current_org["org_id"]))
        .order_by(Meeting.scheduled_at.asc())
    )
    return [_serialize(m) for m in result.scalars().all()]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_meeting(
    req: MeetingCreate,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        scheduled = datetime.fromisoformat(req.scheduled_at)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scheduled_at format. Use ISO 8601 (e.g. 2025-06-01T14:00:00).",
        ) from None

    meeting = Meeting(
        organization_id=uuid.UUID(current_org["org_id"]),
        title=req.title,
        status="scheduled",
        scheduled_at=scheduled,
        duration_minutes=req.duration_minutes,
        location=req.location,
        attendees=[a.model_dump() for a in req.attendees],
        notes=req.notes,
    )
    db.add(meeting)
    await db.flush()
    return _serialize(meeting)


@router.get("/{meeting_id}")
async def get_meeting(
    meeting_id: str,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        mid = uuid.UUID(meeting_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.") from None

    result = await db.execute(
        select(Meeting).where(
            Meeting.id == mid,
            Meeting.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")
    return _serialize(meeting)


@router.patch("/{meeting_id}/status")
async def update_meeting_status(
    meeting_id: str,
    body: dict,
    current_org: dict = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    try:
        mid = uuid.UUID(meeting_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.") from None

    result = await db.execute(
        select(Meeting).where(
            Meeting.id == mid,
            Meeting.organization_id == uuid.UUID(current_org["org_id"]),
        )
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")

    allowed = {"scheduled", "confirmed", "cancelled", "completed"}
    new_status = body.get("status", "")
    if new_status not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Status must be one of {allowed}.")

    meeting.status = new_status
    await db.flush()
    return _serialize(meeting)
