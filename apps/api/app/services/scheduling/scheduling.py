"""Meeting scheduling endpoints — full implementation in Phase 3."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


class ScheduleRequest(BaseModel):
    organization_id: str
    title: str
    attendees: list[dict]       # [{name, email}]
    natural_language: str = ""  # "schedule a 30-min call next Tuesday afternoon"
    preferred_datetime: str = ""  # ISO8601 fallback if no NL
    duration_minutes: int = 30
    location: str = ""          # Zoom link, room name, etc.


class AvailabilityRequest(BaseModel):
    organizer_email: str
    duration_minutes: int = 30
    from_date: str              # ISO8601
    to_date: str


@router.post("/meetings")
async def schedule_meeting(
    req: ScheduleRequest,
    db: AsyncSession = Depends(get_db),
):
    # TODO Phase 3: NL → parse datetime → check availability → create Cal.com event → store
    raise HTTPException(status_code=501, detail="Scheduling coming in Phase 3")


@router.get("/availability")
async def get_availability(
    organizer_email: str,
    duration_minutes: int = 30,
    from_date: str = "",
    to_date: str = "",
):
    # TODO Phase 3: query Cal.com / Google Calendar for free slots
    raise HTTPException(status_code=501, detail="Coming in Phase 3")


@router.delete("/meetings/{meeting_id}")
async def cancel_meeting(meeting_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 3")


@router.get("/meetings")
async def list_meetings(organization_id: str, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Coming in Phase 3")
