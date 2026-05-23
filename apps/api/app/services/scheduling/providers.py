"""Scheduling provider wrappers for Cal.com and Google Calendar."""

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from app.core.config import settings


class SchedulingProviderError(RuntimeError):
    pass


class SchedulingProvider:
    async def find_availability(self, organizer_email: str, duration_minutes: int, from_date: datetime, to_date: datetime, timezone: str) -> list[dict]:
        raise NotImplementedError

    async def create_event(
        self,
        title: str,
        description: str,
        start_datetime: datetime,
        duration_minutes: int,
        attendees: list[dict],
        location: str,
        timezone: str,
    ) -> dict:
        raise NotImplementedError

    async def cancel_event(self, external_event_id: str) -> None:
        raise NotImplementedError


class CalComProvider(SchedulingProvider):
    base_url = "https://api.cal.com/v1"

    def __init__(self) -> None:
        if not settings.CALCOM_API_KEY:
            raise SchedulingProviderError("CALCOM_API_KEY is required for Cal.com scheduling provider")
        self.headers = {
            "Authorization": f"Bearer {settings.CALCOM_API_KEY}",
            "Content-Type": "application/json",
        }

    async def find_availability(
        self,
        organizer_email: str,
        duration_minutes: int,
        from_date: datetime,
        to_date: datetime,
        timezone: str,
    ) -> list[dict]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/availability",
                params={
                    "duration": duration_minutes,
                    "from": from_date.isoformat(),
                    "to": to_date.isoformat(),
                    "timezone": timezone,
                    "email": organizer_email,
                },
                headers=self.headers,
            )
            response.raise_for_status()
            payload = response.json()

        return payload.get("slots", [])

    async def create_event(
        self,
        title: str,
        description: str,
        start_datetime: datetime,
        duration_minutes: int,
        attendees: list[dict],
        location: str,
        timezone: str,
    ) -> dict:
        payload = {
            "title": title,
            "description": description,
            "start_time": start_datetime.isoformat(),
            "duration_minutes": duration_minutes,
            "timezone": timezone,
            "attendees": attendees,
            "location": location,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/bookings",
                json=payload,
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def cancel_event(self, external_event_id: str) -> None:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{self.base_url}/bookings/{external_event_id}",
                headers=self.headers,
            )
            response.raise_for_status()


class GoogleCalendarProvider(SchedulingProvider):
    def __init__(self) -> None:
        if not settings.GOOGLE_SERVICE_ACCOUNT_JSON:
            raise SchedulingProviderError("GOOGLE_SERVICE_ACCOUNT_JSON is required for Google Calendar provider")
        try:
            credentials_data = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
        except json.JSONDecodeError as exc:
            raise SchedulingProviderError("GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON") from exc

        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        self.credentials = service_account.Credentials.from_service_account_info(
            credentials_data,
            scopes=["https://www.googleapis.com/auth/calendar"],
        )
        self.calendar_id = settings.GOOGLE_CALENDAR_ID or self.credentials.service_account_email
        self.service = build("calendar", "v3", credentials=self.credentials, cache_discovery=False)

    async def find_availability(
        self,
        organizer_email: str,
        duration_minutes: int,
        from_date: datetime,
        to_date: datetime,
        timezone: str,
    ) -> list[dict]:
        utc_start = from_date.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        utc_end = to_date.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        body = {
            "timeMin": utc_start,
            "timeMax": utc_end,
            "timeZone": timezone,
            "items": [{"id": self.calendar_id}],
        }

        def query_freebusy() -> dict[str, Any]:
            return self.service.freebusy().query(body=body).execute()

        busy = await asyncio.to_thread(query_freebusy)
        busy_periods = busy.get("calendars", {}).get(self.calendar_id, {}).get("busy", [])

        available: list[dict] = []
        current = from_date
        increment = timedelta(minutes=30)
        while current + timedelta(minutes=duration_minutes) <= to_date:
            window_end = current + timedelta(minutes=duration_minutes)
            overlap = any(
                datetime.fromisoformat(slot["start"].replace("Z", "+00:00")) < window_end
                and datetime.fromisoformat(slot["end"].replace("Z", "+00:00")) > current
                for slot in busy_periods
            )
            if not overlap:
                available.append(
                    {
                        "start": current.isoformat(),
                        "end": window_end.isoformat(),
                        "duration_minutes": duration_minutes,
                    }
                )
            current += increment

        return available

    async def create_event(
        self,
        title: str,
        description: str,
        start_datetime: datetime,
        duration_minutes: int,
        attendees: list[dict],
        location: str,
        timezone: str,
    ) -> dict:
        end_datetime = start_datetime + timedelta(minutes=duration_minutes)
        body = {
            "summary": title,
            "location": location,
            "description": description,
            "start": {"dateTime": start_datetime.isoformat(), "timeZone": timezone},
            "end": {"dateTime": end_datetime.isoformat(), "timeZone": timezone},
            "attendees": [{"email": a["email"], "displayName": a.get("name")} for a in attendees],
            "conferenceData": {"createRequest": {"requestId": str(uuid.uuid4())}},
        }

        def insert_event() -> dict[str, Any]:
            return self.service.events().insert(
                calendarId=self.calendar_id,
                body=body,
                conferenceDataVersion=1,
            ).execute()

        return await asyncio.to_thread(insert_event)

    async def cancel_event(self, external_event_id: str) -> None:
        def delete_event() -> None:
            self.service.events().delete(calendarId=self.calendar_id, eventId=external_event_id).execute()

        await asyncio.to_thread(delete_event)


def get_scheduling_provider() -> SchedulingProvider:
    provider_name = settings.SCHEDULING_PROVIDER.lower()
    if provider_name == "google":
        return GoogleCalendarProvider()
    if provider_name == "calcom":
        return CalComProvider()
    raise SchedulingProviderError("Unsupported scheduling provider: %s" % settings.SCHEDULING_PROVIDER)
