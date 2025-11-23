# راهنمای Build و Deploy فرانت‌اند با Django

## 🎯 هدف
فرانت‌اند React به صورت کامل در Django serve می‌شود و در localhost و production هر دو کار می‌کند.

## 📋 مراحل Setup

### 1. Build کردن فرانت‌اند

```bash
cd frontend
npm install  # اگر نصب نشده
npm run build
```

این کار یک پوشه `build` در `frontend` می‌سازه که شامل تمام فایل‌های static هست.

### 2. Collect Static Files در Django

```bash
# در پوشه اصلی پروژه
python manage.py collectstatic --noinput
```

این کار فایل‌های static از React build رو به `staticfiles` کپی می‌کنه.

### 3. تنظیمات `.env` برای Production

در فایل `.env` (یا environment variables در production):

```env
DEBUG=False  # در production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### 4. اجرای Django

```bash
python manage.py runserver
```

حالا می‌تونی بری `http://127.0.0.1:8000` و فرانت‌اند رو ببینی!

## 🔧 نحوه کار

### در Development:
1. React build می‌شه (`npm run build`)
2. Django static files رو collect می‌کنه (`collectstatic`)
3. Django همه routes رو به React app می‌ده (SPA)
4. API calls به `/api/` می‌رن

### در Production:
1. همین مراحل رو انجام می‌دی
2. از WSGI server استفاده می‌کنی (مثل Gunicorn)
3. از Nginx برای serve کردن static files استفاده می‌کنی (اختیاری)

## 📝 Script برای Build خودکار

می‌تونی یک script بسازی که همه کارها رو خودکار کنه:

### Windows (build.bat):
```batch
@echo off
echo Building React frontend...
cd frontend
call npm run build
cd ..
echo Collecting static files...
python manage.py collectstatic --noinput
echo Done! You can now run: python manage.py runserver
```

### Linux/Mac (build.sh):
```bash
#!/bin/bash
echo "Building React frontend..."
cd frontend
npm run build
cd ..
echo "Collecting static files..."
python manage.py collectstatic --noinput
echo "Done! You can now run: python manage.py runserver"
```

## 🚀 Deploy روی Host Django

### 1. فایل‌ها رو آپلود کن:
- کل پروژه (به جز `node_modules` و `venv`)
- فایل‌های `.env` (با تنظیمات production)

### 2. در سرور:
```bash
# نصب dependencies
pip install -r requirements.txt

# Build React
cd frontend
npm install
npm run build
cd ..

# Collect static
python manage.py collectstatic --noinput

# Migrate
python manage.py migrate

# Run server (یا از Gunicorn استفاده کن)
python manage.py runserver 0.0.0.0:8000
```

### 3. با Gunicorn (توصیه می‌شه):
```bash
pip install gunicorn
gunicorn nasim.wsgi:application --bind 0.0.0.0:8000
```

## ⚙️ تنظیمات Nginx (اختیاری اما توصیه می‌شه)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve static files
    location /static/ {
        alias /path/to/your/project/staticfiles/;
    }

    # Serve media files
    location /media/ {
        alias /path/to/your/project/media/;
    }

    # Proxy API requests to Django
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Serve React app for all other routes
    location / {
        try_files $uri $uri/ /static/index.html;
    }
}
```

## 🔍 Troubleshooting

### مشکل: صفحه سفید نمایش داده می‌شه
**راه‌حل:**
1. چک کن که `npm run build` اجرا شده
2. چک کن که `collectstatic` اجرا شده
3. چک کن که `index.html` در `staticfiles` هست

### مشکل: API calls کار نمی‌کنن
**راه‌حل:**
1. چک کن که URL در `frontend/src/services/api.ts` درست باشه
2. در production باید از domain کامل استفاده کنی:
   ```typescript
   const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin + '/api';
   ```

### مشکل: Static files لود نمی‌شن
**راه‌حل:**
1. چک کن که `STATIC_ROOT` درست تنظیم شده
2. چک کن که `collectstatic` اجرا شده
3. در production از Nginx برای serve کردن static files استفاده کن

## ✅ چک‌لیست

- [ ] React build شده (`npm run build`)
- [ ] Static files collect شده (`collectstatic`)
- [ ] `index.html` در `staticfiles` هست
- [ ] Django در حال اجراست
- [ ] می‌تونی به `http://127.0.0.1:8000` دسترسی داشته باشی
- [ ] API calls کار می‌کنن
- [ ] همه routes به React app می‌رن

## 🎉 همه چیز آماده است!

حالا می‌تونی:
- در localhost با `python manage.py runserver` فرانت‌اند رو ببینی
- روی هر host Django deploy کنی
- همه چیز از یک سرور serve بشه

