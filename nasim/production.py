"""
Production / Railway helpers for nasim settings.
Keep this file free of Django model imports.
"""
from __future__ import annotations

import os
from typing import Iterable, List


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def env_csv(name: str, default: str = '') -> List[str]:
    raw = os.environ.get(name, default)
    return [part.strip() for part in raw.split(',') if part.strip()]


def strip_host(value: str) -> str:
    value = value.strip()
    for prefix in ('https://', 'http://'):
        if value.startswith(prefix):
            value = value[len(prefix):]
    return value.split('/')[0].strip()


def build_allowed_hosts(base: Iterable[str]) -> List[str]:
    hosts = [strip_host(h) for h in base if h and strip_host(h)]
    for key in ('RAILWAY_PUBLIC_DOMAIN', 'RAILWAY_STATIC_URL', 'PUBLIC_HOST', 'CLOUDFLARE_HOST'):
        val = os.environ.get(key, '').strip()
        if val:
            hosts.append(strip_host(val))
    # Railway default domains
    if os.environ.get('RAILWAY_ENVIRONMENT') or os.environ.get('RAILWAY_PROJECT_ID'):
        hosts.extend(['.up.railway.app', '.railway.app'])
    # Official Nasim public domains (Cloudflare / production)
    hosts.extend([
        'nasimairlines.com',
        'www.nasimairlines.com',
        'nasimairlines.ir',
        'www.nasimairlines.ir',
        '.nasimairlines.com',
        '.nasimairlines.ir',
    ])
    # de-dupe, preserve order
    seen = set()
    out: List[str] = []
    for h in hosts:
        if h not in seen:
            seen.add(h)
            out.append(h)
    return out or ['localhost', '127.0.0.1']


def build_csrf_trusted_origins(hosts: Iterable[str], extra: Iterable[str]) -> List[str]:
    origins = [o.strip().rstrip('/') for o in extra if o and o.strip()]
    for host in hosts:
        clean = strip_host(host)
        # Skip wildcard-style entries like ".up.railway.app"
        if not clean or clean.startswith('.'):
            continue
        if clean in ('localhost', '127.0.0.1'):
            origins.append(f'http://{clean}')
            origins.append(f'http://{clean}:8000')
            origins.append(f'http://{clean}:3000')
        else:
            origins.append(f'https://{clean}')
            origins.append(f'http://{clean}')
    seen = set()
    out: List[str] = []
    for o in origins:
        if o not in seen:
            seen.add(o)
            out.append(o)
    return out
