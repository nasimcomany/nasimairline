"""
Nira IBE payment bridge — airline-style flow:

  soft-hold (HELD) → redirect to Nira payment UI →
  server callback (authoritative) + browser return →
  mark payment COMPLETED + booking CONFIRMED + store PNR/tickets

Field names from Nira are configurable via env because official docs vary.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from bookings.constants import BOOKING_CANCELLED, BOOKING_CONFIRMED, BOOKING_EXPIRED, BOOKING_HELD, BOOKING_PENDING
from payments.constants import PAYMENT_CANCELLED, PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_PENDING

logger = logging.getLogger(__name__)


def _first(payload: dict, *keys: str) -> Any:
    if not isinstance(payload, dict):
        return None
    lower_map = {str(k).lower(): v for k, v in payload.items()}
    for key in keys:
        if key in payload and payload[key] not in (None, ''):
            return payload[key]
        lk = key.lower()
        if lk in lower_map and lower_map[lk] not in (None, ''):
            return lower_map[lk]
    return None


def normalize_nira_payload(raw: dict) -> Dict[str, Any]:
    """Map Nira/callback/query params into a stable internal shape."""
    ref = _first(
        raw,
        'ref', 'booking_reference', 'BookingReference', 'order_id', 'OrderId',
        'invoice', 'InvoiceNumber', 'ResRef', 'reservation_ref',
    )
    status_raw = _first(raw, 'status', 'Status', 'result', 'Result', 'payment_status', 'PaymentStatus')
    pnr = _first(raw, 'pnr', 'PNR', 'Pnr', 'ReservationCode', 'ResNo', 'nira_pnr')
    tickets_raw = _first(raw, 'ticket', 'tickets', 'TicketNo', 'TicketNumbers', 'ETicket', 'eticket')
    amount = _first(raw, 'amount', 'Amount', 'TotalAmount', 'price')
    gateway_ref = _first(
        raw, 'gateway_ref', 'Authority', 'TransactionId', 'transaction_id',
        'ReferenceNumber', 'referenceNumber', 'RefId', 'trace',
    )
    session_id = _first(raw, 'session', 'SessionId', 'nira_session_id', 'sid')
    secret = _first(raw, 'secret', 'token', 'Token', 'hmac', 'signature')

    tickets: List[str] = []
    if isinstance(tickets_raw, list):
        tickets = [str(t).strip() for t in tickets_raw if str(t).strip()]
    elif tickets_raw:
        tickets = [p.strip() for p in str(tickets_raw).replace(';', ',').split(',') if p.strip()]

    success_values = {
        s.strip().lower()
        for s in str(getattr(settings, 'NIRA_CALLBACK_SUCCESS_VALUES', '1,ok,success,paid,true,yes')).split(',')
        if s.strip()
    }
    status_norm = str(status_raw).strip().lower() if status_raw is not None else ''
    is_success = status_norm in success_values
    is_fail = status_norm in {
        s.strip().lower()
        for s in str(getattr(settings, 'NIRA_CALLBACK_FAIL_VALUES', '0,nok,failed,fail,cancel,cancelled,false')).split(',')
        if s.strip()
    }

    return {
        'ref': str(ref).strip() if ref else '',
        'status_raw': status_raw,
        'is_success': is_success,
        'is_fail': is_fail or (status_norm != '' and not is_success),
        'pnr': str(pnr).strip() if pnr else '',
        'tickets': tickets,
        'amount': amount,
        'gateway_ref': str(gateway_ref).strip() if gateway_ref else '',
        'session_id': str(session_id).strip() if session_id else '',
        'secret': str(secret).strip() if secret else '',
        'raw': raw,
    }


def verify_callback_auth(request, payload: dict) -> Tuple[bool, str]:
    """Optional shared secret / IP allowlist for Nira server callbacks."""
    expected = getattr(settings, 'NIRA_CALLBACK_SECRET', '').strip()
    if expected:
        got = (
            request.headers.get('X-Nira-Secret')
            or request.headers.get('X-Callback-Token')
            or payload.get('secret')
            or ''
        )
        if str(got).strip() != expected:
            return False, 'invalid_callback_secret'

    allow = getattr(settings, 'NIRA_CALLBACK_IPS', '').strip()
    if allow:
        allowed = {ip.strip() for ip in allow.split(',') if ip.strip()}
        xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
        client = (xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR', ''))
        if client and client not in allowed:
            return False, f'ip_not_allowed:{client}'
    return True, 'ok'


def find_booking_for_nira_ref(ref: str):
    from bookings.models import Booking

    if not ref:
        return None
    qs = Booking.objects.select_related('user', 'flight').prefetch_related('passengers')
    booking = qs.filter(booking_reference__iexact=ref).first()
    if booking:
        return booking
    booking = qs.filter(nira_pnr__iexact=ref).first()
    if booking:
        return booking
    booking = qs.filter(uuid__iexact=ref).first()
    if booking:
        return booking
    # metadata fallbacks
    return qs.filter(metadata__nira_payment_ref=ref).first() or qs.filter(metadata__payment_ref=ref).first()


@transaction.atomic
def finalize_nira_payment(payload: dict, source: str = 'callback') -> Dict[str, Any]:
    """
    Apply Nira payment result to Payment + Booking.
    Idempotent: safe to call twice for the same success callback.
    """
    from bookings.models import Booking
    from payments.models import Payment

    data = normalize_nira_payload(payload)
    if not data['ref']:
        return {'ok': False, 'code': 'missing_ref', 'message': 'شناسه رزرو (ref) در پاسخ نیرا نبود.'}

    booking = find_booking_for_nira_ref(data['ref'])
    if not booking:
        return {'ok': False, 'code': 'booking_not_found', 'message': f'رزرو {data["ref"]} پیدا نشد.'}

    payment = Payment.objects.select_for_update().filter(booking=booking).order_by('-created_at').first()
    booking = Booking.objects.select_for_update().get(pk=booking.pk)

    # Already finalized
    if payment and payment.status == PAYMENT_COMPLETED and booking.status == BOOKING_CONFIRMED:
        return {
            'ok': True,
            'code': 'already_completed',
            'booking_reference': booking.booking_reference,
            'status': booking.status,
            'pnr': booking.nira_pnr,
            'tickets': booking.nira_ticket_numbers,
            'payment_id': payment.id,
        }

    if data['is_fail'] and not data['is_success']:
        if payment and payment.status == PAYMENT_PENDING:
            payment.status = PAYMENT_FAILED
            payment.gateway = 'NIRA'
            payment.gateway_response = {'source': source, **data}
            if data['gateway_ref']:
                payment.gateway_transaction_id = data['gateway_ref'][:100]
            payment.save()
        if booking.status in (BOOKING_HELD, BOOKING_PENDING):
            booking.status = BOOKING_CANCELLED
            booking.cancellation_reason = f'nira_payment_failed:{source}'
            booking.cancelled_at = timezone.now()
            booking.save(update_fields=['status', 'cancellation_reason', 'cancelled_at', 'updated_at'])
        return {
            'ok': False,
            'code': 'payment_failed',
            'booking_reference': booking.booking_reference,
            'status': booking.status,
        }

    if not data['is_success']:
        return {
            'ok': False,
            'code': 'unknown_status',
            'message': f'وضعیت نامشخص از نیرا: {data["status_raw"]}',
            'booking_reference': booking.booking_reference,
        }

    # Optional: enrich from Nira reservation lookup when URL is configured
    try:
        from flights.nira_client import NiraClient
        enrich = NiraClient().fetch_paid_reservation(data['ref'], data.get('session_id') or '')
        if enrich.get('success'):
            data['pnr'] = data['pnr'] or enrich.get('pnr') or ''
            if not data['tickets'] and enrich.get('tickets'):
                data['tickets'] = enrich['tickets']
    except Exception as exc:
        logger.warning('Nira enrich skipped: %s', exc)

    now = timezone.now()
    if payment:
        payment.status = PAYMENT_COMPLETED
        payment.gateway = 'NIRA'
        payment.completed_at = now
        payment.gateway_response = {'source': source, **data}
        if data['gateway_ref']:
            payment.gateway_transaction_id = data['gateway_ref'][:100]
        payment.save()

    booking.status = BOOKING_CONFIRMED
    booking.hold_expires_at = None
    if data['pnr']:
        booking.nira_pnr = data['pnr'][:32]
    if data['tickets']:
        booking.nira_ticket_numbers = data['tickets']
    if data['session_id']:
        booking.nira_session_id = data['session_id'][:128]
    if data['pnr'] or data['tickets']:
        booking.ticket_issued_at = now
    meta = dict(booking.metadata or {})
    meta['nira_payment'] = {
        'source': source,
        'finalized_at': now.isoformat(),
        'gateway_ref': data['gateway_ref'],
        'raw_status': data['status_raw'],
    }
    booking.metadata = meta
    booking.save()

    logger.info(
        'Nira payment finalized booking=%s pnr=%s tickets=%s source=%s',
        booking.booking_reference, booking.nira_pnr, booking.nira_ticket_numbers, source,
    )
    return {
        'ok': True,
        'code': 'completed',
        'booking_reference': booking.booking_reference,
        'booking_uuid': str(booking.uuid),
        'status': booking.status,
        'pnr': booking.nira_pnr,
        'tickets': booking.nira_ticket_numbers,
        'payment_id': payment.id if payment else None,
        'ticket_issued_at': booking.ticket_issued_at.isoformat() if booking.ticket_issued_at else None,
    }


def build_nira_payment_url(booking_reference: str, request=None) -> Optional[str]:
    """Build redirect URL for Nira-hosted payment UI from settings template."""
    tpl = getattr(settings, 'NIRA_PAYMENT_REDIRECT_URL', '').strip()
    if not tpl:
        return None
    callback = ''
    ret = ''
    if request is not None:
        callback = request.build_absolute_uri('/api/payments/nira/callback/')
        ret = request.build_absolute_uri(f'/payment/verify?ref={booking_reference}&provider=nira')
    try:
        return tpl.format(
            ref=booking_reference,
            callback=callback,
            return_url=ret,
            amount='',
        )
    except Exception as exc:
        logger.error('Bad NIRA_PAYMENT_REDIRECT_URL: %s', exc)
        return None
