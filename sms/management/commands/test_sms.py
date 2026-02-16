"""
دستور تست پیامک: python manage.py test_sms
"""
from django.core.management.base import BaseCommand
from sms.services import send_sms_mellipayamak


class Command(BaseCommand):
    help = 'تست ارسال پیامک با ملی پیامک'

    def add_arguments(self, parser):
        parser.add_argument('phone', nargs='?', type=str, default='', help='شماره گیرنده (مثال: 09123456789)')

    def handle(self, *args, **options):
        phone = options.get('phone', '').strip()
        if not phone:
            phone = input('شماره گیرنده را وارد کنید (مثال 09123456789): ').strip()
        
        if not phone:
            self.stderr.write(self.style.ERROR('شماره الزامی است.'))
            return

        msg = 'Test SMS - Nasim Air'
        self.stdout.write(f'Sending to {phone}...')
        
        success, count, err = send_sms_mellipayamak([phone], msg)
        
        if success and count > 0:
            self.stdout.write(self.style.SUCCESS(f'OK: SMS sent ({count}). Check your phone.'))
        else:
            self.stderr.write(self.style.ERROR(f'FAILED: {err}'))
