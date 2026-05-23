"""Meeting scheduling endpoints for Phase 3."""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.services.scheduling.service import (
    create_meeting,
    get_availability,
    cancel_meeting,
    list_meetings,
    parse_natural_language_datetime,
)

router = APIRouter()


class ScheduleRequest(BaseModel):
    organization_id: str
    title: str
    attendees: list[dict]
    natural_language: str = ""
    preferred_datetime: str = ""
    preferred_tz: str = "UTC"
    duration_minutes: int = 30
    location: str = ""
    additional_notes: str = ""


class AvailabilityResponse(BaseModel):
    start: str
    end: str
    duration_minutes: int


@router.post("/meetings")
async def schedule_meeting(req: ScheduleRequest, db: AsyncSession = Depends(get_db)) -> Any:
    if not req.natural_language and not req.preferred_datetime:
        raise HTTPException(status_code=400, detail="Provide natural_language or preferred_datetime")

    if req.preferred_datetime:
        try:
            scheduled_at = datetime.fromisoformat(req.preferred_datetime.replace("Z", "+00:00"))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="preferred_datetime must be ISO8601") from exc
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
        scheduled_at = scheduled_at.astimezone(timezone.utc)
    else:
        scheduled_at = await parse_natural_language_datetime(
            req.natural_language,
            req.preferred_tz or settings.DEFAULT_TIMEZONE,
        )

    meeting = await create_meeting(
        db=db,
        organization_id=req.organization_id,
        title=req.title,
        attendees=req.attendees,
        scheduled_at=scheduled_at,
        duration_minutes=req.duration_minutes,
        location=req.location or "Online meeting",
        notes=req.additional_notes,
        timezone=req.preferred_tz or settings.DEFAULT_TIMEZONE,
        description=req.title,
    )

    return {
        "id": str(meeting.id),
        "organization_id": str(meeting.organization_id),
        "title": meeting.title,
        "scheduled_at": meeting.scheduled_at.isoformat(),
        "duration_minutes": meeting.duration_minutes,
        "location": meeting.location,
        "status": meeting.status,
        "attendees": meeting.attendees,
    }


@router.get("/availability")
async def get_availability(
    organizer_email: str,
    duration_minutes: int = 30,
    from_date: str = "",
    to_date: str = "",
    preferred_tz: str = "UTC",
) -> dict[str, list[AvailabilityResponse]]:
    try:
        start = (
            datetime.fromisoformat(from_date.replace("Z", "+00:00"))
            if from_date
            else datetime.utcnow().replace(tzinfo=timezone.utc)
        )
        end = (
            datetime.fromisoformat(to_date.replace("Z", "+00:00"))
            if to_date
            else (datetime.utcnow() + timedelta(days=7)).replace(tzinfo=timezone.utc)
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="from_date and to_date must be ISO8601") from exc

    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)

    availability = await get_availability(
        organizer_email=organizer_email,
        duration_minutes=duration_minutes,
        from_date=start,
        to_date=end,
        timezone=preferred_tz or settings.DEFAULT_TIMEZONE,
    )
    return {"slots": availability}


@router.delete("/meetings/{meeting_id}")
async def cancel_meeting_endpoint(meeting_id: str, db: AsyncSession = Depends(get_db)) -> Any:
    meeting = await cancel_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"id": str(meeting.id), "status": meeting.status}


@router.get("/meetings")
async def list_meetings_endpoint(organization_id: str, db: AsyncSession = Depends(get_db)) -> dict[str, list[Any]]:
    meetings = await list_meetings(db, organization_id)
    return {
        "meetings": [
            {
                "id": str(meeting.id),
                "title": meeting.title,
                "scheduled_at": meeting.scheduled_at.isoformat(),
                "duration_minutes": meeting.duration_minutes,
                "location": meeting.location,
                "status": meeting.status,
                "attendees": meeting.attendees,
            }
            for meeting in meetings
        ]
    }
