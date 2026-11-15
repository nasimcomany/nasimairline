# راهنمای اجرای محلی پروژه نسیم ایر

این سند مرحله‌به‌مرحله است برای راه‌اندازی روی **ویندوز** با **PostgreSQL** و **React + Django**.

---

## پیش‌نیازها

| نرم‌افزار | حداقل | توضیح |
|-----------|--------|--------|
| Python | 3.11+ (در این سیستم 3.14 هم تست شد) | با venv |
| Node.js | 18+ | برای فرانت |
| PostgreSQL | 14+ | سرویس در حال اجرا |
| Git | اختیاری | — |

مسیر پروژه (نمونه):

```text
c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
```

---

## یک‌بار تنظیم اولیه

### ۱) رفتن به پوشه پروژه

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
```

### ۲) ساخت و فعال‌سازی محیط مجازی Python

اگر `venv` از قبل هست، فقط فعال کنید:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### ۳) نصب پکیج‌های بک‌اند

**حالت عادی (Python 3.11 / 3.12):**

```powershell
pip install -r requirements.txt
```

**اگر Python 3.14 دارید** (مثل این سیستم):  
`psycopg2-binary` نصب نمی‌شود. این کار را بکنید:

```powershell
# همه پکیج‌ها به‌جز psycopg2
Get-Content requirements.txt | Where-Object { $_ -notmatch 'psycopg2' } | Set-Content requirements_local.tmp.txt
pip install -r requirements_local.tmp.txt
pip install "psycopg[binary]"

# django-filter قدیمی با Python 3.14 خطا می‌دهد
pip install -U "django-filter>=24.3"
```

### ۴) ساخت دیتابیس PostgreSQL

رمز را موقع نصب Postgres گذاشته‌اید. نمونه با کاربر `postgres`:

```powershell
$env:PGPASSWORD = "رمز-شما"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE DATABASE nasim;"
```

اگر دیتابیس از قبل وجود دارد، این دستور خطا می‌دهد؛ مشکلی نیست.

> مسیر `psql` بسته به نسخه Postgres ممکن است `...\PostgreSQL\16\bin\psql.exe` باشد.

### ۵) ساخت فایل `.env` در ریشه پروژه

فایل: `nasimairline\.env`  
(این فایل در gitignore است و commit نمی‌شود.)

```env
SECRET_KEY=local-dev-nasim-change-me-please-32chars
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=nasim
DB_USER=postgres
DB_PASSWORD=رمز-شما
DB_HOST=localhost
DB_PORT=5432

EMAIL_USE_CONSOLE=1
```

اختیاری — برای جستجوی واقعی پرواز (API نیرا):

```env
NIRA_BASE_URL=...
NIRA_OFFICE_USER=...
NIRA_OFFICE_PASS=...
```

### ۶) ساخت جداول (migrate)

```powershell
.\venv\Scripts\Activate.ps1
python manage.py migrate
```

### ۷) ساخت کاربر ادمین

مدل کاربر با **ایمیل** لاگین می‌شود (`USERNAME_FIELD = email`):

```powershell
$env:DJANGO_SUPERUSER_PASSWORD="Admin123!"
python manage.py createsuperuser --noinput --email admin@nasim.local --first_name Admin --last_name Nasim
```

یا تعاملی:

```powershell
python manage.py createsuperuser
```

بعداً در پنل: http://127.0.0.1:8000/admin/

### ۸) Seed داده پیش‌فرض (اختیاری ولی مفید)

```powershell
python manage.py populate_homepage_sections
python manage.py populate_site_defaults
```

برای بازنویسی اجباری تصاویر/مجله:

```powershell
python manage.py populate_site_defaults --force
```

### ۹) آماده‌سازی فرانت

```powershell
cd frontend
npm install
npm install jspdf
```

> پکیج `jspdf` برای تولید PDF بلیط لازم است؛ اگر در `package.json` نبود، نصبش کنید تا `npm start` خطا ندهد.

فایل `frontend\.env`:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

برگشت به ریشه:

```powershell
cd ..
```

---

## هر بار اجرا (روزانه)

### روش آسان — اسکریپت پروژه

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\start-dev.ps1
```

دو پنجره باز می‌شود:

| سرویس | آدرس |
|--------|------|
| Django (API + ادمین) | http://127.0.0.1:8000 |
| React (UI زنده) | http://localhost:3000 |

برای کار روزانه UI معمولاً **http://localhost:3000** را باز کنید.

### روش دستی (دو ترمینال)

**ترمینال ۱ — بک‌اند:**

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\venv\Scripts\Activate.ps1
python manage.py runserver 8000
```

**ترمینال ۲ — فرانت:**

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline\frontend
npm start
```

### چک سلامت API

مرورگر یا PowerShell:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health/" -UseBasicParsing
```

پاسخ موفق تقریباً شبیه:

```json
{"status": "ok", "database": "ok", "cache": "ok", ...}
```

---

## فقط یک سرور (بدون hot-reload فرانت)

اگر بخواهید فرانت build شود و از همان Django سرو شود:

```powershell
.\venv\Scripts\Activate.ps1
cd frontend
npm run build
cd ..
python build_frontend.py
python manage.py collectstatic --noinput
python manage.py runserver 8000
```

بعد فقط: http://127.0.0.1:8000

---

## دستورات پرکاربرد

| کار | دستور |
|-----|--------|
| فعال‌سازی venv | `.\venv\Scripts\Activate.ps1` |
| ساخت جداول | `python manage.py migrate` |
| ساخت migration جدید | `python manage.py makemigrations` |
| ادمین جدید | `python manage.py createsuperuser` |
| seed صفحه اصلی | `python manage.py populate_homepage_sections` |
| seed مجله / خدمات ویژه | `python manage.py populate_site_defaults` |
| شل Django | `python manage.py shell` |
| چک پروژه | `python manage.py check` |
| فرانت | `cd frontend; npm start` |
| بک‌اند | `python manage.py runserver 8000` |

---

## مشکلات رایج

### Postgres روشن نیست

Services ویندوز → سرویس `postgresql-x64-...` باید **Running** باشد.

### خطای اتصال دیتابیس

- رمز / نام دیتابیس در `.env` را چک کنید.
- دیتابیس `nasim` ساخته شده باشد.

### `ModuleNotFoundError: No module named 'django'`

venv فعال نیست:

```powershell
.\venv\Scripts\Activate.ps1
```

### `psycopg2` / Python 3.14

همان بخش «نصب پکیج‌های بک‌اند» برای 3.14 را دنبال کنید (`psycopg` به‌جای `psycopg2`).

### `pkgutil.find_loader` / django-filter

```powershell
pip install -U "django-filter>=24.3"
```

### فرانت: `Can't resolve 'jspdf'`

```powershell
cd frontend
npm install jspdf
```

### پورت 8000 یا 3000 اشغال است

پروسس قبلی را ببندید یا پورت دیگر بدهید:

```powershell
python manage.py runserver 8001
```

### جستجوی پرواز خالی / خطا

بدون `NIRA_*` در `.env` جستجوی واقعی کار نمی‌کند؛ UI بالا می‌آید ولی داده پرواز از نیرا نمی‌آید.

---

## یادداشت محیط فعلی (خط مبنا)

اگر قبلاً با همین ماشین راه‌اندازی شده:

- دیتابیس: `nasim` / کاربر `postgres`
- ادمین نمونه: `admin@nasim.local` (رمز را خودتان موقع ساخت گذاشته‌اید)
- بک‌اند و فرانت با `start-dev.ps1` یا دو ترمینال بالا می‌آیند

---

## خلاصه خیلی کوتاه

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\venv\Scripts\Activate.ps1
# یک‌بار: migrate + createsuperuser + seed + npm install در frontend
.\start-dev.ps1
# باز کردن: http://localhost:3000
# ادمین:    http://127.0.0.1:8000/admin/
```
