"""SMS Celery tasks — queue: sms"""
from __future__ import annotations

import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    name='sms.send_sms',
    queue='sms',
    bind=True,
    max_retries=3,
    default_retry_delay=15,
    soft_time_limit=40,
    time_limit=55,
    acks_late=True,
    reject_on_worker_lost=True,
)
def send_sms_task(self, to_list, message: str, from_number: str | None = None):
    from sms.services import send_sms_mellipayamak

    try:
        success, count, err = send_sms_mellipayamak(to_list, message, from_number=from_number)
        if not success and err:
            logger.warning('SMS send soft-fail: %s', err)
        return {'success': success, 'count': count, 'error': err}
    except Exception as exc:
        logger.exception('send_sms_task failed: %s', exc)
        raise self.retry(exc=exc)


@shared_task(
    name='sms.send_registration_welcome',
    queue='sms',
    bind=True,
    max_retries=2,
    default_retry_delay=10,
    soft_time_limit=40,
    time_limit=55,
)
def send_registration_welcome_task(self, user_id: int):
    from django.contrib.auth import get_user_model
    from sms.services import send_registration_welcome_sms

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
        return send_registration_welcome_sms(user)
    except User.DoesNotExist:
        return {'success': False, 'error': 'user_not_found'}
    except Exception as exc:
        logger.exception('welcome sms failed: %s', exc)
        raise self.retry(exc=exc)
