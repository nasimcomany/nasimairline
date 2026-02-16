"""
Models for authentication app - Password Reset Code
"""
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import random
import string


def generate_reset_code():
    """Generate 6-digit numeric code"""
    return ''.join(random.choices(string.digits, k=6))


class PasswordResetCode(models.Model):
    """
    کد تأیید بازیابی رمز عبور - ارسال به ایمیل کاربر
    """
    email = models.EmailField(_('ایمیل'), db_index=True)
    code = models.CharField(_('کد تأیید'), max_length=6, default=generate_reset_code)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    expires_at = models.DateTimeField(_('انقضا'))
    is_used = models.BooleanField(_('استفاده شده'), default=False)
    
    class Meta:
        verbose_name = _('کد بازیابی رمز')
        verbose_name_plural = _('کدهای بازیابی رمز')
        ordering = ['-created_at']
    
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at
