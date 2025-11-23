"""
اسکریپت تست برای ارسال پیام واتساپ
برای تست، این فایل را اجرا کنید:
python test_whatsapp.py
"""
import os
import sys
import django

# تنظیم Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nasim.settings')
django.setup()

from support.utils import send_whatsapp_message

# شماره واتساپ شما (با کد کشور)
PHONE_NUMBER = "+989379146130"  # 09379146130 با کد کشور ایران

# پیام تست
TEST_MESSAGE = """🔔 تست پیام واتساپ

این یک پیام تست از سیستم چت آنلاین است.

اگر این پیام را دریافت کردید، تنظیمات واتساپ به درستی کار می‌کند! ✅"""

if __name__ == "__main__":
    print(f"در حال ارسال پیام تست به {PHONE_NUMBER}...")
    print(f"پیام: {TEST_MESSAGE}")
    print("-" * 50)
    
    result = send_whatsapp_message(PHONE_NUMBER, TEST_MESSAGE)
    
    if result:
        print("✅ پیام با موفقیت ارسال شد!")
    else:
        print("❌ ارسال پیام ناموفق بود.")
        print("\nلطفاً تنظیمات زیر را در فایل .env بررسی کنید:")
        print("- WHATSAPP_API_URL")
        print("- WHATSAPP_API_KEY")
        print("- WHATSAPP_PHONE_ID (در صورت نیاز)")
        print("\nهمچنین می‌توانید لاگ‌های Django را بررسی کنید.")

