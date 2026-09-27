"""
Gunicorn config for Nasim Air production (Railway / VPS).

Goals:
- enough concurrency for HTTP without OOM
- recycle workers to avoid memory leaks
- timeouts shorter than proxy so hung Nira calls don't pin workers forever
"""
import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# CPU-ish default, capped for Railway memory plans
_cpu = multiprocessing.cpu_count() or 2
workers = int(os.environ.get('WEB_CONCURRENCY', max(2, min(4, _cpu + 1))))
threads = int(os.environ.get('GUNICORN_THREADS', '2'))
worker_class = os.environ.get('GUNICORN_WORKER_CLASS', 'gthread')

timeout = int(os.environ.get('GUNICORN_TIMEOUT', '60'))
graceful_timeout = int(os.environ.get('GUNICORN_GRACEFUL_TIMEOUT', '30'))
keepalive = int(os.environ.get('GUNICORN_KEEPALIVE', '5'))

# Recycle to limit RSS growth (mitigate OOM killer)
max_requests = int(os.environ.get('GUNICORN_MAX_REQUESTS', '800'))
max_requests_jitter = int(os.environ.get('GUNICORN_MAX_REQUESTS_JITTER', '80'))

accesslog = '-'
errorlog = '-'
loglevel = os.environ.get('GUNICORN_LOG_LEVEL', 'info')
capture_output = True
preload_app = os.environ.get('GUNICORN_PRELOAD', 'false').lower() in ('1', 'true', 'yes')

# Forwarded headers behind Railway / reverse proxy
forwarded_allow_ips = '*'
secure_scheme_headers = {'X-FORWARDED-PROTO': 'https'}
