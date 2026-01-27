# راهنمای پیدا کردن API واقعی سیستم نیرا

## مراحل دقیق:

### 1. باز کردن Developer Tools
- F12 رو بزن
- یا راست کلیک → Inspect

### 2. تنظیمات Network Tab
- تب **Network** رو باز کن
- فیلتر **XHR** یا **Fetch** رو فعال کن (نه All)
- گزینه **Disable Cache** رو فعال کن
- گزینه **Preserve log** رو فعال کن (مهم!)

### 3. Refresh صفحه
- صفحه رو Refresh کن (F5)
- یا دوباره URL رو باز کن

### 4. بررسی Request ها
بعد از Refresh، باید request هایی مثل این ببینی:
- `/api/availability`
- `/api/flights`
- `/ws/...`
- یا هر endpoint دیگه‌ای

### 5. اگر هیچ request ای نمی‌بینی:
- صبر کن تا صفحه کامل لود بشه (ممکنه چند ثانیه طول بکشه)
- ببین آیا WebSocket connection هست (تب WS)
- Console رو چک کن (تب Console) برای خطاها

### 6. اگر request پیدا کردی:
- روی request کلیک کن
- تب **Headers** رو ببین (URL کامل)
- تب **Response** رو ببین (داده‌های برگشتی)
- تب **Payload** رو ببین (پارامترهای فرستاده شده)

