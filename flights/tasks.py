"""Flight / Nira background tasks — queue: nira"""
from __future__ import annotations

import logging
from datetime import datetime

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(
    name='flights.prefetch_origins',
    queue='nira',
    soft_time_limit=50,
    time_limit=70,
    ignore_result=True,
)
def prefetch_origin_cities_task():
    """Warm Redis cache for origin cities (beat / manual)."""
    from flights.nira_client import NiraClient

    client = NiraClient()
    result = client.get_origin_cities(force_refresh=True)
    return {'success': bool(result.get('success'))}


@shared_task(
    name='flights.enrich_flight_status',
    queue='nira',
    soft_time_limit=40,
    time_limit=55,
    ignore_result=True,
)
def enrich_flight_status_task(
    flight_number: str,
    origin: str,
    destination: str,
    departure_iso: str,
):
    """
    Optional background enrichment — not on the search critical path.
    Results are stored in cache for the status endpoint to read.
    """
    from flights.flight_status_service import FlightStatusService
    from nasim.cache_utils import cache_key, cache_set

    try:
        departure_datetime = datetime.fromisoformat(departure_iso)
        if timezone.is_naive(departure_datetime):
            departure_datetime = timezone.make_aware(departure_datetime)
        status_service = FlightStatusService()
        data = status_service.get_flight_status(
            flight_number=flight_number,
            origin=origin,
            destination=destination,
            scheduled_departure=departure_datetime,
        )
        if data:
            key = cache_key('flight_status', flight_number, origin, destination, departure_iso[:16])
            cache_set(key, data, timeout=120)
        return bool(data)
    except Exception as exc:
        logger.warning('enrich_flight_status_task: %s', exc)
        return False
