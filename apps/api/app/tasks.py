"""Async Celery tasks for notifications and scheduled checks."""
from celery import shared_task
from datetime import datetime, timedelta, timezone
import structlog

logger = structlog.get_logger()


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_notification(self, recipient: str, subject: str, body: str, related_type: str = "", related_id: str = ""):
    """Send an email via SendGrid."""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        from app.core.config import settings

        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails=recipient,
            subject=subject,
            html_content=body,
        )
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        logger.info("notification.email.sent", recipient=recipient, subject=subject)
    except Exception as exc:
        logger.error("notification.email.failed", error=str(exc))
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_sms_notification(self, to_number: str, body: str):
    """Send an SMS via Twilio."""
    try:
        from twilio.rest import Client
        from app.core.config import settings

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(body=body, from_=settings.TWILIO_FROM_NUMBER, to=to_number)
        logger.info("notification.sms.sent", to=to_number)
    except Exception as exc:
        logger.error("notification.sms.failed", error=str(exc))
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_slack_notification(self, channel: str, message: str):
    """Send a Slack message via bot token."""
    try:
        from slack_sdk import WebClient
        from app.core.config import settings

        client = WebClient(token=settings.SLACK_BOT_TOKEN)
        client.chat_postMessage(channel=channel, text=message)
        logger.info("notification.slack.sent", channel=channel)
    except Exception as exc:
        logger.error("notification.slack.failed", error=str(exc))
        raise self.retry(exc=exc)


@shared_task
def check_overdue_invoices():
    """Beat task: find overdue invoices and send reminders."""
    # TODO Phase 4: query DB for invoices past due_date with status=sent, trigger email tasks
    logger.info("beat.check_overdue_invoices")


@shared_task
def send_meeting_reminders():
    """Beat task: send 24h and 1h meeting reminders."""
    # TODO Phase 4: query DB for meetings in next 24h/1h where reminder_sent=False
    logger.info("beat.send_meeting_reminders")


@shared_task
def check_contract_expiry():
    """Beat task: warn on contracts expiring within 30 days."""
    # TODO Phase 4: query contracts expiring in 30 days, send email to org admin
    logger.info("beat.check_contract_expiry")
