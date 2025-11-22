"""
Models for notifications app
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .managers import NotificationManager
from .constants import (
    NOTIFICATION_TYPE_CHOICES,
    NOTIFICATION_CHANNEL_CHOICES,
    CHANNEL_EMAIL,
    NOTIFICATION_STATUS_CHOICES,
    NOTIFICATION_PENDING,
    NOTIFICATION_PRIORITY_CHOICES,
    PRIORITY_NORMAL,
)

User = get_user_model()


class Notification(models.Model):
    """
    Notification model for user notifications
    """
    # UUID for external references
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        null=True,  # موقتاً برای migration
        blank=True,
        db_index=True,
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('کاربر'),
        db_index=True,
    )
    
    notification_type = models.CharField(
        _('نوع اعلان'),
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        db_index=True,
    )
    
    channel = models.CharField(
        _('کانال'),
        max_length=20,
        choices=NOTIFICATION_CHANNEL_CHOICES,
        default=CHANNEL_EMAIL,
    )
    
    title = models.CharField(_('عنوان'), max_length=200)
    message = models.TextField(_('پیام'))
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=NOTIFICATION_STATUS_CHOICES,
        default=NOTIFICATION_PENDING,
        db_index=True,
    )
    
    priority = models.CharField(
        _('اولویت'),
        max_length=20,
        choices=NOTIFICATION_PRIORITY_CHOICES,
        default=PRIORITY_NORMAL,
    )
    
    is_read = models.BooleanField(_('خوانده شده'), default=False)
    read_at = models.DateTimeField(_('تاریخ خواندن'), null=True, blank=True)
    
    # Additional data
    metadata = models.JSONField(_('اطلاعات اضافی'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    sent_at = models.DateTimeField(_('تاریخ ارسال'), null=True, blank=True)
    
    objects = NotificationManager()
    
    class Meta:
        verbose_name = _('اعلان')
        verbose_name_plural = _('اعلان‌ها')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['uuid']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['notification_type', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
