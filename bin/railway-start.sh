#!/usr/bin/env bash
# Start Gunicorn for Railway. Runs migrations first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Persistent volume if set; otherwise writable path inside the container
export MEDIA_ROOT="${MEDIA_ROOT:-/app/media}"
mkdir -p \
  "$MEDIA_ROOT/blog/articles" \
  "$MEDIA_ROOT/blog/uploads" \
  "$MEDIA_ROOT/homepage_sections" \
  "$MEDIA_ROOT/hero_slider"
echo "==> MEDIA_ROOT=$MEDIA_ROOT"

echo "==> Running migrations"
python manage.py migrate --noinput

echo "==> Seeding homepage defaults (Special Services + one-time Experience/FAQ brand images)"
python manage.py populate_site_defaults || true

echo "==> Starting gunicorn (config=gunicorn.conf.py)"
exec gunicorn nasim.wsgi:application -c gunicorn.conf.py
