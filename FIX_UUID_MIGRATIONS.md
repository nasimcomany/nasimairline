# راهنمای رفع مشکل UUID Migrations

## مشکل:
Django نمی‌تواند به صورت خودکار UUID برای رکوردهای موجود تولید کند.

## راه حل:

### مرحله 1: ساخت Migration اولیه
در terminal، وقتی Django از شما می‌پرسد:
```
Please choose how to proceed:
 1) Continue making this migration...
 2) Quit and edit field options...
```

**گزینه 1 را انتخاب کنید** برای همه مدل‌ها.

### مرحله 2: ویرایش Migration‌ها
بعد از اینکه همه migration‌ها ساخته شدند، من آنها را ویرایش می‌کنم تا UUIDها را برای رکوردهای موجود تولید کنند.

### مرحله 3: اجرای Migration
```bash
python manage.py migrate
```

## مدل‌هایی که نیاز به UUID migration دارند:
- accounts.User ✅ (قبلاً انجام شد)
- bookings.Booking
- payments.Payment
- payments.Transaction
- notifications.Notification
- pilots.Pilot
- pilots.PilotRequest
- security.SecurityInfo
- security.SecurityAlert
- flights.Airport
- flights.Aircraft
- flights.Flight
- blog.Article
- blog.Comment

