# Railway — Nasim Air (production architecture)

## سرویس‌های لازم
| Service | نقش |
|---------|-----|
| **web** | Gunicorn (HTTP + API + SPA) |
| **PostgreSQL** | دیتابیس — لینک → `DATABASE_URL` |
| **Redis** | کش + Celery broker — لینک → `REDIS_URL` (**الزامی برای صف‌ها**) |
| **worker-nira** | صف `nira` — نیرا / گرم‌کردن کش پرواز |
| **worker-notify** | صف `notify` — ایمیل |
| **worker-sms** | صف `sms` — پیامک |
| **worker-default** | صف `default,critical` |
| **beat** | زمان‌بندی (گرم کردن لیست مبدا هر ۲ دقیقه) |
| **Volume** (پیشنهادی) | `/data` → `MEDIA_ROOT=/data/media` |

روی Railway برای هر worker یک سرویس جدا از همین ریپو بساز و Start Command را از `Procfile` کپی کن.

## معماری سرعت
- درخواست‌های وب **بلاک نمی‌شوند** روی ایمیل/پیامک (Celery)
- جستجوی پرواز **بدون** fan-out وضعیت لحظه‌ای (قبلاً باعث کندی/کیل ورکر می‌شد)
- کش مشترک Redis برای مبدا/مقصد (~۳ دقیقه) و availability کوتاه (~۴۵ ثانیه)
- Gunicorn: `gthread` + recycle (`max_requests`) برای جلوگیری از OOM
- Celery: `prefetch=1`, `acks_late`, سقف حافظه per-child

## متغیرهای اجباری
- `SECRET_KEY` قوی
- `DEBUG=False`
- `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL` (خودکار با لینک Postgres)
- `REDIS_URL` (خودکار با لینک Redis)

## Health
`GET /healthz/` → `database=ok` باید ۲۰۰ باشد.

## پرداخت نیرا (IBE)
وقتی شریک URL پرداخت را داد، در Variables بگذارید:
- `NIRA_PAYMENT_REDIRECT_URL` (با `{ref}` `{callback}` `{return_url}`)
- `NIRA_CALLBACK_SECRET` / `NIRA_CALLBACK_IPS` (اختیاری ولی توصیه‌شده)

Endpointهای پروداکشن:
- Callback: `/api/payments/nira/callback/`
- Return: `/payment/verify?provider=nira&ref=...`
- Status: `/api/payments/nira/status/?ref=...`

جزئیات: `NIRA_PARTNER_CHECKLIST.md`

## لوکال بدون Redis
Celery در حالت eager است (کارها inline اجرا می‌شوند). برای تست صف واقعی Redis لوکال بالا بیاور.
