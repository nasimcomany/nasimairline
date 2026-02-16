"""
مدل‌های مربوط به ارسال پیامک
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class SmsLog(models.Model):
    """
    لاگ ارسال پیامک برای پیگیری و آمار
    """
    RECIPIENT_TIER = 'TIER'
    RECIPIENT_CUSTOM = 'CUSTOM'
    RECIPIENT_CHOICES = [
        (RECIPIENT_TIER, _('مشتریان باشگاه (برنزی/نقره‌ای/طلایی)')),
        (RECIPIENT_CUSTOM, _('شماره‌های دلخواه')),
    ]
    
    STATUS_PENDING = 'PENDING'
    STATUS_SENT = 'SENT'
    STATUS_PARTIAL = 'PARTIAL'
    STATUS_FAILED = 'FAILED'
    STATUS_CHOICES = [
        (STATUS_PENDING, _('در انتظار')),
        (STATUS_SENT, _('ارسال شد')),
        (STATUS_PARTIAL, _('ارسال جزئی')),
        (STATUS_FAILED, _('ناموفق')),
    ]
    
    recipient_type = models.CharField(
        _('نوع گیرندگان'),
        max_length=10,
        choices=RECIPIENT_CHOICES
    )
    # برای TIER: مقادیر مثلاً ["BRONZE","SILVER","GOLD"]
    tiers = models.JSONField(
        _('سطح‌های عضویت'),
        default=list,
        blank=True,
        help_text=_('مثلاً ["BRONZE","SILVER","GOLD"]')
    )
    # برای CUSTOM: شماره‌ها با کاما یا خط جدید جدا شده
    custom_numbers_raw = models.TextField(
        _('شماره‌های دلخواه'),
        blank=True,
        help_text=_('شماره‌ها را با کاما یا خط جدید جدا کنید')
    )
    message = models.TextField(_('متن پیامک'))
    status = models.CharField(
        _('وضعیت'),
        max_length=10,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    sent_count = models.PositiveIntegerField(_('تعداد ارسال شده'), default=0)
    total_recipients = models.PositiveIntegerField(_('تعداد کل گیرندگان'), default=0)
    error_message = models.TextField(_('پیام خطا'), blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sms_logs',
        verbose_name=_('ارسال توسط')
    )
    created_at = models.DateTimeField(_('تاریخ ارسال'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('لاگ پیامک')
        verbose_name_plural = _('لاگ‌های پیامک')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_recipient_type_display()} - {self.sent_count}/{self.total_recipients} - {self.created_at}"
