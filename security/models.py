"""
Models for security app
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from flights.models import Flight
from .managers import SecurityInfoManager, SecurityAlertManager
from .constants import (
    SECURITY_LEVEL_CHOICES,
    SECURITY_NORMAL,
    THREAT_TYPE_CHOICES,
    ALERT_STATUS_CHOICES,
    ALERT_ACTIVE,
)


class SecurityInfo(models.Model):
    """
    SecurityInfo model for flight security information
    """
    flight = models.OneToOneField(
        Flight,
        on_delete=models.CASCADE,
        related_name='security_info',
        verbose_name=_('پرواز'),
    )
    
    security_level = models.CharField(
        _('سطح امنیتی'),
        max_length=20,
        choices=SECURITY_LEVEL_CHOICES,
        default=SECURITY_NORMAL,
        db_index=True,
    )
    
    # Security Details
    passenger_screening = models.BooleanField(_('بررسی مسافران'), default=True)
    baggage_screening = models.BooleanField(_('بررسی بار'), default=True)
    special_instructions = models.TextField(_('دستورالعمل‌های ویژه'), null=True, blank=True)
    
    # Restricted Passengers
    restricted_passengers = models.JSONField(
        _('مسافران محدود شده'),
        default=list,
        blank=True,
    )
    
    # Additional Information
    notes = models.TextField(_('یادداشت‌ها'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = SecurityInfoManager()
    
    class Meta:
        verbose_name = _('اطلاعات امنیتی')
        verbose_name_plural = _('اطلاعات امنیتی')
    
    def __str__(self):
        return f"Security Info - {self.flight.flight_number}"


class SecurityAlert(models.Model):
    """
    SecurityAlert model for security alerts
    """
    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name='security_alerts',
        verbose_name=_('پرواز'),
        null=True,
        blank=True,
    )
    
    threat_type = models.CharField(
        _('نوع تهدید'),
        max_length=20,
        choices=THREAT_TYPE_CHOICES,
    )
    
    security_level = models.CharField(
        _('سطح امنیتی'),
        max_length=20,
        choices=SECURITY_LEVEL_CHOICES,
        default=SECURITY_NORMAL,
    )
    
    title = models.CharField(_('عنوان'), max_length=200)
    description = models.TextField(_('توضیحات'))
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=ALERT_STATUS_CHOICES,
        default=ALERT_ACTIVE,
        db_index=True,
    )
    
    # Resolution
    resolved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        related_name='resolved_alerts',
        verbose_name=_('حل شده توسط'),
        null=True,
        blank=True,
    )
    resolved_at = models.DateTimeField(_('تاریخ حل'), null=True, blank=True)
    resolution_notes = models.TextField(_('یادداشت‌های حل'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = SecurityAlertManager()
    
    class Meta:
        verbose_name = _('هشدار امنیتی')
        verbose_name_plural = _('هشدارهای امنیتی')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_threat_type_display()}"
