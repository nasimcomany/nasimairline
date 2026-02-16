"""
سرویس ارسال پیامک با وب‌سرویس ملی پیامک (MelliPayamak / Payamak-Panel)
"""
import re
import logging
import requests
import xml.etree.ElementTree as ET
from django.conf import settings

logger = logging.getLogger(__name__)

# آدرس API ملی پیامک
MELLIPAYAMAK_SEND_URL = 'https://api.payamak-panel.com/post/Send.asmx/SendSimpleSMS'

# نگاشت کدهای خطا طبق مستندات ملی پیامک
MELLIPAYAMAK_ERROR_CODES = {
    0: "نام کاربری یا رمز عبور اشتباه است، یا اتصال به وب‌سرویس ممکن نیست. MELLIPAYAMAK_USERNAME و MELLIPAYAMAK_PASSWORD در .env را بررسی کنید.",
    -1: "خطای نامشخص؛ با پشتیبانی ملی پیامک (021-63404) تماس بگیرید.",
    2: "اعتبار پنل پیامک کافی نیست؛ موجودی خود را افزایش دهید.",
    3: "محدودیت در تعداد ارسال روزانه فعال است.",
    4: "محدودیت در حجم یا تعداد پیامک‌های ارسالی وجود دارد.",
    5: "شماره فرستنده یا سرشماره پیامکی معتبر نیست. MELLIPAYAMAK_FROM_NUMBER را در .env بررسی کنید.",
    6: "سامانه در حال بروزرسانی است؛ بعداً تلاش کنید.",
    7: "متن پیامک شامل کلمه یا عبارت فیلترشده است.",
    8: "تعداد پیامک‌ها کمتر از حداقل مجاز برای ارسال است.",
    9: "ارسال از خطوط عمومی از طریق وب‌سرویس مجاز نیست.",
    10: "پنل پیامکی غیرفعال یا مسدود شده است.",
    11: "شماره گیرنده در لیست سیاه مخابرات است.",
    12: "مدارک احراز هویت کاربر کامل نیست.",
    14: "سرشماره فرستنده امکان ارسال پیامک حاوی لینک را ندارد.",
    16: "شماره گیرنده یافت نشد؛ پارامتر to را بررسی کنید.",
    17: "متن پیامک خالی است یا متغیر text مقدار ندارد.",
    18: "شماره موبایل گیرنده نامعتبر است.",
    35: "شماره گیرنده در لیست سیاه مخابرات قرار دارد.",
}


def _parse_send_response(response_text):
    """
    پارس پاسخ XML و تشخیص موفقیت/خطا.
    موفق: عدد مثبت (شناسه پیام)
    ناموفق: عدد منفی یا رشته خطا
    """
    if not response_text or not response_text.strip():
        return False, "پاسخ خالی از سرور"
    text = response_text.strip()
    # حذف namespaces برای پارس ساده‌تر
    try:
        root = ET.fromstring(text)
        # یافتن مقدار داخل string
        for elem in root.iter():
            if elem.text and elem.text.strip():
                val = elem.text.strip()
                try:
                    num = int(val)
                    if num > 0:
                        return True, val
                    err_msg = MELLIPAYAMAK_ERROR_CODES.get(num, f"کد خطا از سرویس: {num}")
                    return False, err_msg
                except ValueError:
                    if any(x in val.lower() for x in ['error', 'exception', 'خطا', 'ناموفق']):
                        return False, val
                    return False, val
    except ET.ParseError:
        pass
    if 'Exception' in text or 'Error' in text or 'خطا' in text:
        return False, text[:300]
    if text.replace('.', '').replace('-', '').replace(' ', '').lstrip('-').isdigit():
        num = int(float(text))
        if num > 0:
            return True, text
        err_msg = MELLIPAYAMAK_ERROR_CODES.get(num, f"کد خطا از سرویس: {num}")
        return False, err_msg
    return False, text[:300]


def normalize_phone_for_sms(phone):
    """
    شماره تلفن را برای ارسال پیامک نرمال می‌کند.
    ملی پیامک معمولاً فرمت 09123456789 را قبول می‌کند.
    """
    if not phone:
        return None
    phone = re.sub(r'[\s\-\(\)]', '', str(phone).strip())
    # حذف پیش‌شماره بین‌المللی
    if phone.startswith('+98'):
        phone = '0' + phone[3:]
    elif phone.startswith('0098'):
        phone = '0' + phone[4:]
    elif phone.startswith('98') and len(phone) == 11:
        phone = '0' + phone
    if phone.startswith('9') and len(phone) == 10:
        phone = '0' + phone
    if re.match(r'^09\d{9}$', phone):
        return phone
    return None


def send_sms_mellipayamak(to_list, message, from_number=None):
    """
    ارسال پیامک با وب‌سرویس ملی پیامک
    
    Args:
        to_list: لیست شماره‌های گیرنده (می‌تواند رشته با جداسازی کاما/خط جدید هم باشد)
        message: متن پیامک
        from_number: شماره فرستنده (اگر خالی باشد از تنظیمات استفاده می‌شود)
        
    Returns:
        tuple: (success: bool, sent_count: int, error_message: str or None)
    """
    username = getattr(settings, 'MELLIPAYAMAK_USERNAME', None) or ''
    password = getattr(settings, 'MELLIPAYAMAK_PASSWORD', None) or ''
    default_from = getattr(settings, 'MELLIPAYAMAK_FROM_NUMBER', None) or ''
    
    if not username or not password:
        logger.warning("MELLIPAYAMAK_USERNAME or MELLIPAYAMAK_PASSWORD not configured.")
        return False, 0, "تنظیمات ملی پیامک کامل نیست. لطفاً USERNAME و PASSWORD را در .env قرار دهید."
    
    from_num = from_number or default_from
    if not from_num:
        return False, 0, "شماره فرستنده تنظیم نشده است."
    
    # نرمال‌سازی گیرندگان
    if isinstance(to_list, str):
        to_list = [
            p.strip() for p in re.split(r'[\s,،;\n]+', to_list) 
            if p.strip()
        ]
    
    phones = []
    for p in to_list:
        normalized = normalize_phone_for_sms(p)
        if normalized and normalized not in phones:
            phones.append(normalized)
    
    if not phones:
        return False, 0, "هیچ شماره معتبری یافت نشد."
    
    if not message or not message.strip():
        return False, 0, "متن پیامک نمی‌تواند خالی باشد."
    
    # ملی پیامک SendSimpleSMS برای هر شماره جداگانه فراخوانی می‌شود
    # (یا می‌توان برای چند شماره در یک درخواست از SendSMS2 استفاده کرد - فعلاً ساده‌تر یک به یک)
    # طبق مستندات، برای چند شماره می‌توان چند پارامتر to ارسال کرد
    payload = {
        'username': username,
        'password': password,
        'from': from_num,
        'text': message.strip(),
        'isflash': 'false',
    }
    
    success_count = 0
    last_error = None
    
    for phone in phones:
        payload['to'] = phone
        try:
            response = requests.post(
                MELLIPAYAMAK_SEND_URL,
                data=payload,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=15
            )
            raw_text = response.text or ""
            logger.info(f"SMS API raw response for {phone}: {raw_text[:500]}")
            
            if response.status_code == 200:
                ok, msg = _parse_send_response(raw_text)
                if ok:
                    success_count += 1
                    logger.info(f"SMS sent successfully to {phone}")
                else:
                    last_error = msg
                    logger.error(f"SMS failed for {phone}: {last_error}")
            else:
                last_error = f"HTTP {response.status_code}: {raw_text[:200]}"
                logger.error(f"SMS failed for {phone}: {last_error}")
        except requests.exceptions.RequestException as e:
            last_error = str(e)
            logger.error(f"Error sending SMS to {phone}: {e}", exc_info=True)
    
    if success_count == len(phones):
        return True, success_count, None
    if success_count > 0:
        return True, success_count, f"تعداد {success_count} از {len(phones)} پیامک ارسال شد. آخرین خطا: {last_error}"
    return False, 0, last_error or "خطا در ارسال پیامک"
