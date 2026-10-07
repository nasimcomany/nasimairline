# Build React SPA, then run Django/Gunicorn (Runflare / any Docker host)
FROM node:20-bookworm AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --prefer-offline
COPY frontend/ ./
RUN npm run build

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

# Collect static at image build (dummy secrets; real values come from env at runtime)
RUN SECRET_KEY=build-only-not-for-runtime \
    DEBUG=False \
    ALLOWED_HOSTS=* \
    DB_SSL_REQUIRE=False \
    CELERY_TASK_ALWAYS_EAGER=True \
    python manage.py collectstatic --noinput \
    && mkdir -p /data/media

EXPOSE 8000
CMD ["bash", "bin/railway-start.sh"]
