"""
Safe task dispatch: uses Celery when broker is up; otherwise runs inline.
Never lets a notification failure break the HTTP response.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


def enqueue(
    task,
    *args,
    countdown: Optional[int] = None,
    allow_inline: bool = True,
    **kwargs,
) -> Any:
    """
    Enqueue a Celery task or optionally run it synchronously as fallback.

    - Production with Redis: task.delay / apply_async
    - Local without Redis / eager mode: run inline (if allow_inline)
    - Broker blip: drop non-critical work when allow_inline=False so the
      web worker is never pinned by background enrichment
    """
    eager = getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)
    if eager:
        if not allow_inline:
            logger.debug('Skipping eager inline for %s (allow_inline=False)', getattr(task, 'name', task))
            return None
        return task.apply(args=args, kwargs=kwargs)

    # Strip our flag so Celery task signatures stay clean
    kwargs.pop('allow_inline', None)

    try:
        if countdown:
            return task.apply_async(args=args, kwargs=kwargs, countdown=countdown)
        return task.delay(*args, **kwargs)
    except Exception as exc:
        if not allow_inline:
            logger.warning('Celery enqueue failed for %s; dropping (no inline): %s', getattr(task, 'name', task), exc)
            return None
        logger.warning('Celery enqueue failed (%s); running inline: %s', getattr(task, 'name', task), exc)
        try:
            return task.apply(args=args, kwargs=kwargs)
        except Exception as inner:
            logger.exception('Inline task also failed: %s', inner)
            return None
