#!/usr/bin/env bash
# Celery beat — schedule warmers (origins cache, etc.)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec celery -A nasim beat --loglevel="${CELERY_LOGLEVEL:-info}"
