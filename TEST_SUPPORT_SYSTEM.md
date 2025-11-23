# راهنمای تست سیستم تیکتینگ و Authentication

## مرحله 1: تست از طریق پنل ادمین (ساده‌ترین روش)

### 1.1. ساخت کاربر ادمین (اگر ندارید)
```bash
python manage.py createsuperuser
```
- ایمیل: admin@example.com
- رمز عبور: یک رمز قوی انتخاب کنید

### 1.2. اجرای سرور
```bash
python manage.py runserver
```

### 1.3. ورود به پنل ادمین
1. برو به: `http://127.0.0.1:8000/admin/`
2. با ایمیل و رمز ادمین وارد شو
3. در منوی سمت چپ باید بخش **Support** را ببینی با این موارد:
   - Ticket Categories (دسته‌بندی تیکت‌ها)
   - Tickets (تیکت‌ها)
   - Ticket Messages (پیام‌های تیکت)
   - Ticket Attachments (فایل‌های پیوست)

### 1.4. تست ساخت تیکت از پنل ادمین
1. برو به **Tickets** → **Add Ticket**
2. یک تیکت بساز:
   - **User**: یک کاربر انتخاب کن (یا اول یک کاربر عادی بساز)
   - **Title**: "تست تیکت"
   - **Description**: "این یک تیکت تستی است"
   - **Category**: یکی از دسته‌بندی‌ها را انتخاب کن
   - **Priority**: Normal
   - **Status**: Open
   - **Source**: Web
3. **Save** را بزن
4. باید شماره تیکت خودکار تولید بشه مثل: `NAS-20240101-000001`

---

## مرحله 2: تست API با Postman یا Browser (برای برنامه‌نویسان)

### 2.1. تست ثبت‌نام کاربر
**درخواست:**
```
POST http://127.0.0.1:8000/api/auth/register/
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456!",
  "password_confirm": "Test123456!",
  "first_name": "علی",
  "last_name": "احمدی",
  "phone_number": "09123456789",
  "date_of_birth": "1990-01-01",
  "gender": "M",
  "nationality": "ایرانی",
  "national_id": "1234567890"
}
```

**پاسخ موفق:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "first_name": "علی",
    ...
  }
}
```

### 2.2. تست ورود کاربر
**درخواست:**
```
POST http://127.0.0.1:8000/api/auth/login/
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456!"
}
```

**پاسخ:** مثل ثبت‌نام، یک access token و refresh token می‌دهد

### 2.3. تست ساخت تیکت (نیاز به Token دارد)
**درخواست:**
```
POST http://127.0.0.1:8000/api/support/tickets/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "مشکل در خرید بلیط",
  "description": "نمی‌تونم بلیط بخرم",
  "category": "BOOKING",
  "priority": "HIGH",
  "source": "WEB"
}
```

**پاسخ موفق:**
```json
{
  "uuid": "...",
  "reference": "NAS-20240101-000001",
  "title": "مشکل در خرید بلیط",
  "status": "OPEN",
  ...
}
```

### 2.4. تست دریافت تیکت‌های من
**درخواست:**
```
GET http://127.0.0.1:8000/api/support/tickets/my_tickets/
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2.5. تست افزودن پیام به تیکت
**درخواست:**
```
POST http://127.0.0.1:8000/api/support/tickets/1/add_message/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "لطفاً مشکل را بررسی کنید"
}
```

---

## مرحله 3: تست از طریق Python Shell (برای تست سریع)

### 3.1. باز کردن Shell
```bash
python manage.py shell
```

### 3.2. تست ساخت تیکت
```python
from support.models import Ticket
from accounts.models import User

# گرفتن یک کاربر
user = User.objects.first()

# ساخت تیکت
ticket = Ticket.objects.create(
    user=user,
    title="تست تیکت",
    description="این یک تیکت تستی است",
    category="BOOKING",
    priority="NORMAL"
)

# چاپ شماره تیکت
print(f"شماره تیکت: {ticket.reference}")
print(f"وضعیت: {ticket.status}")
print(f"اولویت: {ticket.priority}")
```

### 3.3. تست ساخت پیام
```python
from support.models import TicketMessage

# ساخت پیام برای تیکت
message = TicketMessage.objects.create(
    ticket=ticket,
    user=user,
    message="این یک پیام تستی است",
    message_type="CUSTOMER"
)

print(f"پیام ساخته شد: {message.message}")
```

---

## مرحله 4: چک کردن چیزهای مهم

### ✅ چیزهایی که باید چک کنی:

1. **شماره تیکت خودکار تولید می‌شه؟**
   - باید به صورت `NAS-YYYYMMDD-XXXXXX` باشه

2. **SLA deadline محاسبه می‌شه؟**
   - بر اساس اولویت باید مهلت تعیین بشه

3. **IP کاربر ذخیره می‌شه؟**
   - در فیلد `ticket_ip` باید IP ذخیره بشه

4. **JWT Token کار می‌کنه؟**
   - بعد از login باید access token بگیری

5. **دسترسی‌ها درست کار می‌کنن؟**
   - کاربر عادی فقط تیکت‌های خودش رو می‌بینه
   - پرسنل همه تیکت‌ها رو می‌بینن

---

## نکات مهم:

- **برای تست کامل**: اول یک کاربر عادی بساز، بعد یک تیکت بساز، بعد با ادمین وارد شو و تیکت رو ببین
- **برای تست API**: از Postman یا Thunder Client استفاده کن
- **اگر خطا گرفتی**: چک کن که migration ها اجرا شدن و سرور در حال اجراست

---

## لینک‌های مفید:

- پنل ادمین: `http://127.0.0.1:8000/admin/`
- API Root: `http://127.0.0.1:8000/api/`
- ثبت‌نام: `http://127.0.0.1:8000/api/auth/register/`
- ورود: `http://127.0.0.1:8000/api/auth/login/`
- تیکت‌ها: `http://127.0.0.1:8000/api/support/tickets/`

