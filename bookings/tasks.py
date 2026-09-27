"""Celery tasks for bookings — queue: default / critical"""
from __future__ import annotations

import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(
    name='bookings.expire_holds',
    queue='default',
    soft_time_limit=40,
    time_limit=55,
    ignore_result=True,
)
def expire_holds_task():
    """Release soft-holds that passed hold_expires_at without payment."""
    from .models import Booking
    from .constants import BOOKING_HELD, BOOKING_EXPIRED

    now = timezone.now()
    qs = Booking.objects.filter(status=BOOKING_HELD, hold_expires_at__lte=now)
    count = 0
    for booking in qs.iterator():
        booking.status = BOOKING_EXPIRED
        booking.cancellation_reason = 'hold_expired'
        booking.cancelled_at = now
        booking.save(update_fields=['status', 'cancellation_reason', 'cancelled_at', 'updated_at'])
        count += 1
    if count:
        logger.info('Expired %s soft-held bookings', count)
    return {'expired': count}
