from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "b2b_rag",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.services.notifications.tasks",
        "app.services.scheduling.tasks",
        "app.services.documents.tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        # Check for overdue invoices every hour
        "check-overdue-invoices": {
            "task": "app.services.notifications.tasks.check_overdue_invoices",
            "schedule": 3600.0,
        },
        # Send meeting reminders every 15 minutes
        "send-meeting-reminders": {
            "task": "app.services.notifications.tasks.send_meeting_reminders",
            "schedule": 900.0,
        },
        # Contract expiry checks daily at 9am UTC
        "check-contract-expiry": {
            "task": "app.services.notifications.tasks.check_contract_expiry",
            "schedule": 86400.0,
        },
    },
)
