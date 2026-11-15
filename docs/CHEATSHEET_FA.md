# برگه سریع نسیم ایر

جزئیات: `RUN_LOCAL_FA.md` | `DEV_WORKFLOW_FA.md` | `DEPLOY_TO_SERVER_FA.md`

---

## اجرا (هر روز)

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\venv\Scripts\Activate.ps1
.\start-dev.ps1
```

- سایت: http://localhost:3000
- API / ادمین: http://127.0.0.1:8000  و  `/admin/`
- سلامت: http://127.0.0.1:8000/api/health/

دستی: ترمینال۱ `python manage.py runserver 8000` — ترمینال۲ `cd frontend; npm start`

---

## بعد از تغییر کد

| تغییر | کار |
|--------|-----|
| React | ذخیره؛ گاهی `Ctrl+Shift+R` |
| views / API بدون DB | ذخیره؛ اگر نشد ری‌استارت `runserver` |
| `.env` / settings | ری‌استارت سرور |
| مدل / جدول | migration (پایین) |
| پکیج Python | `pip install` + ری‌استارت |
| پکیج npm | `npm install` + ری‌استارت فرانت |

ری‌استارت کامل: `Ctrl+C` در هر دو ترمینال → دوباره `.\start-dev.ps1`

---

## دیتابیس (migration)

```powershell
.\venv\Scripts\Activate.ps1
python manage.py makemigrations نام_اپ
python manage.py migrate
```

- فقط `models.py` عوض شد → migration لازم است
- فقط منطق API → migration لازم نیست
- فایل `migrations/*.py` را commit کنید
- روی سرور معمولاً **فقط** `migrate` (نه makemigrations)
- فیلد جدید روی داده موجود: `null=True` یا `default`
- قبل از migrate خطرناک: بکاپ Postgres

وضعیت: `python manage.py showmigrations`

---

## بارگذاری روی سرور

```text
لوکال تست → commit (با migration) → git push
سرور: build فرانت + collectstatic + migrate + restart
چک: /healthz/ و چند کلیک روی دامنه
```

Railway: push به برنچ متصل → خودش build/migrate/gunicorn.

VPS خلاصه:

```bash
git pull
pip install -r requirements.txt
cd frontend && npm ci && npm run build && cd ..
python manage.py collectstatic --noinput
python manage.py migrate --noinput
# restart gunicorn + celery workers
```

نفرستید: `.env` لوکال، `venv`، `node_modules`

پروداکشن: `DEBUG=False` — `SECRET_KEY` جدا — Variables سرور جدا از لوکال

---

## آدرس‌های لوکال

| چیز | کجا |
|-----|-----|
| کنترلر | `*/views.py` |
| مدل / DB | `*/models.py` + `nasim/settings.py` + `.env` |
| URL | `nasim/urls.py` و `*/urls.py` |
| فرانت API | `frontend/src/services/` |

جستجوی پرواز واقعی بدون `NIRA_*` در `.env` کار نمی‌کند.
