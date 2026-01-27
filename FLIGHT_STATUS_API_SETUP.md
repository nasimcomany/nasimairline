# راهنمای تنظیم API اطلاعات لحظه‌ای پروازها

این راهنما توضیح می‌دهد که چطور API Key های لازم را برای دریافت اطلاعات لحظه‌ای پروازها (زمان واقعی، تأخیر، گیت، تعداد توقف) تنظیم کنید.

## 📋 فهرست مطالب

1. [اطلاعات کلی](#اطلاعات-کلی)
2. [فیلدهای جدید](#فیلدهای-جدید)
3. [تنظیم API Key ها](#تنظیم-api-key-ها)
4. [استفاده از API](#استفاده-از-api)
5. [تست](#تست)

---

## اطلاعات کلی

### چه اطلاعاتی اضافه شده است؟

کدهای لازم برای دریافت و نمایش این اطلاعات آماده است:

1. **زمان واقعی ورود/خروج** (`actual_departure_time`, `actual_arrival_time`)
2. **تأخیر دقیق** (`delay_minutes`)
3. **گیت پرواز و فرود** (`departure_gate`, `arrival_gate`)
4. **تعداد توقف** (`stops`)

### وضعیت فعلی

- ✅ **کدها آماده است**: تمام کدهای لازم نوشته شده است
- ⏳ **منتظر API Key**: فقط نیاز به API Key ها دارید
- ✅ **محاسبه خودکار تعداد توقف**: اگر API Key نباشد، از `FlightDurationTime` محاسبه می‌شود

---

## فیلدهای جدید

### در مدل Flight

فیلدهای زیر به مدل `Flight` اضافه شده است:

```python
# زمان واقعی
actual_departure_time = DateTimeField  # زمان واقعی پرواز
actual_arrival_time = DateTimeField    # زمان واقعی فرود

# تأخیر
delay_minutes = IntegerField           # تأخیر به دقیقه

# گیت
departure_gate = CharField             # گیت پرواز
arrival_gate = CharField               # گیت فرود

# تعداد توقف
stops = PositiveIntegerField           # تعداد توقف
```

### در Frontend Interface

فیلدهای زیر به `FlightAvailability` interface اضافه شده است:

```typescript
ActualDepartureDateTime?: string;  // زمان واقعی پرواز
ActualArrivalDateTime?: string;     // زمان واقعی فرود
DelayMinutes?: number;              // تأخیر به دقیقه
DepartureGate?: string;             // گیت پرواز
ArrivalGate?: string;               // گیت فرود
Stops?: number;                     // تعداد توقف
```

---

## تنظیم API Key ها

### مرحله 1: تماس با سازمان هواپیمایی کشوری

1. **تماس بگیرید** با سازمان هواپیمایی کشوری
2. **درخواست کنید** API برای اطلاعات لحظه‌ای پروازها
3. **دریافت کنید**:
   - URL API
   - API Key
   - مستندات API

### مرحله 2: تنظیم در فایل `.env`

بعد از دریافت API Key ها، آن‌ها را در فایل `.env` اضافه کنید:

```env
# سازمان هواپیمایی کشوری (CAO)
CAO_API_URL=https://api.cao.ir/v1
CAO_API_KEY=your_cao_api_key_here

# فرودگاه‌ها (امام خمینی، مهرآباد)
AIRPORT_API_URL=https://api.airport.ir/v1
AIRPORT_API_KEY=your_airport_api_key_here

# سرویس‌های بین‌المللی (اختیاری - برای پروازهای خارجی)
FLIGHTAWARE_API_KEY=your_flightaware_api_key_here
AVIATIONSTACK_API_KEY=your_aviationstack_api_key_here
```

### مرحله 3: تنظیم در `settings.py`

API Key ها به صورت خودکار از `.env` خوانده می‌شوند. نیازی به تغییر در `settings.py` نیست.

---

## استفاده از API

### در Backend

#### دریافت اطلاعات لحظه‌ای برای یک پرواز

```python
from flights.flight_status_service import FlightStatusService
from flights.models import Flight

# دریافت پرواز
flight = Flight.objects.get(flight_number='IR123')

# ایجاد سرویس
status_service = FlightStatusService()

# دریافت اطلاعات لحظه‌ای
realtime_data = status_service.get_flight_status(
    flight_number=flight.flight_number,
    origin=flight.origin.code,
    destination=flight.destination.code,
    scheduled_departure=flight.departure_time
)

# اگر اطلاعات دریافت شد
if realtime_data:
    flight.actual_departure_time = realtime_data.get('actual_departure_time')
    flight.actual_arrival_time = realtime_data.get('actual_arrival_time')
    flight.delay_minutes = realtime_data.get('delay_minutes')
    flight.departure_gate = realtime_data.get('gate')
    flight.arrival_gate = realtime_data.get('arrival_gate')
    flight.stops = realtime_data.get('stops', 0)
    flight.save()
```

#### محاسبه تعداد توقف از مدت پرواز

```python
# اگر تعداد توقف از API دریافت نشد، از مدت پرواز محاسبه می‌شود
stops = status_service.calculate_stops_from_duration(
    duration='02:30:00',  # مدت پرواز
    origin='THR',
    destination='MHD'
)
```

### در Frontend

#### دریافت اطلاعات لحظه‌ای از API

```typescript
// دریافت اطلاعات لحظه‌ای برای یک پرواز
const response = await fetch(`/api/flights/${flightId}/realtime_status/`);
const data = await response.json();

if (data.realtime_available) {
  console.log('زمان واقعی پرواز:', data.flight.actual_departure_time);
  console.log('تأخیر:', data.flight.delay_minutes, 'دقیقه');
  console.log('گیت پرواز:', data.flight.departure_gate);
  console.log('تعداد توقف:', data.flight.stops);
} else {
  console.log('اطلاعات لحظه‌ای در دسترس نیست');
}
```

---

## تست

### تست بدون API Key

اگر API Key تنظیم نشده باشد:

1. سیستم crash نمی‌کند
2. `realtime_data` برابر `None` می‌شود
3. تعداد توقف از `FlightDurationTime` محاسبه می‌شود
4. پیام مناسب به کاربر نمایش داده می‌شود

### تست با API Key

بعد از تنظیم API Key ها:

1. درخواست به API ارسال می‌شود
2. اطلاعات لحظه‌ای دریافت می‌شود
3. اطلاعات در دیتابیس ذخیره می‌شود
4. به کاربر نمایش داده می‌شود

---

## نکات مهم

### 1. Migration

بعد از اضافه کردن فیلدهای جدید، باید migration اجرا کنید:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. مستندات API

وقتی API Key ها را دریافت کردید، باید مستندات API را بررسی کنید و کدهای `flight_status_service.py` را بر اساس آن تنظیم کنید.

### 3. Error Handling

سیستم به گونه‌ای طراحی شده که اگر API Key تنظیم نشده باشد یا خطایی رخ دهد، crash نمی‌کند.

### 4. Performance

برای بهبود عملکرد، می‌توانید از caching استفاده کنید:

```python
from django.core.cache import cache

# Cache کردن اطلاعات لحظه‌ای برای 5 دقیقه
cache_key = f'flight_status_{flight_number}_{date}'
realtime_data = cache.get(cache_key)
if not realtime_data:
    realtime_data = status_service.get_flight_status(...)
    cache.set(cache_key, realtime_data, 300)  # 5 دقیقه
```

---

## خلاصه

✅ **کدها آماده است**: تمام کدهای لازم نوشته شده است  
⏳ **منتظر API Key**: فقط نیاز به API Key ها دارید  
✅ **محاسبه خودکار**: تعداد توقف از `FlightDurationTime` محاسبه می‌شود  
✅ **Error Handling**: سیستم crash نمی‌کند اگر API Key نباشد  

---

## سوالات متداول

### آیا می‌توانم بدون API Key استفاده کنم؟

بله! سیستم به گونه‌ای طراحی شده که بدون API Key هم کار می‌کند. فقط تعداد توقف از `FlightDurationTime` محاسبه می‌شود.

### آیا باید همه API Key ها را تنظیم کنم؟

خیر! فقط API Key هایی که در دسترس دارید را تنظیم کنید. سیستم به ترتیب اولویت از آن‌ها استفاده می‌کند.

### چطور می‌توانم API Key بگیرم؟

با سازمان هواپیمایی کشوری یا فرودگاه‌های اصلی (امام خمینی، مهرآباد) تماس بگیرید.

---

**آماده استفاده است! فقط API Key ها را تنظیم کنید.** 🚀

