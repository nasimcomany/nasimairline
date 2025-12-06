# راهنمای تنظیمات Production - نسیم ایر

این فایل راهنمای کامل برای راه‌اندازی پروژه فرانت‌اند نسیم ایر در production است.

## 📋 فهرست مطالب

1. [Environment Variables چیست؟](#environment-variables-چیست)
2. [تنظیم Environment Variables در لیارا](#تنظیم-در-لیارا)
3. [تنظیم Environment Variables در پارس پک](#تنظیم-در-پارس-پک)
4. [مراحل Build و Deploy](#مراحل-build-و-deploy)
5. [بررسی و تست](#بررسی-و-تست)

---

## 🔧 Environment Variables چیست؟

**Environment Variables** (متغیرهای محیطی) مقادیری هستند که به برنامه شما می‌گویند:
- آدرس API بک‌اند کجاست؟
- کلیدهای API (مثل Weather API) چیست؟
- آیا در حالت development هستیم یا production؟

### چرا مهم است؟

در کد شما، این خط وجود دارد:
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

این یعنی:
- اگر `REACT_APP_API_URL` تنظیم شده باشد، از آن استفاده می‌شود
- در غیر این صورت، از `http://localhost:8000/api` استفاده می‌شود (که فقط برای development است)

### در React چطور کار می‌کند؟

React فقط متغیرهایی که با `REACT_APP_` شروع می‌شوند را می‌خواند. این متغیرها در زمان build در کد قرار می‌گیرند.

---

## 🚀 تنظیم در لیارا

### روش 1: از طریق Dashboard لیارا

1. وارد پنل لیارا شوید: https://console.liara.ir
2. پروژه خود را انتخاب کنید
3. به بخش **Environment Variables** بروید
4. متغیرهای زیر را اضافه کنید:

```
REACT_APP_API_URL=https://api.nasimairlines.ir/api
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here
```

### روش 2: از طریق CLI لیارا

```bash
# نصب CLI لیارا (اگر نصب نشده)
npm install -g @liara/cli

# لاگین
liara login

# تنظیم متغیرها
liara env:set REACT_APP_API_URL=https://api.nasimairlines.ir/api
liara env:set REACT_APP_WEATHER_API_KEY=your_weather_api_key_here
```

### نکات مهم برای لیارا:

- بعد از تغییر Environment Variables، باید پروژه را دوباره build کنید
- لیارا به صورت خودکار `NODE_ENV=production` را تنظیم می‌کند
- اگر از Git برای deploy استفاده می‌کنید، فایل `.env` را در `.gitignore` قرار دهید

---

## 🏢 تنظیم در پارس پک

### روش 1: از طریق cPanel

1. وارد cPanel شوید
2. به بخش **Environment Variables** یا **Advanced** بروید
3. متغیرهای زیر را اضافه کنید:

```
REACT_APP_API_URL=https://api.nasimairlines.ir/api
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here
```

### روش 2: از طریق SSH

```bash
# وارد سرور شوید
ssh username@your-server-ip

# فایل .env را ایجاد یا ویرایش کنید
nano .env

# محتوای زیر را اضافه کنید:
REACT_APP_API_URL=https://api.nasimairlines.ir/api
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here

# ذخیره و خروج (Ctrl+X, Y, Enter)
```

### نکات مهم برای پارس پک:

- اگر از PM2 یا systemd استفاده می‌کنید، باید متغیرها را در فایل تنظیمات اضافه کنید
- برای Apache/Nginx، ممکن است نیاز به تنظیمات اضافی باشد

---

## 📦 مراحل Build و Deploy

### 1. Build کردن پروژه

```bash
cd frontend
npm install
npm run build
```

این دستور:
- تمام فایل‌های React را بهینه می‌کند
- Environment Variables را در کد قرار می‌دهد
- فایل‌های نهایی را در پوشه `build/` ایجاد می‌کند

### 2. آپلود فایل‌های build

فایل‌های داخل پوشه `build/` را به هاست آپلود کنید.

**برای لیارا:**
- لیارا به صورت خودکار از Git build می‌کند
- یا می‌توانید فایل‌های `build/` را آپلود کنید

**برای پارس پک:**
- فایل‌های `build/` را در پوشه `public_html` یا `www` آپلود کنید

### 3. تنظیم Nginx/Apache (برای پارس پک)

اگر از Nginx استفاده می‌کنید، فایل تنظیمات باید شبیه این باشد:

```nginx
server {
    listen 80;
    server_name nasimairlines.ir www.nasimairlines.ir;
    
    root /path/to/your/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ✅ بررسی و تست

### 1. بررسی Environment Variables

در مرورگر، Developer Tools را باز کنید (F12) و در Console تایپ کنید:

```javascript
console.log(process.env);
```

**نکته:** در production، React فقط متغیرهای `REACT_APP_*` را نمایش می‌دهد.

### 2. تست API Calls

- صفحه را باز کنید
- Developer Tools > Network را باز کنید
- یک درخواست API انجام دهید (مثلاً جستجوی پرواز)
- بررسی کنید که درخواست به آدرس صحیح API می‌رود

### 3. بررسی Console برای خطاها

- Developer Tools > Console را باز کنید
- بررسی کنید که خطایی وجود ندارد
- اگر خطایی دیدید، بررسی کنید که Environment Variables درست تنظیم شده‌اند

---

## 🔒 نکات امنیتی

1. **هرگز** فایل `.env` را در Git commit نکنید
2. کلیدهای API را در کد hardcode نکنید
3. از HTTPS برای API استفاده کنید
4. Environment Variables را فقط در production تنظیم کنید

---

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
1. بررسی کنید که Environment Variables درست تنظیم شده‌اند
2. بررسی کنید که API URL درست است
3. بررسی کنید که CORS در بک‌اند تنظیم شده است
4. لاگ‌های سرور را بررسی کنید

---

## 📝 خلاصه

1. ✅ Environment Variables را در هاست تنظیم کنید
2. ✅ `npm run build` را اجرا کنید
3. ✅ فایل‌های `build/` را آپلود کنید
4. ✅ تست کنید که همه چیز کار می‌کند

**مهم:** Environment Variables باید **قبل از build** تنظیم شوند، یا بعد از build باید دوباره build کنید.

