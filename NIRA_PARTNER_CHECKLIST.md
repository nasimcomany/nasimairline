# چک‌لیست اتصال به نیرا (الگوی ایرلاین‌های واقعی)

معماری استاندارد ایرلاین‌هایی که از Nira IBE استفاده می‌کنند:

```
جستجو (Availability)
  → رزرو موقت / soft-hold (HELD)
  → ریدایرکت به صفحه پرداخت نیرا
  → Callback سرور-به-سرور (منبع حقیقت)
  → Return مرورگر به سایت ایرلاین
  → CONFIRMED + ذخیره PNR / شماره بلیط در ادمین
```

## ۱) از شریک نیرا بگیرید

| مورد | env / محل |
|------|-----------|
| Base URL و Office User/Pass | `NIRA_BASE_URL`, `NIRA_OFFICE_USER`, `NIRA_OFFICE_PASS` |
| قالب URL صفحه پرداخت | `NIRA_PAYMENT_REDIRECT_URL` با `{ref}` `{callback}` `{return_url}` |
| API رزرو (اگر جداست) | `NIRA_RESERVE_URL` |
| Lookup بعد از پرداخت (PNR/بلیط) | `NIRA_RESERVATION_LOOKUP_URL` با `{ref}` |
| Secret / IP برای callback | `NIRA_CALLBACK_SECRET`, `NIRA_CALLBACK_IPS` |
| مقادیر موفقیت/شکست در callback | `NIRA_CALLBACK_SUCCESS_VALUES`, `NIRA_CALLBACK_FAIL_VALUES` |

## ۲) URLهای ما که باید به نیرا بدهید

روی دامنه پروداکشن (مثلاً Railway):

- **Callback (سرور):** `https://YOUR-DOMAIN/api/payments/nira/callback/`
- **Return (مرورگر):** `https://YOUR-DOMAIN/payment/verify?ref={BOOKING_REF}&provider=nira`

`initiate-payment` این دو را خودش در قالب `NIRA_PAYMENT_REDIRECT_URL` جاگذاری می‌کند.

## ۳) جریان داخل سیستم نسیم

1. کاربر پرواز را انتخاب و پرداخت را می‌زند → `POST /api/bookings/bookings/initiate-payment/`
2. موجودی بدون کش از نیرا چک می‌شود؛ Booking با وضعیت `HELD` ساخته می‌شود
3. اگر `NIRA_PAYMENT_REDIRECT_URL` ست باشد → `payment_mode=nira_redirect` و کاربر به UI نیرا می‌رود
4. نیرا بعد از پرداخت:
   - به **callback** ما POST/GET می‌زند → Payment=`COMPLETED`، Booking=`CONFIRMED`، فیلدهای `nira_pnr` / `nira_ticket_numbers`
   - مرورگر را به **return** می‌فرستد → صفحه verify همان نتیجه را (idempotent) اعمال/نمایش می‌دهد
5. در Django Admin → Bookings: ستون/فیلد **PNR نیرا** و شماره بلیط‌ها دیده می‌شود

## ۴) تست قبل از پروداکشن

- [ ] `NIRA_*` در Railway Variables ست شده
- [ ] `migrate` شامل `0004_nira_ticket_fields` اجرا شده
- [ ] یک hold بسازید و ببینید `payment_url` برمی‌گردد
- [ ] با Postman به callback بزنید مثلاً:  
  `POST /api/payments/nira/callback/?ref=XXXX&status=success&pnr=ABC123&tickets=1001`
- [ ] در Admin همان booking باید `CONFIRMED` + PNR شود
- [ ] Return مرورگر: `/payment/verify?ref=XXXX&provider=nira&status=success`

## ۵) اگر هنوز URL پرداخت نیرا نرسیده

سیستم به درگاه‌های محلی (مثل زرین‌پال) fallback می‌کند؛ soft-hold و expire همچنان کار می‌کنند. به‌محض دریافت URL رسمی، فقط env را پر کنید — کد آماده است.
