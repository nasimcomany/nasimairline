# راهنمای استفاده از API نیرا

## 📋 توضیح ساده

این سیستم برای ارتباط با **سیستم نیرا (Nira)** ساخته شده که یک سیستم مدیریت پرواز و فروش بلیط است.

### **چی کار می‌کنه؟**

1. **بررسی موجودی پروازها:** می‌تونه ببینه چه پروازهایی در تاریخ مشخص موجوده
2. **لیست شهرهای مبدا:** می‌تونه لیست همه شهرهایی که پرواز از اونجا شروع می‌شه رو بده
3. **لیست مقاصد:** می‌تونه ببینه از یک شهر خاص به کدوم شهرها می‌شه پرواز کرد

---

## 🔧 تنظیمات

### **مرحله 1: نصب کتابخانه**

```bash
pip install persiantools
```

یا اگر از requirements.txt استفاده می‌کنید:
```bash
pip install -r requirements.txt
```

### **مرحله 2: تنظیم در فایل .env**

در فایل `.env` (در ریشه پروژه) این مقادیر رو اضافه کنید:

```env
# URL پایه سیستم نیرا
NIRA_BASE_URL=https://airline.example.com

# نام کاربری و رمز عبور Office برای دسترسی به Web Service
NIRA_OFFICE_USER=your_username
NIRA_OFFICE_PASS=your_password

# Timeout برای درخواست‌های API (ثانیه) - اختیاری
NIRA_API_TIMEOUT=30
```

**⚠️ مهم:** این مقادیر رو از مسئول وب‌سرویس نیرا بگیرید!

---

## 📡 API Endpoints

### **1. بررسی موجودی پرواز (Availability)**

**URL:** `POST /api/flights/nira/availability/`

**درخواست:**
```json
{
  "origin": "THR",
  "destination": "MHD",
  "departure_date": "2023-11-04",
  "round_trip": true,
  "return_date": "2023-11-06",
  "adult_qty": 1,
  "child_qty": 0,
  "infant_qty": 0
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "data": { ... },
  "status_code": 200
}
```

**پاسخ خطا:**
```json
{
  "error": "خطای توضیح داده شده"
}
```

---

### **2. لیست شهرهای مبدا**

**URL:** `GET /api/flights/nira/routes/origins/`

**درخواست:** بدون پارامتر

**پاسخ موفق:**
```json
{
  "success": true,
  "data": { ... },
  "status_code": 200
}
```

---

### **3. لیست مقاصد از یک شهر خاص**

**URL:** `GET /api/flights/nira/routes/destinations/?origin=THR`

**پارامترها:**
- `origin`: کد IATA شهر مبدا (مثلاً THR برای تهران)

**پاسخ موفق:**
```json
{
  "success": true,
  "data": { ... },
  "status_code": 200
}
```

---

## 💻 مثال استفاده در کد

### **مثال 1: بررسی موجودی پرواز**

```python
from flights.nira_client import NiraClient
from datetime import datetime

client = NiraClient()

result = client.check_availability(
    origin='THR',
    destination='MHD',
    departure_date=datetime(2023, 11, 4),
    round_trip=True,
    return_date=datetime(2023, 11, 6),
    adult_qty=1,
    child_qty=0,
    infant_qty=0
)

if result['success']:
    print("پرواز موجود است!")
    print(result['data'])
else:
    print(f"خطا: {result['error']}")
```

### **مثال 2: گرفتن لیست شهرهای مبدا**

```python
from flights.nira_client import NiraClient

client = NiraClient()

result = client.get_origin_cities()

if result['success']:
    print("شهرهای مبدا:")
    print(result['data'])
else:
    print(f"خطا: {result['error']}")
```

### **مثال 3: گرفتن لیست مقاصد**

```python
from flights.nira_client import NiraClient

client = NiraClient()

result = client.get_destinations(origin='THR')

if result['success']:
    print("مقاصد از تهران:")
    print(result['data'])
else:
    print(f"خطا: {result['error']}")
```

---

## 🔄 تبدیل تاریخ

سیستم به صورت خودکار تاریخ میلادی رو به شمسی تبدیل می‌کنه:

- **ورودی:** تاریخ میلادی (مثلاً 2023-11-04)
- **خروجی به نیرا:** تاریخ شمسی (مثلاً 1402-08-13)

---

## ⚠️ نکات مهم

1. **تاریخ شمسی:** سیستم نیرا از تاریخ شمسی استفاده می‌کنه، اما شما می‌تونید تاریخ میلادی بفرستید و سیستم خودکار تبدیل می‌کنه

2. **کدهای IATA:** شهرها باید با کد IATA باشن (مثلاً THR برای تهران، MHD برای مشهد)

3. **Round Trip:** اگر `round_trip=true` باشه، حتماً باید `return_date` رو هم بفرستید

4. **خطاها:** اگر خطایی پیش بیاد، در فیلد `error` توضیح داده می‌شه

---

## 🧪 تست API

### **با curl:**

```bash
# بررسی موجودی
curl -X POST http://localhost:8000/api/flights/nira/availability/ \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "THR",
    "destination": "MHD",
    "departure_date": "2023-11-04",
    "round_trip": true,
    "return_date": "2023-11-06",
    "adult_qty": 1
  }'

# لیست شهرهای مبدا
curl http://localhost:8000/api/flights/nira/routes/origins/

# لیست مقاصد
curl "http://localhost:8000/api/flights/nira/routes/destinations/?origin=THR"
```

---

## 📝 خلاصه

1. **تنظیمات:** مقادیر NIRA_* رو در .env تنظیم کنید
2. **نصب:** `pip install persiantools`
3. **استفاده:** از ViewSet ها یا مستقیماً از NiraClient استفاده کنید
4. **تاریخ:** تاریخ میلادی بفرستید، سیستم خودکار به شمسی تبدیل می‌کنه

---

## 🚨 محدوده واقعی API نیرا در این پروژه (مهم)

| عملیات | وضعیت |
|--------|--------|
| موجودی پرواز (Availability) | ✅ |
| مسیرها / مبدا و مقصد (RoutesApp) | ✅ |
| Soft-hold محلی (HELD + TTL) | ✅ |
| ریدایرکت به صفحه پرداخت نیرا | ✅ وقتی `NIRA_PAYMENT_REDIRECT_URL` ست شود |
| Callback سرور + Return مرورگر | ✅ `/api/payments/nira/callback/` و `/api/payments/nira/return/` |
| ذخیره PNR / بلیط در Admin | ✅ فیلدهای `nira_pnr`, `nira_ticket_numbers` |
| Reserve رسمی نیرا | ⏳ وابسته به `NIRA_RESERVE_URL` + مستند شریک |
| Lookup بعد از پرداخت | ⏳ وابسته به `NIRA_RESERVATION_LOOKUP_URL` |

**جریان ایرلاین (همان الگوی رایج Nira IBE):**
1. قبل از پرداخت، موجودی **بدون کش** دوباره چک می‌شود
2. Booking با وضعیت `HELD` و مهلت (`BOOKING_HOLD_MINUTES`) ساخته می‌شود
3. کاربر به UI پرداخت نیرا ریدایرکت می‌شود (یا درگاه محلی اگر URL نیرا نباشد)
4. Callback نیرا → Payment COMPLETED + Booking CONFIRMED + PNR/بلیط
5. Return مرورگر → صفحه `/payment/verify?provider=nira` وضعیت را نشان می‌دهد
6. Hold منقضی → `EXPIRED` (Celery beat)

جزئیات env و تست: فایل `NIRA_PARTNER_CHECKLIST.md`

---

## ❓ سوالات متداول

### **سوال:** چرا تاریخ شمسی استفاده می‌شه؟
**جواب:** چون سیستم نیرا از تاریخ شمسی استفاده می‌کنه. شما می‌تونید تاریخ میلادی بفرستید و سیستم خودکار تبدیل می‌کنه.

### **سوال:** اگر خطا داد چی کار کنم؟
**جواب:** 
1. بررسی کنید که NIRA_BASE_URL درست تنظیم شده
2. بررسی کنید که NIRA_OFFICE_USER و NIRA_OFFICE_PASS درست هستن
3. لاگ‌ها رو بررسی کنید

### **سوال:** چطور می‌تونم ببینم چه داده‌ای برمی‌گردونه؟
**جواب:** در پاسخ API، فیلد `data` شامل داده‌های برگشتی از نیرا است.

