#!/usr/bin/env bash
# Build React + collect Django static files for Railway / production.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing frontend deps"
cd frontend
if [ -f package-lock.json ]; then
  npm ci --prefer-offline
else
  npm install
fi

echo "==> Building React (production)"
npm run build
cd "$ROOT"

echo "==> Preparing staticfiles"
mkdir -p staticfiles
if [ -f frontend/build/index.html ]; then
  cp -f frontend/build/index.html staticfiles/index.html
fi
if [ -d frontend/build/images ]; then
  mkdir -p staticfiles/images
  cp -R frontend/build/images/. staticfiles/images/ || true
fi
if [ -d frontend/build/fonts ]; then
  mkdir -p staticfiles/fonts
  cp -R frontend/build/fonts/. staticfiles/fonts/ || true
fi

echo "==> collectstatic"
python manage.py collectstatic --noinput

echo "==> Build complete"
