"""
دستور تست ارسال ایمیل شکایت
استفاده: python manage.py test_complaint_email
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'تست ارسال ایمیل شکایت به آدرس‌های COMPLAINT_NOTIFICATION_EMAILS'

    def handle(self, *args, **options):
        recipients = getattr(settings, 'COMPLAINT_NOTIFICATION_EMAILS', [])
        from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
        
        self.stdout.write(f'Backend: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'From: {from_email}')
        self.stdout.write(f'To: {recipients}')
        self.stdout.write('')
        
        try:
            send_mail(
                subject='[Test] Complaint Email - Server Test',
                message='This is a test email for complaint notifications.',
                from_email=from_email,
                recipient_list=recipients,
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS('Email sent successfully! Check inbox (and spam).'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
            self.stdout.write('')
            self.stdout.write('For Gmail: use App Password from https://myaccount.google.com/apppasswords')
