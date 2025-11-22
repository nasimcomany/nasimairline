"""
Models for accounts app
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import UserManager
from .constants import (
    MEMBERSHIP_LEVELS,
    GENDER_CHOICES,
    TWO_FA_METHODS,
    SEAT_PREFERENCES,
    MEAL_PREFERENCES,
    ACCOUNT_STATUS_CHOICES,
    ACCOUNT_ACTIVE,
)
from .validators import (
    validate_iranian_phone_number,
    validate_passport_number,
    validate_national_id,
    validate_loyalty_points,
)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    # UUID for external references
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    # Basic Information
    email = models.EmailField(_('ایمیل'), unique=True, db_index=True)
    phone_number = models.CharField(
        _('شماره تلفن'),
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        validators=[validate_iranian_phone_number],
        db_index=True,
    )
    date_of_birth = models.DateField(_('تاریخ تولد'), null=True, blank=True)
    gender = models.CharField(
        _('جنسیت'),
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True,
    )
    nationality = models.CharField(_('ملیت'), max_length=100, null=True, blank=True)
    
    # Passport Information
    passport_number = models.CharField(
        _('شماره گذرنامه'),
        max_length=50,
        null=True,
        blank=True,
        validators=[validate_passport_number],
    )
    passport_expiry = models.DateField(_('تاریخ انقضای گذرنامه'), null=True, blank=True)
    national_id = models.CharField(
        _('کد ملی'),
        max_length=10,
        null=True,
        blank=True,
        validators=[validate_national_id],
    )
    
    # Loyalty System
    loyalty_points = models.IntegerField(
        _('امتیاز وفاداری'),
        default=0,
        validators=[validate_loyalty_points],
        db_index=True,
    )
    membership_level = models.CharField(
        _('سطح عضویت'),
        max_length=20,
        choices=MEMBERSHIP_LEVELS,
        default='BRONZE',
        db_index=True,
    )
    
    # Travel Preferences
    preferred_seat = models.CharField(
        _('ترجیح صندلی'),
        max_length=10,
        choices=SEAT_PREFERENCES,
        null=True,
        blank=True,
    )
    preferred_meal = models.CharField(
        _('ترجیح وعده غذایی'),
        max_length=50,
        choices=MEAL_PREFERENCES,
        null=True,
        blank=True,
    )
    
    # Two-Factor Authentication
    two_factor_enabled = models.BooleanField(_('احراز هویت دو مرحله‌ای فعال'), default=False)
    two_factor_method = models.CharField(
        _('روش احراز هویت دو مرحله‌ای'),
        max_length=20,
        choices=TWO_FA_METHODS,
        null=True,
        blank=True,
    )
    two_factor_secret = models.CharField(
        _('رمز احراز هویت دو مرحله‌ای'),
        max_length=100,
        null=True,
        blank=True,
    )
    
    # Account Status
    account_status = models.CharField(
        _('وضعیت حساب'),
        max_length=20,
        choices=ACCOUNT_STATUS_CHOICES,
        default=ACCOUNT_ACTIVE,
        db_index=True,
    )
    
    # IP Tracking
    last_login_ip = models.GenericIPAddressField(
        _('آی‌پی آخرین ورود'),
        null=True,
        blank=True,
        db_index=True,
    )
    registration_ip = models.GenericIPAddressField(
        _('آی‌پی ثبت‌نام'),
        null=True,
        blank=True,
    )
    
    # Additional Metadata
    preferences = models.JSONField(
        _('ترجیحات کاربر'),
        default=dict,
        blank=True,
        help_text=_('ترجیحات و تنظیمات کاربر به صورت JSON'),
    )
    
    # IP Tracking
    registration_ip = models.GenericIPAddressField(
        _('آی‌پی ثبت‌نام'),
        null=True,
        blank=True,
        db_index=True,
    )
    last_login_ip = models.GenericIPAddressField(
        _('آی‌پی آخرین ورود'),
        null=True,
        blank=True,
    )
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات اضافی به صورت JSON'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    last_login = models.DateTimeField(_('آخرین ورود'), null=True, blank=True)
    
    # Override username to make it optional
    username = models.CharField(
        _('نام کاربری'),
        max_length=150,
        unique=True,
        null=True,
        blank=True,
        help_text=_('اختیاری. اگر خالی باشد، از ایمیل استفاده می‌شود.'),
    )
    
    # Use email as username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('کاربر')
        verbose_name_plural = _('کاربران')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['uuid']),
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['membership_level', 'loyalty_points']),
            models.Index(fields=['account_status', 'is_active']),
            models.Index(fields=['registration_ip']),
            models.Index(fields=['created_at', 'account_status']),
        ]
    
    def __str__(self):
        return self.email or self.username or f"User {self.id}"
    
    def get_full_name(self):
        """Return full name"""
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    def get_short_name(self):
        """Return short name"""
        return self.first_name or self.email
    
    def is_premium_member(self):
        """Check if user is Gold or Platinum member"""
        return self.membership_level in ['GOLD', 'PLATINUM']
    
    def can_access_lounge(self):
        """Check if user can access airport lounge"""
        return self.membership_level == 'PLATINUM'
    
    def get_discount_percentage(self):
        """Get discount percentage based on membership level"""
        from .utils import get_membership_benefits
        benefits = get_membership_benefits(self.membership_level)
        return benefits.get('discount_percentage', 0)
