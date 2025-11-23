# راهنمای اتصال فرانت‌اند به بک‌اند

## ✅ کارهای انجام شده

### 1. سرویس‌های API
- ✅ `frontend/src/services/api.ts` - تنظیم axios با JWT interceptor
- ✅ `frontend/src/services/authService.ts` - سرویس‌های authentication
- ✅ `frontend/src/services/ticketService.ts` - سرویس‌های تیکتینگ

### 2. Redux Store
- ✅ `frontend/src/store/slices/authSlice.ts` - به‌روزرسانی برای استفاده از سرویس‌های جدید

### 3. صفحات
- ✅ `frontend/src/pages/TicketPage.tsx` - صفحه تیکتینگ کامل

## 📋 تنظیمات لازم

### 1. فایل `.env` در پوشه `frontend`

یک فایل `.env` در پوشه `frontend` بساز با این محتوا:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### 2. نصب وابستگی‌ها (اگر نصب نشده)

```bash
cd frontend
npm install
```

## 🚀 نحوه تست

### 1. اجرای بک‌اند

```bash
# در پوشه اصلی پروژه
python manage.py runserver
```

بک‌اند روی `http://127.0.0.1:8000` اجرا می‌شود.

### 2. اجرای فرانت‌اند

```bash
# در پوشه frontend
cd frontend
npm start
```

فرانت‌اند روی `http://localhost:3000` اجرا می‌شود.

### 3. تست Authentication

#### ثبت‌نام:
1. برو به `http://localhost:3000/register`
2. فرم را پر کن:
   - Email: test@example.com
   - Password: Test123456!
   - Password Confirm: Test123456!
   - First Name: علی
   - Last Name: احمدی
   - Phone: 09123456789
3. Submit را بزن
4. باید به dashboard هدایت بشی و token در localStorage ذخیره بشه

#### ورود:
1. برو به `http://localhost:3000/login`
2. Email و Password را وارد کن
3. Submit را بزن
4. باید به dashboard هدایت بشی

### 4. تست تیکتینگ

#### ایجاد تیکت:
1. برو به `http://localhost:3000/tickets`
2. اگر لاگین نیستی، به صفحه login هدایت می‌شی
3. بعد از لاگین، می‌تونی تیکت بسازی:
   - دسته‌بندی را انتخاب کن (همکاری با ما، انتقادات و پیشنهادات، متفرقه، حراست)
   - عنوان و توضیحات را وارد کن
   - اولویت را انتخاب کن
   - Submit را بزن
4. تیکت ایجاد می‌شه و ایمیل به آدرس مربوط ارسال می‌شه

#### مشاهده تیکت‌های من:
1. در صفحه تیکتینگ، تب "تیکت‌های من" را بزن
2. لیست تیکت‌هایت نمایش داده می‌شه

#### حراست:
1. دسته‌بندی "ارتباط با حراست" را انتخاب کن
2. شماره تماس نمایش داده می‌شه: `021123456789`

## 🔍 چک کردن اتصال

### 1. چک کردن Token در localStorage

در Developer Tools (F12):
- Application → Local Storage → `http://localhost:3000`
- باید این کلیدها را ببینی:
  - `access_token`
  - `refresh_token`
  - `user`

### 2. چک کردن Network Requests

در Developer Tools (F12):
- Network tab
- وقتی تیکت می‌سازی، باید یک POST request به `/api/support/tickets/` ببینی
- Header باید شامل `Authorization: Bearer <token>` باشه

### 3. چک کردن Console

اگر خطایی باشه، در Console نمایش داده می‌شه.

## 🐛 رفع مشکلات

### مشکل: CORS Error

**راه‌حل:** چک کن که در `nasim/settings.py` این تنظیمات باشه:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### مشکل: 401 Unauthorized

**راه‌حل:**
1. چک کن که token در localStorage هست
2. چک کن که token معتبر هست (منقضی نشده)
3. اگر منقضی شده، refresh token باید خودکار کار کنه

### مشکل: 404 Not Found

**راه‌حل:**
1. چک کن که بک‌اند در حال اجراست
2. چک کن که URL در `.env` درست باشه
3. چک کن که route در `nasim/urls.py` درست تعریف شده

### مشکل: Network Error

**راه‌حل:**
1. چک کن که بک‌اند در حال اجراست
2. چک کن که firewall یا antivirus بلاک نکرده
3. چک کن که port 8000 آزاد باشه

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register/` - ثبت‌نام
- `POST /api/auth/login/` - ورود
- `POST /api/auth/logout/` - خروج
- `GET /api/auth/profile/` - پروفایل کاربر

### Tickets
- `GET /api/support/tickets/` - لیست تیکت‌ها
- `POST /api/support/tickets/` - ایجاد تیکت
- `GET /api/support/tickets/{id}/` - جزئیات تیکت
- `GET /api/support/tickets/my_tickets/` - تیکت‌های من
- `POST /api/support/tickets/{id}/add_message/` - افزودن پیام
- `GET /api/support/security/contact/` - اطلاعات حراست

## ✅ چک‌لیست نهایی

- [ ] فایل `.env` در `frontend` ساخته شده
- [ ] بک‌اند در حال اجراست (`python manage.py runserver`)
- [ ] فرانت‌اند در حال اجراست (`npm start`)
- [ ] می‌تونی ثبت‌نام کنی
- [ ] می‌تونی لاگین کنی
- [ ] می‌تونی تیکت بسازی
- [ ] می‌تونی تیکت‌هایت رو ببینی
- [ ] برای حراست شماره تماس نمایش داده می‌شه
- [ ] ایمیل‌ها به آدرس‌های درست ارسال می‌شن

## 🎉 همه چیز آماده است!

اگر همه این موارد رو چک کردی و کار می‌کنه، یعنی اتصال فرانت‌اند به بک‌اند موفق بوده! 🚀

