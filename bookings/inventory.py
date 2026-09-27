"""
Inventory / soft-hold helpers for concurrent purchase safety.

Nira APIs currently available in this project:
  - Availability
  - Routes (origins / destinations)

There is NO documented Nira Reserve/Book/Payment/Ticket API in-repo.
Until the airline provides those endpoints, we:
  1) re-check Availability live (no cache) right before hold
  2) respect AllowReservation on the selected class
  3) soft-hold seats in our DB with select_for_update + TTL
  4) only mark CONFIRMED after payment success

When Nira Reserve/Payment docs arrive, wire them in flights/nira_client.py
(create_reservation / get_payment_redirect) — initiate_payment already branches on them.
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .constants import BOOKING_HOLD_MINUTES, BOOKING_INVENTORY_LOCK_STATUSES

logger = logging.getLogger(__name__)


def build_inventory_key(
    flight_number: str,
    origin: str,
    destination: str,
    departure_iso: str,
    cabin_class: str,
) -> str:
    dep = (departure_iso or '')[:16]
    return '|'.join([
        str(flight_number or '').upper().strip(),
        str(origin or '').upper().strip()[:3],
        str(destination or '').upper().strip()[:3],
        dep,
        str(cabin_class or 'ECONOMY').upper().strip(),
    ])


def _parse_departure(flight_data: dict) -> Optional[datetime]:
    original = (flight_data or {}).get('originalData') or {}
    raw = (
        (flight_data or {}).get('departureDateTime')
        or (flight_data or {}).get('departure')
        or original.get('DepartureDateTime')
    )
    if not raw:
        return None
    if isinstance(raw, datetime):
        return raw
    text = str(raw).replace('Z', '+00:00')
    dt = parse_datetime(text)
    if dt:
        return dt
    for fmt in ('%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
        try:
            return datetime.strptime(str(raw)[:19], fmt)
        except ValueError:
            continue
    return None


def extract_flight_identity(flight_data: dict) -> Dict[str, Any]:
    original = (flight_data or {}).get('originalData') or {}
    origin = (
        (flight_data or {}).get('originCode')
        or (flight_data or {}).get('origin_code')
        or original.get('Origin')
        or ''
    )
    destination = (
        (flight_data or {}).get('destinationCode')
        or (flight_data or {}).get('destination_code')
        or original.get('Destination')
        or ''
    )
    flight_no = (
        (flight_data or {}).get('flightNumber')
        or original.get('FlightNo')
        or original.get('FlightNumber')
        or ''
    )
    cabin = ((flight_data or {}).get('cabinClass') or (flight_data or {}).get('class') or 'ECONOMY')
    departure = _parse_departure(flight_data)
    class_name = (
        (flight_data or {}).get('className')
        or (flight_data or {}).get('fareClass')
        or original.get('SelectedClassName')
        or ''
    )
    return {
        'origin': str(origin).upper()[:3],
        'destination': str(destination).upper()[:3],
        'flight_number': str(flight_no).upper(),
        'cabin_class': str(cabin).upper(),
        'class_name': str(class_name),
        'departure': departure,
        'departure_iso': departure.isoformat() if departure else '',
    }


def _class_allows_reservation(class_row: dict) -> bool:
    if not isinstance(class_row, dict):
        return False
    if class_row.get('AllowReservation') is False:
        return False
    status = str(class_row.get('Status', '')).strip().upper()
    # Nira often uses "A" / "AA" / numeric remaining seats
    if status in ('C', 'CLOSED', 'X', 'N', '0', ''):
        # empty status alone is not enough to reject if AllowReservation True
        if status in ('C', 'CLOSED', 'X', 'N', '0'):
            return False
    if class_row.get('AllowReservation') is True:
        return True
    # Fallback: positive numeric status = seats left
    try:
        return int(status) > 0
    except ValueError:
        return status in ('A', 'AA', 'OPEN', 'AVAILABLE')


def revalidate_with_nira(
    flight_data: dict,
    adult_qty: int,
    child_qty: int = 0,
    infant_qty: int = 0,
) -> Tuple[bool, Dict[str, Any]]:
    """
    Live Availability check (no cache). Returns (ok, details).
    """
    from flights.nira_client import NiraClient

    identity = extract_flight_identity(flight_data)
    if not identity['origin'] or not identity['destination'] or not identity['departure']:
        return False, {'error': 'incomplete_flight_data', 'message': 'اطلاعات پرواز ناقص است.'}

    client = NiraClient()
    result = client.check_availability(
        origin=identity['origin'],
        destination=identity['destination'],
        departure_date=identity['departure'],
        round_trip=False,
        adult_qty=max(1, adult_qty),
        child_qty=max(0, child_qty),
        infant_qty=max(0, infant_qty),
        use_cache=False,
    )
    if not result.get('success'):
        return False, {
            'error': 'nira_unavailable',
            'message': result.get('error') or 'سامانه نیرا در دسترس نیست. لطفاً دوباره تلاش کنید.',
            'nira': result,
        }

    flights = (result.get('data') or {}).get('AvailableFlights') or []
    wanted_no = identity['flight_number']
    matched = None
    for f in flights:
        fn = str(f.get('FlightNo') or f.get('FlightNumber') or '').upper()
        if wanted_no and (fn == wanted_no or wanted_no.endswith(fn) or fn.endswith(wanted_no[-3:])):
            matched = f
            break
    if matched is None and len(flights) == 1:
        matched = flights[0]
    if matched is None:
        return False, {
            'error': 'flight_gone',
            'message': 'این پرواز دیگر در موجودی نیرا نیست. لطفاً دوباره جستجو کنید.',
        }

    classes = matched.get('ClassStatus') or []
    cabin = identity['cabin_class']
    class_name = identity['class_name'].upper()
    candidates = []
    for row in classes:
        cabin_row = str(row.get('CabinClass') or '').upper()
        name_row = str(row.get('ClassName') or '').upper()
        if class_name and name_row == class_name:
            candidates.append(row)
        elif cabin and cabin_row == cabin:
            candidates.append(row)
        elif not class_name and not cabin:
            candidates.append(row)
    if not candidates:
        candidates = list(classes)

    allow_any = any(_class_allows_reservation(c) for c in candidates) if candidates else False
    if not allow_any:
        return False, {
            'error': 'sold_out',
            'message': 'ظرفیت این پرواز تکمیل شده است.',
            'flight': matched,
        }

    seats_needed = max(1, adult_qty) + max(0, child_qty)
    return True, {
        'nira_flight': matched,
        'identity': identity,
        'seats_needed': seats_needed,
        'message': 'ok',
    }


def count_locked_seats(inventory_key: str) -> int:
    from .models import Booking

    qs = Booking.objects.filter(
        status__in=BOOKING_INVENTORY_LOCK_STATUSES,
        metadata__inventory_key=inventory_key,
    ).filter(
        Q(hold_expires_at__isnull=True) | Q(hold_expires_at__gt=timezone.now()) | ~Q(status='HELD')
    )
    # For HELD, only count non-expired; for CONFIRMED always count
    total = 0
    for b in qs.only('id', 'status', 'hold_expires_at').prefetch_related('passengers'):
        if b.status == 'HELD' and b.hold_expires_at and b.hold_expires_at <= timezone.now():
            continue
        # infants usually don't take a seat — count adult+child only when possible
        pax = b.passengers.exclude(passenger_type='INFANT').count()
        if pax == 0:
            pax = b.passengers.count() or 1
        total += pax
    return total


def hold_minutes() -> int:
    return int(getattr(settings, 'BOOKING_HOLD_MINUTES', BOOKING_HOLD_MINUTES))
