"""Email / notification Celery tasks — queue: notify"""
from __future__ import annotations

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(
    name='notifications.send_email',
    queue='notify',
    bind=True,
    max_retries=3,
    default_retry_delay=20,
    soft_time_limit=30,
    time_limit=45,
    acks_late=True,
    reject_on_worker_lost=True,
)
def send_email_task(
    self,
    subject: str,
    message: str,
    recipient_list: list,
    from_email: str | None = None,
    fail_silently: bool = True,
):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nasimair.com'),
            recipient_list=list(recipient_list),
            fail_silently=fail_silently,
        )
        return {'sent': True, 'to': recipient_list}
    except Exception as exc:
        logger.exception('send_email_task failed: %s', exc)
        raise self.retry(exc=exc)
