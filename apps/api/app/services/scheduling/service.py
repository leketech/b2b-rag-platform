"""Meeting scheduling service logic."""

import json
from datetime import UTC, datetime

import dateparser
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import Meeting, MeetingStatus
from app.services.scheduling.providers import get_scheduling_provider


async def parse_natural_language_datetime(natural_language: str, preferred_tz: str) -> datetime:
    if settings.LLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
        from anthropic import AI_PROMPT, HUMAN_PROMPT, Anthropic

        client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        prompt = (
            f"{HUMAN_PROMPT} Parse the following scheduling request into JSON with keys: "
            "datetime_iso, timezone, duration_minutes. Respond with valid JSON only. "
            f"Preferred timezone: {preferred_tz}\nRequest: {natural_language}{AI_PROMPT}"
        )
        response = client.complete(model="claude-3.5", prompt=prompt, max_tokens=250)
        text = response["completion"].strip()
    elif settings.OPENAI_API_KEY:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        prompt = (
            "Parse the following scheduling request into JSON with keys: datetime_iso, timezone, duration_minutes. "
            "Respond with valid JSON only.\n"
            f"Preferred timezone: {preferred_tz}\nRequest: {natural_language}"
        )
        response = client.responses.create(model=settings.LLM_MODEL, input=prompt)
        text = response.output_text.strip()
    else:
        parsed = dateparser.parse(
            natural_language,
            settings={
                "TIMEZONE": preferred_tz,
                "RETURN_AS_TIMEZONE_AWARE": True,
            },
        )
        if not parsed:
            raise ValueError("Could not parse natural language datetime")
        return parsed.astimezone(UTC)

    try:
        payload = json.loads(text)
        dt = datetime.fromisoformat(payload["datetime_iso"])
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt.astimezone(UTC)
    except Exception as exc:
        raise ValueError("Failed to parse scheduling assistant output") from exc


async def get_availability(
    organizer_email: str,
    duration_minutes: int,
    from_date: datetime,
    to_date: datetime,
    timezone: str,
) -> list[dict]:
    provider = get_scheduling_provider()
    return await provider.find_availability(organizer_email, duration_minutes, from_date, to_date, timezone)


async def create_meeting(
    db: AsyncSession,
    organization_id: str,
    title: str,
    attendees: list[dict],
    scheduled_at: datetime,
    duration_minutes: int,
    location: str,
    notes: str,
    timezone: str,
    description: str = "Scheduled meeting",
) -> Meeting:
    provider = get_scheduling_provider()
    event = await provider.create_event(
        title=title,
        description=description,
        start_datetime=scheduled_at,
        duration_minutes=duration_minutes,
        attendees=attendees,
        location=location,
        timezone=timezone,
    )

    meeting = Meeting(
        organization_id=organization_id,
        title=title,
        attendees=attendees,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        location=location,
        status=MeetingStatus.CONFIRMED,
        reminder_sent=False,
        notes=notes,
    )

    if hasattr(event, "get"):
        meeting.google_event_id = event.get("id")
        meeting.cal_event_id = event.get("id")
    else:
        meeting.cal_event_id = str(event.get("id", ""))
        meeting.google_event_id = str(event.get("id", ""))

    db.add(meeting)
    await db.flush()
    await db.refresh(meeting)
    return meeting


async def get_meeting(db: AsyncSession, meeting_id: str) -> Meeting | None:
    return await db.get(Meeting, meeting_id)


async def list_meetings(db: AsyncSession, organization_id: str) -> list[Meeting]:
    stmt = select(Meeting).where(Meeting.organization_id == organization_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def cancel_meeting(db: AsyncSession, meeting_id: str) -> Meeting | None:
    meeting = await get_meeting(db, meeting_id)
    if not meeting:
        return None

    provider = get_scheduling_provider()
    external_event_id = meeting.google_event_id or meeting.cal_event_id
    if external_event_id:
        await provider.cancel_event(external_event_id)

    meeting.status = MeetingStatus.CANCELLED
    await db.flush()
    await db.refresh(meeting)
    return meeting
