# Use prebuilt React SPA (built in CI/local) + Django/Gunicorn
# Runflare build agents often cancel CRA `npm run build` (memory/time).
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

# Frontend must already exist at frontend/build (committed for deploy).
# Runflare does NOT run `npm run build` here — only collectstatic from this folder.
# Fail fast if SPA is missing or still the pre-branding bundle.
RUN test -f frontend/build/index.html \
    && grep -R --include='*.js' -l '02173490000' frontend/build/static/js >/dev/null \
    && SECRET_KEY=build-only-not-for-runtime \
       DEBUG=False \
       ALLOWED_HOSTS=* \
       DB_SSL_REQUIRE=False \
       CELERY_TASK_ALWAYS_EAGER=True \
       python manage.py collectstatic --noinput \
    && mkdir -p staticfiles \
    && for f in favicon.ico favicon-16.png favicon-32.png favicon-48.png favicon-64.png \
         apple-touch-icon.png logo192.png logo512.png manifest.json index.html; do \
         if [ -f "frontend/build/$f" ]; then cp -f "frontend/build/$f" "staticfiles/$f"; fi; \
       done \
    && if [ -d frontend/build/downloads ]; then cp -a frontend/build/downloads staticfiles/; fi \
    && mkdir -p /data/media

EXPOSE 8000
CMD ["bash", "bin/railway-start.sh"]
