"""Beat tasks for meeting scheduling."""

import asyncio
from datetime import datetime, timedelta

import structlog
from celery import shared_task
from sqlalchemy import select

from app.core.session import AsyncSessionLocal
from app.models.models import Meeting, MeetingStatus
from app.services.notifications.tasks import send_email_notification

logger = structlog.get_logger()


def _run_async(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()
    else:
        return loop.run_until_complete(coro)


async def _send_meeting_reminders() -> None:
    now = datetime.utcnow()
    window_start = now + timedelta(minutes=50)
    window_end = now + timedelta(hours=1, minutes=10)

    async with AsyncSessionLocal() as session:
        stmt = (
            select(Meeting)
            .where(Meeting.status != MeetingStatus.CANCELLED)
            .where(Meeting.reminder_sent.is_(False))
            .where(Meeting.scheduled_at >= window_start)
            .where(Meeting.scheduled_at <= window_end)
        )
        result = await session.execute(stmt)
        meetings = result.scalars().all()

        if not meetings:
            logger.info("beat.send_meeting_reminders.none")
            return

        for meeting in meetings:
            logger.info("beat.send_meeting_reminders.meeting", meeting_id=str(meeting.id))
            reminder_body = (
                f"Reminder: your meeting <strong>{meeting.title}</strong> is scheduled for "
                f"{meeting.scheduled_at.isoformat()} UTC. Location: {meeting.location or 'TBD'}."
            )
            for attendee in meeting.attendees or []:
                email = attendee.get("email")
                if not email:
                    continue
                send_email_notification.delay(
                    recipient=email,
                    subject=f"Upcoming meeting: {meeting.title}",
                    body=reminder_body,
                    related_type="meeting",
                    related_id=str(meeting.id),
                )
            meeting.reminder_sent = True
        await session.commit()


@shared_task
def send_meeting_reminders():
    _run_async(_send_meeting_reminders())
