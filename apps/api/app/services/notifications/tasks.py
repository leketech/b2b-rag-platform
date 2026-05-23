"""Notification tasks and DB-backed beat jobs."""

import asyncio
from datetime import datetime, timedelta

import structlog
from celery import shared_task
from sqlalchemy import select

from app.core.config import settings
from app.core.session import AsyncSessionLocal
from app.models.models import Contract, ContractStatus, Invoice, InvoiceStatus, Organization

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


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_notification(
    self, recipient: str, subject: str, body: str, related_type: str = "", related_id: str = ""
):
    """Send an email via SendGrid."""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL,
            to_emails=recipient,
            subject=subject,
            html_content=body,
        )
        client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        client.send(message)
        logger.info("notification.email.sent", recipient=recipient, subject=subject)
    except Exception as exc:
        logger.error("notification.email.failed", error=str(exc), recipient=recipient)
        raise self.retry(exc=exc) from exc


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_sms_notification(self, to_number: str, body: str):
    """Send an SMS via Twilio."""
    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(body=body, from_=settings.TWILIO_FROM_NUMBER, to=to_number)
        logger.info("notification.sms.sent", to=to_number)
    except Exception as exc:
        logger.error("notification.sms.failed", error=str(exc), to=to_number)
        raise self.retry(exc=exc) from exc


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_slack_notification(self, channel: str, message: str):
    """Send a Slack message via bot token."""
    try:
        from slack_sdk import WebClient

        client = WebClient(token=settings.SLACK_BOT_TOKEN)
        client.chat_postMessage(channel=channel, text=message)
        logger.info("notification.slack.sent", channel=channel)
    except Exception as exc:
        logger.error("notification.slack.failed", error=str(exc), channel=channel)
        raise self.retry(exc=exc) from exc


async def _mark_invoice_overdue(session, invoice):
    invoice.status = InvoiceStatus.OVERDUE
    if invoice.client_info.get("email"):
        send_email_notification.delay(
            recipient=invoice.client_info["email"],
            subject=f"Invoice {invoice.invoice_number} is overdue",
            body=(
                f"Your invoice <strong>{invoice.invoice_number}</strong> is overdue. "
                f"Amount due: {invoice.total:.2f} {invoice.currency}. "
                f"Please pay as soon as possible."
            ),
            related_type="invoice",
            related_id=str(invoice.id),
        )
    await session.commit()


async def _check_overdue_invoices():
    now = datetime.utcnow()
    async with AsyncSessionLocal() as session:
        stmt = (
            select(Invoice)
            .where(Invoice.status == InvoiceStatus.SENT)
            .where(Invoice.due_date.is_not(None))
            .where(Invoice.due_date < now)
        )
        results = await session.execute(stmt)
        invoices = results.scalars().all()

        if not invoices:
            logger.info("beat.check_overdue_invoices.none")
            return

        for invoice in invoices:
            logger.info("beat.invoice.overdue", invoice_id=str(invoice.id), invoice_number=invoice.invoice_number)
            await _mark_invoice_overdue(session, invoice)


async def _check_contract_expiry():
    now = datetime.utcnow()
    deadline = now + timedelta(days=30)
    async with AsyncSessionLocal() as session:
        stmt = (
            select(Contract)
            .where(Contract.expires_at.is_not(None))
            .where(Contract.expires_at <= deadline)
            .where(Contract.status.notin_([ContractStatus.EXPIRED, ContractStatus.CANCELLED]))
        )
        results = await session.execute(stmt)
        contracts = results.scalars().all()

        if not contracts:
            logger.info("beat.check_contract_expiry.none")
            return

        for contract in contracts:
            org = await session.get(Organization, contract.organization_id)
            message = (
                f"Contract <strong>{contract.id}</strong> will expire on {contract.expires_at.strftime('%Y-%m-%d')} "
                f"for organization {org.name if org else contract.organization_id}."
            )
            logger.info("beat.contract.expiry.warning", contract_id=str(contract.id), expires_at=contract.expires_at)

            if org and isinstance(org.config, dict):
                admin_email = org.config.get("admin_email")
                if admin_email:
                    send_email_notification.delay(
                        recipient=admin_email,
                        subject="Contract expiry warning",
                        body=message,
                        related_type="contract",
                        related_id=str(contract.id),
                    )
                    continue

            if settings.SLACK_BOT_TOKEN and settings.SLACK_DEPLOY_CHANNEL:
                send_slack_notification.delay(settings.SLACK_DEPLOY_CHANNEL, message)


@shared_task
def check_overdue_invoices():
    _run_async(_check_overdue_invoices())


@shared_task
def check_contract_expiry():
    _run_async(_check_contract_expiry())
