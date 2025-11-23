# راهنمای تست واتساپ

## نحوه تست ارسال پیام واتساپ

### روش 1: استفاده از اسکریپت تست

1. **تنظیمات را در فایل `.env` اضافه کنید:**

```env
# WhatsApp API Settings
WHATSAPP_API_URL=https://api.example.com/whatsapp/send
WHATSAPP_API_KEY=your-api-key-here
WHATSAPP_PHONE_ID=your-phone-id  # برای Twilio (اختیاری)
ADMIN_WHATSAPP_NUMBER=+989379146130  # شماره شما با کد کشور
```

2. **اجرای اسکریپت تست:**

```bash
python test_whatsapp.py
```

اگر پیام را دریافت کردید، تنظیمات درست است! ✅

### روش 2: تست از طریق چت آنلاین

1. **تنظیمات را در فایل `.env` اضافه کنید** (همان بالا)

2. **سرور Django را اجرا کنید:**

```bash
python manage.py runserver
```

3. **به عنوان کاربر یا مهمان در سایت پیام بگذارید**

4. **پیام واتساپ باید به شماره `09379146130` ارسال شود**

### تنظیمات برای سرویس‌های مختلف

#### Twilio WhatsApp API

```env
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
WHATSAPP_API_KEY=your-twilio-auth-token
WHATSAPP_PHONE_ID=whatsapp:+14155238886  # شماره Twilio شما
ADMIN_WHATSAPP_NUMBER=+989379146130
```

**نکته:** برای Twilio باید کد `support/utils.py` را تغییر دهید. در خط 147-150، payload را به این شکل تغییر دهید:

```python
payload = {
    'To': f'whatsapp:{phone_number}',
    'From': f'whatsapp:{whatsapp_phone_id}',
    'Body': message,
}
```

و headers را به این شکل:

```python
import base64
auth_string = f"{settings.TWILIO_ACCOUNT_SID}:{whatsapp_api_key}"
headers = {
    'Authorization': f'Basic {base64.b64encode(auth_string.encode()).decode()}',
    'Content-Type': 'application/x-www-form-urlencoded',
}
```

#### سرویس‌های ایرانی (کاوه نگار، پیامک گستر، ...)

باید بر اساس مستندات API سرویس انتخابی خود، کد `send_whatsapp_message` در `support/utils.py` را تنظیم کنید.

### بررسی لاگ‌ها

اگر پیام ارسال نشد، لاگ‌های Django را بررسی کنید:

```bash
# در terminal که Django در حال اجرا است
# خطاها در console نمایش داده می‌شوند
```

یا در فایل `settings.py` می‌توانید logging را فعال کنید.

### نکات مهم

1. **شماره باید با کد کشور باشد:** `+989379146130` (نه `09379146130`)
2. **API Key و URL باید صحیح باشند**
3. **برای Twilio، باید شماره را در Twilio ثبت کرده باشید**
4. **برای سرویس‌های ایرانی، ممکن است نیاز به ثبت نام و فعال‌سازی داشته باشید**

### تست سریع بدون API

اگر می‌خواهید فقط ببینید که کد کار می‌کند یا نه، می‌توانید در `support/utils.py` یک print اضافه کنید:

```python
print(f"📱 WhatsApp: Sending to {phone_number}")
print(f"Message: {message}")
```

اگر این پیام‌ها در console نمایش داده شدند، کد در حال اجرا است و فقط تنظیمات API نیاز به اصلاح دارد.

