"""
Gunicorn config for Nasim Air production (Runflare / Railway / VPS).

Goals:
- enough concurrency for HTTP without OOM
- recycle workers to avoid memory leaks
- timeouts above Nira read budget but short enough that hung calls can't pin forever
- leave spare threads for SPA / healthz while Nira searches run
"""
import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# CPU-ish default, capped for typical container memory plans
_cpu = multiprocessing.cpu_count() or 2
workers = int(os.environ.get('WEB_CONCURRENCY', max(2, min(4, _cpu + 1))))
# More threads: Nira is I/O-bound; SPA/static/health must not wait behind searches
threads = int(os.environ.get('GUNICORN_THREADS', '4'))
worker_class = os.environ.get('GUNICORN_WORKER_CLASS', 'gthread')

# Must stay ABOVE NIRA_API_TIMEOUT (+ connect) but BELOW typical reverse-proxy idle limits
timeout = int(os.environ.get('GUNICORN_TIMEOUT', '45'))
graceful_timeout = int(os.environ.get('GUNICORN_GRACEFUL_TIMEOUT', '25'))
keepalive = int(os.environ.get('GUNICORN_KEEPALIVE', '5'))

# Recycle to limit RSS growth (mitigate OOM killer)
max_requests = int(os.environ.get('GUNICORN_MAX_REQUESTS', '600'))
max_requests_jitter = int(os.environ.get('GUNICORN_MAX_REQUESTS_JITTER', '60'))

accesslog = '-'
errorlog = '-'
loglevel = os.environ.get('GUNICORN_LOG_LEVEL', 'info')
capture_output = True
preload_app = os.environ.get('GUNICORN_PRELOAD', 'false').lower() in ('1', 'true', 'yes')

# Faster, more reliable worker heartbeats on some container filesystems
worker_tmp_dir = os.environ.get('GUNICORN_WORKER_TMP_DIR', '/dev/shm')
if not os.path.isdir(worker_tmp_dir):
    worker_tmp_dir = None

# Forwarded headers behind reverse proxy
forwarded_allow_ips = '*'
secure_scheme_headers = {'X-FORWARDED-PROTO': 'https'}
