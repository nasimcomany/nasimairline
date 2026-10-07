# Build React SPA, then run Django/Gunicorn (Runflare / any Docker host)
FROM node:20-bookworm AS frontend
WORKDIR /app/frontend

ENV NODE_OPTIONS=--max-old-space-size=2048 \
    CI=true \
    GENERATE_SOURCEMAP=false \
    npm_config_audit=false \
    npm_config_fund=false

COPY frontend/package.json frontend/package-lock.json frontend/.npmrc ./
# npm ci is strict; fall back to npm install if lock/platform mismatch
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY frontend/ ./
RUN npm run build \
    && test -f build/index.html

FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /app/frontend/build ./frontend/build

RUN SECRET_KEY=build-only-not-for-runtime \
    DEBUG=False \
    ALLOWED_HOSTS=* \
    DB_SSL_REQUIRE=False \
    CELERY_TASK_ALWAYS_EAGER=True \
    python manage.py collectstatic --noinput \
    && mkdir -p /data/media

EXPOSE 8000
CMD ["bash", "bin/railway-start.sh"]
