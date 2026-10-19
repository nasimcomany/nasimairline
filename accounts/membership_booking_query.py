"""
Which bookings count toward باشگاه مشتریان.

While real payment is not live, MEMBERSHIP_COUNT_HELD_BOOKINGS=True lets
soft-holds created on pay click count for membership — including after the
15-minute seat hold expires (status may stay HELD or become EXPIRED).
Turn the setting off when payment confirmation is reliable again.
"""
from django.conf import settings
from django.db.models import Q


def membership_counts_held_bookings() -> bool:
    return bool(getattr(settings, 'MEMBERSHIP_COUNT_HELD_BOOKINGS', False))


def membership_booking_q():
    """
    Q filter for bookings that count for tier stats.
    Always: CONFIRMED + COMPLETED.
    Optional (temp): HELD always, plus EXPIRED/HELD marked membership_test_hold.
    """
    q = Q(status__in=['CONFIRMED', 'COMPLETED'])
    if membership_counts_held_bookings():
        # Do not require hold_expires_at > now — otherwise club progress
        # disappears after ~15 minutes (looks like logout cleared it).
        q |= Q(status='HELD')
        q |= Q(status='EXPIRED', metadata__membership_test_hold=True)
    return q


def membership_relevant_statuses():
    """Statuses that should trigger a membership stats refresh."""
    statuses = ['CONFIRMED', 'COMPLETED']
    if membership_counts_held_bookings():
        statuses.extend(['HELD', 'EXPIRED', 'CANCELLED'])
    return statuses
