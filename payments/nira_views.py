"""
Public Nira payment endpoints (airline IBE pattern):

- POST/GET /api/payments/nira/callback/  → server-to-server (authoritative)
- GET/POST /api/payments/nira/return/    → browser return after Nira UI
"""
from __future__ import annotations

import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .nira_bridge import (
    finalize_nira_payment,
    find_booking_for_nira_ref,
    normalize_nira_payload,
    verify_callback_auth,
)

logger = logging.getLogger(__name__)


def _merge_request_data(request) -> dict:
    data = {}
    if request.method == 'GET':
        data.update(request.GET.dict())
    else:
        data.update(request.GET.dict())
        data.update(request.POST.dict())
        if request.content_type and 'application/json' in request.content_type:
            try:
                body = json.loads(request.body.decode('utf-8') or '{}')
                if isinstance(body, dict):
                    data.update(body)
            except Exception:
                pass
    return data


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def nira_payment_callback(request):
    """
    Authoritative webhook from Nira after payment.
    Must stay CSRF-exempt; protect with NIRA_CALLBACK_SECRET / IP allowlist.
    """
    payload = _merge_request_data(request)
    ok_auth, reason = verify_callback_auth(request, payload)
    if not ok_auth:
        logger.warning('Nira callback rejected: %s', reason)
        return JsonResponse({'ok': False, 'code': 'unauthorized', 'detail': reason}, status=403)

    result = finalize_nira_payment(payload, source='callback')
    status_code = 200 if result.get('ok') or result.get('code') == 'payment_failed' else 400
    if result.get('code') == 'booking_not_found':
        status_code = 404
    return JsonResponse(result, status=status_code)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def nira_payment_return(request):
    """
    Browser return URL after Nira payment UI.
    Also finalizes (idempotent) in case callback is delayed, then FE can poll status.
    """
    payload = {}
    payload.update(request.query_params.dict())
    if hasattr(request, 'data') and isinstance(request.data, dict):
        payload.update(dict(request.data))

    # Soft auth on return is optional — still finalize when payload looks valid
    result = finalize_nira_payment(payload, source='return')
    normalized = normalize_nira_payload(payload)
    return Response({
        **result,
        'provider': 'nira',
        'ref': normalized.get('ref'),
        'display_status': 'success' if result.get('ok') else 'failed',
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def nira_payment_status(request):
    """Poll booking/payment status by ref (for verify page)."""
    from payments.models import Payment

    ref = (request.query_params.get('ref') or '').strip()
    if not ref:
        return Response({'ok': False, 'code': 'missing_ref'}, status=400)
    booking = find_booking_for_nira_ref(ref)
    if not booking:
        return Response({'ok': False, 'code': 'booking_not_found'}, status=404)
    payment = Payment.objects.filter(booking=booking).order_by('-created_at').first()
    return Response({
        'ok': True,
        'booking_reference': booking.booking_reference,
        'booking_status': booking.status,
        'pnr': booking.nira_pnr,
        'tickets': booking.nira_ticket_numbers,
        'ticket_issued_at': booking.ticket_issued_at,
        'payment_status': payment.status if payment else None,
        'payment_id': payment.id if payment else None,
        'confirmed': booking.status == 'CONFIRMED' and (payment.status == 'COMPLETED' if payment else False),
    })
