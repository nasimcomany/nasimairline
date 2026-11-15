# راهنمای بارگذاری تغییرات روی سرور (Deploy)

این سند می‌گوید وقتی کار توسعه روی لوکال تمام شد، **گام‌به‌گام** چطور تغییرات را روی سرور ببرید.

پروژه برای **Railway** پیکربندی شده (`railway.toml`, `Procfile`, `bin/railway-*.sh`).  
اگر سرور جدا (VPS) دارید، بخش «مسیر B» را ببینید.

راهنماهای مرتبط:
- اجرای لوکال: `docs/RUN_LOCAL_FA.md`
- کار روزمره و migration لوکال: `docs/DEV_WORKFLOW_FA.md`
- معماری Railway: `RAILWAY.md`

---

## تصویر کلی

```text
لوکال: کدنویسی → تست → commit → push
                ↓
سرور / Railway: build فرانت + collectstatic → migrate → Gunicorn (+ workers)
                ↓
چک health و تست دستی روی دامنه
```

**مهم:** در پروداکشن فرانت با `npm start` بالا نمی‌آید.  
در build، React ساخته می‌شود و Django همان `frontend/build` را با WhiteNoise/Gunicorn سرو می‌کند.

---

## بخش ۰ — قبل از هر Deploy (چک‌لیست لوکال)

روی ماشین خودتان این‌ها را انجام دهید:

### ۱) تست کنید که کار می‌کند

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\venv\Scripts\Activate.ps1
python manage.py check
python manage.py migrate
.\start-dev.ps1
```

سناریوی تغییر را روی http://localhost:3000 و در صورت نیاز `/admin` تست کنید.

### ۲) اگر مدل عوض شده، migration ساخته و اعمال شده باشد

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
```

فایل‌های جدید داخل `*/migrations/*.py` را **حتماً commit** کنید.  
بدون این فایل‌ها، سرور اسکیما را بلد نیست.

### ۳) چیزی که نباید آپلود / commit شود

| مورد | چرا |
|------|-----|
| `.env` لوکال | رمز DB و SECRET لوکال — در سرور جدا تنظیم می‌شود |
| `venv/` | روی سرور از نو نصب می‌شود |
| `node_modules/` | روی سرور/CI از نو نصب می‌شود |
| `frontend/build/` | معمولاً در build سرور ساخته می‌شود (gitignore) |
| `staticfiles/` | در build سرور ساخته می‌شود (gitignore) |
| `__pycache__/`, `.pyc` | بی‌فایده |

### ۴) چیزی که باید برود روی سرور (از طریق Git)

- کد Python / React
- `requirements.txt` (اگر پکیج جدید اضافه کردید)
- `frontend/package.json` + `package-lock.json`
- فایل‌های **migration** جدید
- تغییرات `settings` / اسکریپت‌های `bin/` در صورت نیاز

### ۵) Commit تمیز

```powershell
git status
git add .
# دقت: .env را add نکنید (باید در gitignore باشد)
git commit -m "توضیح کوتاه تغییر"
```

اگر هنوز remote ندارید، اول ریپو را به GitHub/GitLab/Origin وصل کنید؛ Deploy معمولاً با **push به برنچ اصلی** شروع می‌شود.

---

## مسیر A — Deploy روی Railway (پیشنهادی این پروژه)

### A1) یک‌بار: آماده‌بودن سرویس‌ها

در داشبورد Railway باید تقریباً این‌ها باشد (جزئیات: `RAILWAY.md`):

| سرویس | نقش |
|--------|------|
| **web** | Gunicorn + API + SPA |
| **PostgreSQL** | `DATABASE_URL` |
| **Redis** | `REDIS_URL` (برای Celery) |
| **worker-*** | صف‌های nira / notify / sms / default |
| **beat** | کارهای زمان‌بندی‌شده |
| **Volume** (پیشنهادی) | مثلاً `/data` برای `MEDIA_ROOT` |

### A2) متغیرهای محیطی Production (Variables)

روی سرویس web (و در صورت نیاز workers) تنظیم کنید — **نه** فایل `.env` لوکال:

| متغیر | توضیح |
|--------|--------|
| `SECRET_KEY` | قوی و یکتا (نه مقدار لوکال) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | دامنه(ها)، مثلاً `nasimairlines.com,www.nasimairlines.com` |
| `CSRF_TRUSTED_ORIGINS` | با `https://` مثل `https://nasimairlines.com` |
| `DATABASE_URL` | معمولاً با لینک Postgres خودکار |
| `REDIS_URL` | معمولاً با لینک Redis خودکار |
| `MEDIA_ROOT` | مثلاً `/data/media` اگر Volume دارید |

اختیاری ولی عملیاتی:

- `NIRA_BASE_URL`, `NIRA_OFFICE_USER`, `NIRA_OFFICE_PASS`
- `NIRA_PAYMENT_REDIRECT_URL`, `NIRA_CALLBACK_SECRET`
- `EMAIL_*` یا سرویس ایمیل
- `MELLIPAYAMAK_*`, `TELEGRAM_*`, `WEATHER_API_KEY`
- `PUBLIC_SITE_URL` / `ADMIN_BASE_URL`

### A3) بارگذاری تغییرات (هر بار بعد از اتمام کار)

```text
1. لوکال تست شد
2. git commit
3. git push   ← به برنچی که Railway به آن وصل است (معمولاً main)
4. Railway خودکار: build → migrate → start
```

```powershell
git push origin main
```

(نام برنچ را با تنظیم Railway خودتان یکی کنید.)

### A4) Railway در build چه می‌کند؟

طبق `bin/railway-build.sh` و `railway.toml`:

1. `npm ci` / `npm install` در `frontend`
2. `npm run build`
3. کپی `index.html` و assets به `staticfiles`
4. `python manage.py collectstatic --noinput`

طبق `bin/railway-start.sh` و `Procfile`:

1. `python manage.py migrate --noinput`
2. `populate_site_defaults` (در صورت خطا ادامه می‌دهد)
3. اجرای **Gunicorn**

`Procfile` همچنین خط `release: migrate` دارد.

### A5) بعد از Deploy — چک اجباری

1. لاگ Deploy در Railway را بخوانید (خطای build / migrate).
2. Health:

   ```text
   https://YOUR-DOMAIN/healthz/
   ```

   باید حدوداً `database=ok` و وضعیت ۲۰۰ باشد.

3. سایت و چند API را دستی تست کنید:
   - صفحه اصلی
   - یک API محتوا (مثلاً مجله / گالری)
   - لاگین / ادمین در صورت تغییر auth
   - اگر تغییر فروش بوده: جستجو / رزرو (با Nira)

4. اگر فقط worker عوض شده، مطمئن شوید سرویس‌های worker هم redeploy شده‌اند.

### A6) اگر فقط متغیر env عوض شد (بدون کد)

در Railway فقط Variable را عوض کنید و سرویس را **Redeploy** کنید.  
Push کد لازم نیست؛ ولی Gunicorn باید ری‌استارت شود تا env جدید را بگیرد.

---

## مسیر B — سرور VPS / هاست لینوکس (دستی یا با Git)

فرض: روی سرور Python، Node، Postgres، Nginx (اختیاری)، و کلون پروژه دارید.

### B1) اتصال و گرفتن کد جدید

```bash
ssh user@YOUR-SERVER
cd /path/to/nasimairline

# بکاپ سریع دیتابیس (قبل از migrate پرخطر)
# pg_dump ... 

git pull origin main
```

### B2) محیط Python

```bash
source venv/bin/activate   # یا مسیر venv سرور
pip install -r requirements.txt
```

### B3) Build فرانت + static

```bash
cd frontend
npm ci          # یا npm install
npm run build
cd ..

# اگر اسکریپت پروژه را دارید:
bash bin/railway-build.sh
# یا دستی:
python manage.py collectstatic --noinput
```

می‌توانید از `python build_frontend.py` هم استفاده کنید اگر در سرور موجود و سازگار است.

### B4) Migration روی دیتابیس سرور

```bash
# حتماً با همان .env / env پروداکشن
export $(grep -v '^#' .env | xargs)   # اگر از فایل env استفاده می‌کنید — با احتیاط

python manage.py migrate --noinput
python manage.py showmigrations
python manage.py check --deploy
```

### B5) ری‌استارت سرویس‌ها

بسته به نحوه اجرا:

```bash
# نمونه systemd
sudo systemctl restart nasim-web
sudo systemctl restart nasim-worker-nira
sudo systemctl restart nasim-worker-notify
# ...

# یا اگر supervisor / docker compose
docker compose pull && docker compose up -d --build
```

اگر فقط Gunicorn دستی است:

```bash
pkill -f gunicorn   # فقط اگر مطمئنید
gunicorn nasim.wsgi:application -c gunicorn.conf.py
```

Celery workers و beat را هم ری‌استارت کنید تا کد جدید را بردارند.

### B6) Nginx / دامنه

اگر Nginx جلوی اپ است، بعد از تغییر static گاهی:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Migration روی سرور — نکات حیاتی

| نکته | توضیح |
|------|--------|
| فایل migration را از لوکال بفرستید | روی سرور معمولاً **فقط** `migrate` بزنید، نه `makemigrations` |
| بکاپ قبل از migrate سنگین | مخصوصاً حذف فیلد / تغییر نوع |
| ترتیب | اول کد + فایل‌های migration، بعد `migrate`، بعد ری‌استارت |
| چند سرویس | همه باید نسخه کد یکسان داشته باشند؛ وگرنه worker با مدل قدیمی می‌ترکد |
| شکست migrate | Deploy را موفق فرض نکنید؛ لاگ را بخوانید و قبل از ترافیک درست کنید |
| Seed | `populate_site_defaults` در start اسکریپت Railway هست؛ روی VPS در صورت نیاز دستی بزنید |

### دستورات خلاصه DB روی سرور

```bash
python manage.py showmigrations
python manage.py migrate --noinput
python manage.py migrate نام_اپ شماره   # فقط در شرایط خاص / rollback آگاهانه
```

**برگشت migration روی پروداکشن خطرناک است** — فقط با بکاپ و طرح مشخص.

---

## اگر فرانت و بک‌اند را جدا Deploy می‌کنید

در این پروژه طراحی پیش‌فرض **یکپارچه** است (SPA داخل Django).  
اگر روزی فرانت جدا (CDN/هاست دیگر) باشد:

1. در CI فرانت: `npm run build` با `REACT_APP_API_URL=https://api.yourdomain.com/api`
2. بک‌اند جدا migrate + gunicorn
3. CORS و `CSRF_TRUSTED_ORIGINS` را برای دامنه فرانت تنظیم کنید

فعلاً برای همین ریپو، همان مسیر Railway/VPS یکپارچه کافی است.

---

## چک‌لیست نهایی هر Deploy

- [ ] لوکال تست شد
- [ ] migrationهای جدید commit شده‌اند
- [ ] `.env` لوکال push نشده
- [ ] `requirements.txt` / `package-lock.json` در صورت تغییر وابستگی به‌روز است
- [ ] `git push` (یا آپلود معادل)
- [ ] Build بدون خطا تمام شد
- [ ] `migrate` روی سرور OK
- [ ] `/healthz/` سبز است
- [ ] صفحه اصلی و مسیرهای کلیدی OK
- [ ] اگر تغییر Nira/پرداخت بود → تست smoke روی دامنه واقعی
- [ ] workers/beat در صورت نیاز ری‌استارت/سالخورده نیستند

---

## مشکلات رایج بعد از Deploy

| مشکل | احتمال علت | کار |
|------|------------|-----|
| صفحه سفید | build فرانت / collectstatic ناقص | لاگ build؛ وجود `frontend/build` در pipeline |
| 500 بعد از آپدیت | migrate نخورده یا env غلط | لاگ Gunicorn؛ `showmigrations` |
| استاتیک / CSS قدیمی | کش CDN یا collectstatic | Hard refresh؛ دوباره collectstatic |
| CORS / CSRF | دامنه در ALLOWED_HOSTS / CSRF نیست | Variables را درست کنید |
| ایمیل/SMS کار نمی‌کند | worker یا Redis پایین | وضعیت Redis و worker-notify/sms |
| جستجوی پرواز خالی | `NIRA_*` روی سرور نیست | Variables نیرا |

---

## گردش خلاصه (چاپ دیواری)

```text
۱. لوکال تمام و تست شد
۲. makemigrations (اگر مدل عوض شد) + commit فایل migration
۳. git push
۴. منتظر build سرور / در VPS: pull → pip/npm → build → collectstatic → migrate → restart
۵. چک /healthz/ و چند کلیک واقعی روی سایت
۶. اگر خراب بود: لاگ بخوان، در صورت نیاز revert commit و redeploy (با بکاپ DB)
```

---

## امنیت — یادآوری کوتاه

- `DEBUG=False` روی سرور
- `SECRET_KEY` جدا از لوکال
- رمز DB و کلیدهای Nira را فقط در Variables/Secrets سرور نگه دارید
- ادمین پیش‌فرض لوکال را روی پروداکشن عیناً کپی نکنید؛ کاربر ادمین پروداکشن جدا بسازید

اگر هنوز دامنه / پنل Railway شما نهایی نشده، اول دسترسی Git remote و Variables را از کارفرما بگیرید؛ بدون آن‌ها «بارگذاری روی سرور» کامل نمی‌شود.
