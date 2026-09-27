"""
Views for serving React frontend and ops health checks
"""
from django.views.generic import View
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import connection
import os
import urllib.request


class HealthCheckView(View):
    """Railway / uptime health endpoint — no auth, no SPA redirect."""

    def get(self, request, *args, **kwargs):
        from django.conf import settings as dj_settings
        from django.core.cache import cache

        db_ok = False
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
            db_ok = True
        except Exception as exc:
            db_error = str(exc)

        cache_ok = True
        try:
            cache.set('healthz_ping', '1', 5)
            cache_ok = cache.get('healthz_ping') == '1'
        except Exception:
            cache_ok = False

        redis_configured = bool(getattr(dj_settings, 'CELERY_BROKER_URL', '') and
                                not str(getattr(dj_settings, 'CELERY_BROKER_URL', '')).startswith('memory'))

        # Degraded cache must NOT take the site down — only DB is critical for 200
        payload = {
            'status': 'ok' if db_ok else 'degraded',
            'database': 'ok' if db_ok else 'error',
            'cache': 'ok' if cache_ok else 'degraded',
            'broker': 'redis' if redis_configured else 'eager/memory',
            'debug': bool(settings.DEBUG),
        }
        if db_error and settings.DEBUG:
            payload['database_error'] = db_error

        return JsonResponse(payload, status=200 if db_ok else 503)


class ReactAppView(View):
    """
    Serve React app for SPA routes.

    In DEBUG: if React dev server (npm start :3000) is running,
    redirect there so you get hot-reload without npm run build.
    Otherwise fall back to frontend/build/index.html.
    """

    def get(self, request, *args, **kwargs):
        # Live React during development — no rebuild needed
        if getattr(settings, 'DEBUG', False):
            react_dev = getattr(settings, 'REACT_DEV_SERVER', 'http://127.0.0.1:3000').rstrip('/')
            try:
                urllib.request.urlopen(react_dev, timeout=0.4)
                target = f'{react_dev}{request.get_full_path()}'
                return HttpResponseRedirect(target)
            except Exception:
                pass  # React not running — use production build below

        candidates = [
            os.path.join(settings.FRONTEND_BUILD_DIR, 'index.html'),
            os.path.join(settings.STATIC_ROOT, 'index.html'),
            os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html'),
        ]
        for index_path in candidates:
            if index_path and os.path.exists(index_path):
                with open(index_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                response = HttpResponse(content, content_type='text/html')
                response['Cache-Control'] = 'no-cache'
                return response

        return HttpResponse(
            '<h1>Frontend not ready</h1>'
            '<p>برای توسعه زنده این دو را با هم اجرا کنید:</p>'
            '<ol>'
            '<li><code>cd frontend && npm start</code> (پورت 3000)</li>'
            '<li><code>python manage.py runserver</code> (پورت 8000)</li>'
            '</ol>'
            '<p>یا برای نسخهٔ بیلد: <code>cd frontend && npm run build</code></p>',
            content_type='text/html; charset=utf-8',
            status=503,
        )
