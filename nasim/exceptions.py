"""API error shaping. Kept out of throttles.py to avoid a settings import cycle."""
from rest_framework.exceptions import Throttled
from rest_framework.views import exception_handler


def throttled_exception_handler(exc, context):
    """Keep DRF errors, with a clear Persian message when a ceiling is hit."""
    response = exception_handler(exc, context)
    if response is not None and isinstance(exc, Throttled):
        wait = int(exc.wait or 60)
        response.data = {
            'detail': 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.',
            'retry_after': wait,
        }
        response['Retry-After'] = str(wait)
        _notify_sentry_once(context, wait)
    return response


def _notify_sentry_once(context, wait):
    """One Sentry warning per path per minute. A handled 429 is otherwise invisible."""
    try:
        from django.core.cache import cache
        import sentry_sdk

        request = context.get('request')
        path = (getattr(request, 'path', '') or '')[:180]
        if not cache.add(f'sentry-throttle:{path}', '1', timeout=60):
            return
        with sentry_sdk.push_scope() as scope:
            scope.set_extra('path', path)
            scope.set_extra('retry_after', wait)
            scope.fingerprint = ['api-rate-limit', path]
            sentry_sdk.capture_message('سقف درخواست API پر شد', level='warning')
    except Exception:
        return
