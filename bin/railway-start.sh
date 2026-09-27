#!/usr/bin/env bash
# Start Gunicorn for Railway. Runs migrations first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Running migrations"
python manage.py migrate --noinput

echo "==> Starting gunicorn (config=gunicorn.conf.py)"
exec gunicorn nasim.wsgi:application -c gunicorn.conf.py
