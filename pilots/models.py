"""
Models for pilots app
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .managers import PilotManager, PilotRequestManager
from .constants import (
    PILOT_STATUS_CHOICES,
    PILOT_ACTIVE,
    REQUEST_TYPE_CHOICES,
    REQUEST_STATUS_CHOICES,
    REQUEST_PENDING,
    LICENSE_TYPE_CHOICES,
)
from .validators import (
    validate_license_number,
    validate_flight_hours,
)

User = get_user_model()


class Pilot(models.Model):
    """
    Pilot model representing pilots
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='pilot_profile',
        verbose_name=_('کاربر'),
    )
    
    license_number = models.CharField(
        _('شماره مجوز'),
        max_length=20,
        unique=True,
        validators=[validate_license_number],
        db_index=True,
    )
    
    license_type = models.CharField(
        _('نوع مجوز'),
        max_length=20,
        choices=LICENSE_TYPE_CHOICES,
    )
    
    license_expiry = models.DateField(_('تاریخ انقضای مجوز'))
    
    total_flight_hours = models.IntegerField(
        _('کل ساعات پرواز'),
        default=0,
        validators=[validate_flight_hours],
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=PILOT_STATUS_CHOICES,
        default=PILOT_ACTIVE,
        db_index=True,
    )
    
    # Additional Information
    aircraft_types_certified = models.JSONField(
        _('انواع هواپیماهای مجاز'),
        default=list,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = PilotManager()
    
    class Meta:
        verbose_name = _('خلبان')
        verbose_name_plural = _('خلبانان')
        ordering = ['user__last_name', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.license_number}"


class PilotRequest(models.Model):
    """
    PilotRequest model for pilot requests
    """
    pilot = models.ForeignKey(
        Pilot,
        on_delete=models.CASCADE,
        related_name='requests',
        verbose_name=_('خلبان'),
    )
    
    request_type = models.CharField(
        _('نوع درخواست'),
        max_length=20,
        choices=REQUEST_TYPE_CHOICES,
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=REQUEST_STATUS_CHOICES,
        default=REQUEST_PENDING,
        db_index=True,
    )
    
    title = models.CharField(_('عنوان'), max_length=200)
    description = models.TextField(_('توضیحات'))
    
    # Request Details
    requested_date = models.DateTimeField(_('تاریخ درخواست شده'), null=True, blank=True)
    flight = models.ForeignKey(
        'flights.Flight',
        on_delete=models.CASCADE,
        related_name='pilot_requests',
        verbose_name=_('پرواز'),
        null=True,
        blank=True,
    )
    
    # Response
    response = models.TextField(_('پاسخ'), null=True, blank=True)
    responded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='pilot_request_responses',
        verbose_name=_('پاسخ‌دهنده'),
        null=True,
        blank=True,
    )
    responded_at = models.DateTimeField(_('تاریخ پاسخ'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = PilotRequestManager()
    
    class Meta:
        verbose_name = _('درخواست خلبان')
        verbose_name_plural = _('درخواست‌های خلبانان')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.pilot.user.get_full_name()} - {self.get_request_type_display()}"
