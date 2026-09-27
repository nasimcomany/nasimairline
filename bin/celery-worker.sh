#!/usr/bin/env bash
# Start a Celery worker for one or more queues.
# Usage:
#   QUEUE=notify CONCURRENCY=2 bash bin/celery-worker.sh
#   QUEUE=nira,default CONCURRENCY=2 bash bin/celery-worker.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

QUEUE="${QUEUE:-default}"
CONCURRENCY="${CONCURRENCY:-2}"
LOGLEVEL="${CELERY_LOGLEVEL:-info}"
HOSTNAME_SUFFIX="${WORKER_NAME:-${QUEUE%%,*}}"

echo "==> Celery worker queues=${QUEUE} concurrency=${CONCURRENCY}"
exec celery -A nasim worker \
  --loglevel="${LOGLEVEL}" \
  --queues="${QUEUE}" \
  --concurrency="${CONCURRENCY}" \
  --prefetch-multiplier="${CELERY_PREFETCH:-1}" \
  --max-tasks-per-child="${CELERY_MAX_TASKS_PER_CHILD:-200}" \
  --hostname="nasim-${HOSTNAME_SUFFIX}@%h"
