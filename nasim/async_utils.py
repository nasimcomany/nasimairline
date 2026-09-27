"""
Safe task dispatch: uses Celery when broker is up; otherwise runs inline.
Never lets a notification failure break the HTTP response.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


def enqueue(task, *args, countdown: Optional[int] = None, **kwargs) -> Any:
    """
    Enqueue a Celery task or run it synchronously as fallback.

    - Production with Redis: task.delay / apply_async
    - Local without Redis / eager mode: run inline
    - Broker blip: fall back to inline so user still gets a response
    """
    eager = getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)
    if eager:
        return task.apply(args=args, kwargs=kwargs)

    try:
        if countdown:
            return task.apply_async(args=args, kwargs=kwargs, countdown=countdown)
        return task.delay(*args, **kwargs)
    except Exception as exc:
        logger.warning('Celery enqueue failed (%s); running inline: %s', task.name, exc)
        try:
            return task.apply(args=args, kwargs=kwargs)
        except Exception as inner:
            logger.exception('Inline task also failed: %s', inner)
            return None
