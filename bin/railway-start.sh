#!/usr/bin/env bash
# Start Gunicorn for Railway. Runs migrations first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Ensuring media directories exist"
mkdir -p "${MEDIA_ROOT:-/data/media}" \
  "${MEDIA_ROOT:-/data/media}/blog/articles" \
  "${MEDIA_ROOT:-/data/media}/blog/uploads" \
  "${MEDIA_ROOT:-/data/media}/homepage_sections" \
  "${MEDIA_ROOT:-/data/media}/hero_slider" || true

echo "==> Running migrations"
python manage.py migrate --noinput

echo "==> Seeding Special Services defaults + missing magazine articles (hero/experience untouched)"
python manage.py populate_site_defaults || true

echo "==> Starting gunicorn (config=gunicorn.conf.py)"
exec gunicorn nasim.wsgi:application -c gunicorn.conf.py
