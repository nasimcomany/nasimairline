"""
دستور تست تلگرام: python manage.py test_telegram
"""
from django.core.management.base import BaseCommand
from django.conf import settings
import requests


class Command(BaseCommand):
    help = 'تست ارسال پیام به تلگرام'

    def handle(self, *args, **options):
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '') or ''
        chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', '') or ''
        chat_id = str(chat_id).strip()

        self.stdout.write(f"TOKEN: {'***' + token[-6:] if token else 'خالی!'}")
        self.stdout.write(f"CHAT_ID: '{chat_id}'")

        if not token or not chat_id:
            self.stderr.write(
                self.style.ERROR('TELEGRAM_BOT_TOKEN یا TELEGRAM_CHAT_ID در تنظیمات خالی است!')
            )
            return

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': '🔔 تست: اگر این پیام را می‌بینی، تلگرام درست کار می‌کند!',
        }
        proxies = None
        proxy = getattr(settings, 'TELEGRAM_PROXY', None) or ''
        if proxy:
            proxies = {'http': proxy, 'https': proxy}
            self.stdout.write(f"استفاده از پروکسی: {proxy}")

        try:
            r = requests.post(url, json=payload, timeout=15, proxies=proxies)
            data = r.json()
            if r.status_code == 200 and data.get('ok'):
                self.stdout.write(self.style.SUCCESS('✅ پیام ارسال شد! چک کن در تلگرام اومده یا نه.'))
            else:
                self.stderr.write(self.style.ERROR(f'❌ خطا: {data}'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'❌ خطا: {e}'))
