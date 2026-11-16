"""
Process / cluster resilience for slow upstreams (Nira).

Goals under peak load:
- Cap concurrent outbound Nira calls so Gunicorn threads stay free for SPA/health.
- Open a circuit after repeated failures so we fail fast instead of pinning workers.
- Collapse duplicate in-flight searches (single-flight) across threads / workers.
"""
from __future__ import annotations

import logging
import threading
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Callable, Generator, Optional, TypeVar

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

T = TypeVar('T')


class CircuitOpenError(Exception):
    """Upstream temporarily blocked after repeated failures."""

    def __init__(self, name: str, retry_after: float = 20.0):
        self.name = name
        self.retry_after = retry_after
        super().__init__(f'Circuit open for {name}; retry after {retry_after:.0f}s')


class OverloadedError(Exception):
    """Too many concurrent upstream calls; refuse new work immediately."""

    def __init__(self, name: str, retry_after: float = 5.0):
        self.name = name
        self.retry_after = retry_after
        super().__init__(f'{name} overloaded; retry after {retry_after:.0f}s')


def _cfg(name: str, default: Any) -> Any:
    return getattr(settings, name, default)


class _ProcessSemaphore:
    """Lazy process-wide semaphore (one per logical name)."""

    _locks: dict[str, threading.BoundedSemaphore] = {}
    _meta = threading.Lock()

    @classmethod
    def get(cls, name: str, limit: int) -> threading.BoundedSemaphore:
        with cls._meta:
            sem = cls._locks.get(name)
            if sem is None:
                sem = threading.BoundedSemaphore(max(1, limit))
                cls._locks[name] = sem
            return sem


@dataclass
class CircuitState:
    failures: int = 0
    opened_until: float = 0.0
    half_open: bool = False


class CircuitBreaker:
    """
    Shared circuit via Django cache when Redis is available; process-local fallback.
    """

    def __init__(self, name: str):
        self.name = name
        self._local = CircuitState()
        self._lock = threading.Lock()

    @property
    def _failure_threshold(self) -> int:
        return int(_cfg('NIRA_CIRCUIT_FAILURE_THRESHOLD', 5))

    @property
    def _recovery_seconds(self) -> float:
        return float(_cfg('NIRA_CIRCUIT_RECOVERY_SECONDS', 30))

    @property
    def _cache_key(self) -> str:
        return f'resilience:circuit:{self.name}'

    def _load(self) -> CircuitState:
        try:
            raw = cache.get(self._cache_key)
            if isinstance(raw, dict):
                return CircuitState(
                    failures=int(raw.get('failures') or 0),
                    opened_until=float(raw.get('opened_until') or 0),
                    half_open=bool(raw.get('half_open')),
                )
        except Exception:
            pass
        return self._local

    def _save(self, state: CircuitState) -> None:
        self._local = state
        try:
            cache.set(
                self._cache_key,
                {
                    'failures': state.failures,
                    'opened_until': state.opened_until,
                    'half_open': state.half_open,
                },
                timeout=max(60, int(self._recovery_seconds * 4)),
            )
        except Exception:
            pass

    def allow(self) -> None:
        state = self._load()
        now = time.time()
        if state.opened_until > now:
            raise CircuitOpenError(self.name, retry_after=max(1.0, state.opened_until - now))

    def record_success(self) -> None:
        with self._lock:
            self._save(CircuitState(failures=0, opened_until=0.0, half_open=False))

    def record_failure(self) -> None:
        with self._lock:
            state = self._load()
            state.failures += 1
            if state.failures >= self._failure_threshold:
                state.opened_until = time.time() + self._recovery_seconds
                state.half_open = False
                logger.warning(
                    'Circuit OPEN for %s after %s failures (%.0fs)',
                    self.name,
                    state.failures,
                    self._recovery_seconds,
                )
            self._save(state)


class InflightLimiter:
    """
    Cap concurrent work. Process semaphore always; Redis counter when available
    so multiple Gunicorn workers share one budget.
    """

    def __init__(self, name: str):
        self.name = name

    @property
    def limit(self) -> int:
        return max(1, int(_cfg('NIRA_MAX_INFLIGHT', 4)))

    @property
    def _redis_key(self) -> str:
        return f'resilience:inflight:{self.name}'

    def _redis(self):
        try:
            from django_redis import get_redis_connection
            return get_redis_connection('default')
        except Exception:
            return None

    def _redis_try_acquire(self) -> bool:
        redis = self._redis()
        if redis is None:
            return True  # no shared counter — rely on process semaphore only
        try:
            current = redis.incr(self._redis_key)
            if current == 1:
                redis.expire(self._redis_key, 120)
            if current > self.limit:
                redis.decr(self._redis_key)
                return False
            return True
        except Exception:
            return True

    def _redis_release(self) -> None:
        redis = self._redis()
        if redis is None:
            return
        try:
            val = redis.decr(self._redis_key)
            if val < 0:
                redis.set(self._redis_key, 0, ex=120)
        except Exception:
            pass

    @contextmanager
    def slot(self, blocking: bool = False, timeout: float = 0.0) -> Generator[None, None, None]:
        sem = _ProcessSemaphore.get(self.name, self.limit)
        acquired = sem.acquire(blocking=blocking, timeout=timeout if blocking else None)
        if not acquired:
            raise OverloadedError(self.name)
        if not self._redis_try_acquire():
            sem.release()
            raise OverloadedError(self.name)
        try:
            yield
        finally:
            self._redis_release()
            sem.release()


class SingleFlight:
    """
    Deduplicate concurrent identical work. Winner fetches; waiters reuse cache/result.
    """

    _local_events: dict[str, threading.Event] = {}
    _local_results: dict[str, Any] = {}
    _lock = threading.Lock()

    def __init__(self, name: str):
        self.name = name

    def _owner_key(self, key: str) -> str:
        return f'resilience:sf:{self.name}:{key}'

    def run(self, key: str, fn: Callable[[], T], wait_seconds: float = 20.0) -> T:
        owner_key = self._owner_key(key)
        token = str(uuid.uuid4())
        became_owner = False
        try:
            became_owner = bool(cache.add(owner_key, token, timeout=max(15, int(wait_seconds) + 5)))
        except Exception:
            became_owner = False

        if became_owner:
            event = threading.Event()
            with self._lock:
                self._local_events[key] = event
            try:
                result = fn()
                with self._lock:
                    self._local_results[key] = result
                event.set()
                return result
            except Exception:
                event.set()
                raise
            finally:
                try:
                    cache.delete(owner_key)
                except Exception:
                    pass
                with self._lock:
                    self._local_events.pop(key, None)
                    # keep result briefly for late waiters
                    threading.Timer(2.0, lambda: self._local_results.pop(key, None)).start()

        # Waiter path — local event first, then poll shared cache via fn's side effects
        deadline = time.time() + wait_seconds
        while time.time() < deadline:
            with self._lock:
                if key in self._local_results:
                    return self._local_results[key]
                event = self._local_events.get(key)
            if event is not None:
                event.wait(timeout=min(0.5, max(0.05, deadline - time.time())))
                with self._lock:
                    if key in self._local_results:
                        return self._local_results[key]
            else:
                time.sleep(0.15)
            # Owner finished elsewhere (other worker) — caller should re-check cache
            try:
                if cache.get(owner_key) is None:
                    break
            except Exception:
                break

        # Last resort: do the work ourselves (better than hanging forever)
        return fn()


_nira_circuit = CircuitBreaker('nira')
_nira_inflight = InflightLimiter('nira')
_nira_singleflight = SingleFlight('nira')


def nira_guarded(fn: Callable[[], T], *, coalesce_key: Optional[str] = None) -> T:
    """
    Run Nira-bound work under circuit + inflight limits (+ optional single-flight).
    """
    _nira_circuit.allow()

    def _execute() -> T:
        with _nira_inflight.slot(blocking=False):
            try:
                result = fn()
            except Exception as exc:
                # Only count transport / timeout style failures toward the circuit
                name = type(exc).__name__.lower()
                msg = str(exc).lower()
                if 'timeout' in name or 'timeout' in msg or 'connection' in name:
                    _nira_circuit.record_failure()
                raise
            return result

    if coalesce_key:
        result = _nira_singleflight.run(coalesce_key, _execute, wait_seconds=float(_cfg('NIRA_API_TIMEOUT', 15)) + 5)
    else:
        result = _execute()

    # Soft success recording for dict-shaped Nira results
    if isinstance(result, dict) and result.get('success') is False:
        err = str(result.get('error') or '').lower()
        if 'timeout' in err or 'connection' in err or result.get('code') in {
            'NIRA_CIRCUIT_OPEN',
            'NIRA_OVERLOADED',
        }:
            _nira_circuit.record_failure()
        # Do not treat auth/config errors as circuit failures
    else:
        _nira_circuit.record_success()
    return result


def nira_soft_error(exc: BaseException) -> dict:
    if isinstance(exc, CircuitOpenError):
        return {
            'success': False,
            'code': 'NIRA_CIRCUIT_OPEN',
            'error': 'سیستم فروش موقتاً تحت فشار است. چند لحظه دیگر دوباره تلاش کنید.',
            'retry_after': int(exc.retry_after),
            'degraded': True,
        }
    if isinstance(exc, OverloadedError):
        return {
            'success': False,
            'code': 'NIRA_OVERLOADED',
            'error': 'تعداد درخواست‌های همزمان زیاد است. لطفاً چند ثانیه صبر کنید.',
            'retry_after': int(exc.retry_after),
            'degraded': True,
        }
    return {
        'success': False,
        'code': 'NIRA_ERROR',
        'error': str(exc),
        'degraded': True,
    }
