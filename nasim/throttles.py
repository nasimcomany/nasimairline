"""
Per-client request ceilings for the public API.

Anonymous traffic is counted by a proxy-aware address. Logged-in traffic is
counted by account, so one shared office network does not share a single bucket.
Sensitive routes add a tighter scope on top of the default ceiling.
"""
from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle, UserRateThrottle


def client_ip(request) -> str:
    """
    Address used for anonymous limits.

    Cloudflare's connecting IP is set by the edge. Otherwise use the address
    the reverse proxy appended (right-most X-Forwarded-For), then REMOTE_ADDR.
    The left-most forwarded address is not used, because the browser can change it.
    """
    cf = (request.META.get('HTTP_CF_CONNECTING_IP') or '').strip()
    if cf:
        return cf[:64]
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR') or ''
    parts = [part.strip() for part in forwarded.split(',') if part.strip()]
    if parts:
        return parts[-1][:64]
    return (request.META.get('REMOTE_ADDR') or 'unknown')[:64]


class AnonIpThrottle(AnonRateThrottle):
    """Default ceiling for visitors who are not logged in."""

    def get_ident(self, request):
        return client_ip(request)


class UserAccountThrottle(UserRateThrottle):
    """Default ceiling for a logged-in account."""


class _ScopedIpThrottle(SimpleRateThrottle):
    """Tighter ceiling keyed by client address, including on login routes."""

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': client_ip(request)}


class AuthIpThrottle(_ScopedIpThrottle):
    scope = 'auth'


class AuthHourThrottle(_ScopedIpThrottle):
    scope = 'auth_hour'


class PasswordResetIpThrottle(_ScopedIpThrottle):
    scope = 'password_reset'


class PasswordResetHourThrottle(_ScopedIpThrottle):
    scope = 'password_reset_hour'


class NiraSearchThrottle(_ScopedIpThrottle):
    scope = 'nira_search'


class NiraReadThrottle(_ScopedIpThrottle):
    scope = 'nira_read'


class PublicFormThrottle(_ScopedIpThrottle):
    scope = 'public_form'


class ChatSendThrottle(_ScopedIpThrottle):
    scope = 'chat_send'
