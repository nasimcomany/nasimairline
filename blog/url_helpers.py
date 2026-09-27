"""
Public frontend URL helpers for blog SEO / sitemap.
"""
from django.conf import settings


def get_public_site_url(request=None):
    """
    Absolute origin for public pages (no trailing slash).
    Prefer PUBLIC_SITE_URL, then request host, then ADMIN_BASE_URL.
    """
    configured = (getattr(settings, 'PUBLIC_SITE_URL', '') or '').strip().rstrip('/')
    if configured:
        return configured
    if request is not None:
        return request.build_absolute_uri('/').rstrip('/')
    return (getattr(settings, 'ADMIN_BASE_URL', '') or 'http://127.0.0.1:8000').rstrip('/')


def absolute_public_url(path, request=None):
    """Join site origin with a frontend path like /magazine/foo."""
    if not path:
        path = '/'
    if path.startswith('http://') or path.startswith('https://'):
        return path
    if not path.startswith('/'):
        path = '/' + path
    return f"{get_public_site_url(request)}{path}"
