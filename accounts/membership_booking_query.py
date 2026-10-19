"""
Which bookings count toward باشگاه مشتریان.

While real payment is not live, MEMBERSHIP_COUNT_HELD_BOOKINGS=True lets
non-expired soft-holds (after pay click) count temporarily.
Turn the setting off when payment confirmation is reliable again.
"""
from django.conf import settings
from django.db.models import Q
from django.utils import timezone


def membership_counts_held_bookings() -> bool:
    return bool(getattr(settings, 'MEMBERSHIP_COUNT_HELD_BOOKINGS', False))


def membership_booking_q():
    """
    Q filter for bookings that count for tier stats.
    Always: CONFIRMED + COMPLETED.
    Optional: HELD that is not past hold_expires_at.
    """
    q = Q(status__in=['CONFIRMED', 'COMPLETED'])
    if membership_counts_held_bookings():
        now = timezone.now()
        q |= Q(status='HELD') & (
            Q(hold_expires_at__isnull=True) | Q(hold_expires_at__gt=now)
        )
    return q


def membership_relevant_statuses():
    """Statuses that should trigger a membership stats refresh."""
    statuses = ['CONFIRMED', 'COMPLETED']
    if membership_counts_held_bookings():
        # Recalc when hold is created or later expires/cancelled
        statuses.extend(['HELD', 'EXPIRED', 'CANCELLED'])
    return statuses
