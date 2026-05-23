"""Unit tests for Celery notification tasks.

For bind=True tasks, Celery injects 'self' automatically when task.run() is called,
so tests do NOT pass a mock_self. To assert retry behaviour, patch the retry method
directly on the task instance via patch.object(task, 'retry', ...).
"""
from unittest.mock import MagicMock, patch

import pytest

from app.services.notifications.tasks import (
    send_email_notification,
    send_slack_notification,
    send_sms_notification,
)


# ── send_email_notification ──────────────────────────────────────────────────

class TestSendEmailNotification:
    def test_calls_sendgrid_on_success(self):
        mock_sg_module = MagicMock()
        mock_client = mock_sg_module.SendGridAPIClient.return_value

        with (
            patch("sendgrid.SendGridAPIClient", mock_sg_module.SendGridAPIClient),
            patch("sendgrid.helpers.mail.Mail", MagicMock()),
            patch("app.services.notifications.tasks.settings") as mock_settings,
        ):
            mock_settings.SENDGRID_API_KEY = "SG.test"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            send_email_notification.run(
                recipient="user@example.com",
                subject="Invoice Due",
                body="<p>Your invoice is due.</p>",
            )

        mock_client.send.assert_called_once()

    def test_retries_when_sendgrid_raises(self):
        mock_sg_module = MagicMock()
        mock_sg_module.SendGridAPIClient.return_value.send.side_effect = Exception(
            "SendGrid API down"
        )

        with (
            patch("sendgrid.SendGridAPIClient", mock_sg_module.SendGridAPIClient),
            patch("sendgrid.helpers.mail.Mail", MagicMock()),
            patch("app.services.notifications.tasks.settings"),
            patch.object(
                send_email_notification,
                "retry",
                side_effect=RuntimeError("task retrying"),
            ) as mock_retry,
        ):
            with pytest.raises(RuntimeError, match="task retrying"):
                send_email_notification.run(
                    recipient="user@example.com",
                    subject="Test",
                    body="Body",
                )

        mock_retry.assert_called_once()

    def test_passes_recipient_and_subject_to_mail(self):
        mock_sg_module = MagicMock()
        mock_mail_cls = MagicMock()

        with (
            patch("sendgrid.SendGridAPIClient", mock_sg_module.SendGridAPIClient),
            patch("sendgrid.helpers.mail.Mail", mock_mail_cls),
            patch("app.services.notifications.tasks.settings") as mock_settings,
        ):
            mock_settings.SENDGRID_API_KEY = "SG.test"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            send_email_notification.run(
                recipient="client@acme.com",
                subject="Contract Expiry Warning",
                body="Your contract expires soon.",
            )

        call_str = str(mock_mail_cls.call_args)
        assert "client@acme.com" in call_str
        assert "Contract Expiry Warning" in call_str


# ── send_sms_notification ────────────────────────────────────────────────────

class TestSendSmsNotification:
    def test_calls_twilio_on_success(self):
        mock_twilio_module = MagicMock()
        mock_client = mock_twilio_module.Client.return_value

        with (
            patch("twilio.rest.Client", mock_twilio_module.Client),
            patch("app.services.notifications.tasks.settings") as mock_settings,
        ):
            mock_settings.TWILIO_ACCOUNT_SID = "ACtest"
            mock_settings.TWILIO_AUTH_TOKEN = "token123"
            mock_settings.TWILIO_FROM_NUMBER = "+15550000000"
            send_sms_notification.run(to_number="+15551234567", body="Invoice reminder")

        mock_client.messages.create.assert_called_once()

    def test_retries_when_twilio_raises(self):
        mock_twilio_module = MagicMock()
        mock_twilio_module.Client.return_value.messages.create.side_effect = Exception(
            "Twilio error"
        )

        with (
            patch("twilio.rest.Client", mock_twilio_module.Client),
            patch("app.services.notifications.tasks.settings"),
            patch.object(
                send_sms_notification,
                "retry",
                side_effect=RuntimeError("task retrying"),
            ) as mock_retry,
        ):
            with pytest.raises(RuntimeError, match="task retrying"):
                send_sms_notification.run(to_number="+15551234567", body="Reminder")

        mock_retry.assert_called_once()

    def test_passes_correct_phone_number_to_twilio(self):
        mock_twilio_module = MagicMock()
        mock_client = mock_twilio_module.Client.return_value

        with (
            patch("twilio.rest.Client", mock_twilio_module.Client),
            patch("app.services.notifications.tasks.settings") as mock_settings,
        ):
            mock_settings.TWILIO_ACCOUNT_SID = "ACtest"
            mock_settings.TWILIO_AUTH_TOKEN = "token"
            mock_settings.TWILIO_FROM_NUMBER = "+15550000000"
            send_sms_notification.run(to_number="+447700900123", body="Due soon.")

        create_kwargs = mock_client.messages.create.call_args[1]
        assert create_kwargs["to"] == "+447700900123"


# ── send_slack_notification ──────────────────────────────────────────────────

class TestSendSlackNotification:
    def test_calls_slack_on_success(self):
        mock_slack_module = MagicMock()
        mock_client = mock_slack_module.WebClient.return_value

        with (
            patch("slack_sdk.WebClient", mock_slack_module.WebClient),
            patch("app.services.notifications.tasks.settings") as mock_settings,
        ):
            mock_settings.SLACK_BOT_TOKEN = "xoxb-test-token"
            send_slack_notification.run(
                channel="#alerts", message="Contract expiring in 7 days"
            )

        mock_client.chat_postMessage.assert_called_once_with(
            channel="#alerts", text="Contract expiring in 7 days"
        )

    def test_retries_when_slack_raises(self):
        mock_slack_module = MagicMock()
        mock_slack_module.WebClient.return_value.chat_postMessage.side_effect = Exception(
            "Slack API error"
        )

        with (
            patch("slack_sdk.WebClient", mock_slack_module.WebClient),
            patch("app.services.notifications.tasks.settings"),
            patch.object(
                send_slack_notification,
                "retry",
                side_effect=RuntimeError("task retrying"),
            ) as mock_retry,
        ):
            with pytest.raises(RuntimeError, match="task retrying"):
                send_slack_notification.run(channel="#alerts", message="Test")

        mock_retry.assert_called_once()

    def test_posts_to_correct_channel(self):
        mock_slack_module = MagicMock()
        mock_client = mock_slack_module.WebClient.return_value

        with (
            patch("slack_sdk.WebClient", mock_slack_module.WebClient),
            patch("app.services.notifications.tasks.settings") as mock_settings,
        ):
            mock_settings.SLACK_BOT_TOKEN = "xoxb-test-token"
            send_slack_notification.run(channel="#deployments", message="Deploy complete")

        mock_client.chat_postMessage.assert_called_once_with(
            channel="#deployments", text="Deploy complete"
        )
