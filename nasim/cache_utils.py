"""Shared cache helpers (Redis when available, LocMem otherwise)."""
from __future__ import annotations

import hashlib
import json
import logging
from typing import Any, Optional

from django.core.cache import cache

logger = logging.getLogger(__name__)


def cache_get(key: str) -> Any:
    try:
        return cache.get(key)
    except Exception as exc:
        logger.warning('cache_get failed for %s: %s', key, exc)
        return None


def cache_set(key: str, value: Any, timeout: int) -> None:
    try:
        cache.set(key, value, timeout)
    except Exception as exc:
        logger.warning('cache_set failed for %s: %s', key, exc)


def cache_key(*parts: Any) -> str:
    raw = ':'.join(str(p) for p in parts)
    if len(raw) > 180:
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()
    return raw.replace(' ', '_')


def dump_json(data: Any) -> str:
    return json.dumps(data, sort_keys=True, default=str)
