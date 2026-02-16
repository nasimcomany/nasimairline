from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class SmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sms'
    verbose_name = _('ارسال پیامک')
