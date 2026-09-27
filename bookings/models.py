"""
Models for bookings app
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from flights.models import Flight
from .managers import BookingManager, PassengerManager
from .constants import (
    BOOKING_STATUS_CHOICES,
    BOOKING_PENDING,
    BOOKING_TYPE_CHOICES,
    BOOKING_TYPE_ONE_WAY,
    PASSENGER_TYPE_CHOICES,
    PASSENGER_ADULT,
    BOOKING_SOURCE_CHOICES,
    BOOKING_SOURCE_WEB,
)
from flights.constants import (
    CABIN_CLASS_CHOICES,
    CABIN_ECONOMY,
)
from .validators import (
    validate_booking_reference,
    validate_seat_number,
    validate_passenger_age,
)

User = get_user_model()


class Booking(models.Model):
    """
    Booking model representing flight bookings
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
    
    booking_reference = models.CharField(
        _('کد رزرو'),
        max_length=10,
        unique=True,
        validators=[validate_booking_reference],
        db_index=True,
    )
    
    # User
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name=_('کاربر'),
        db_index=True,
    )
    
    # Flight
    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name=_('پرواز'),
        db_index=True,
    )
    
    # Booking Details
    booking_type = models.CharField(
        _('نوع رزرو'),
        max_length=20,
        choices=BOOKING_TYPE_CHOICES,
        default=BOOKING_TYPE_ONE_WAY,
    )
    cabin_class = models.CharField(
        _('کلاس کابین'),
        max_length=20,
        choices=CABIN_CLASS_CHOICES,
        default=CABIN_ECONOMY,
    )
    
    # Pricing
    base_price = models.DecimalField(
        _('قیمت پایه'),
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    extras_price = models.DecimalField(
        _('قیمت خدمات اضافی'),
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    taxes = models.DecimalField(
        _('مالیات و عوارض'),
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    total_amount = models.DecimalField(
        _('مبلغ کل'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    
    # Status
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default=BOOKING_PENDING,
        db_index=True,
    )
    
    # Additional Information
    booking_source = models.CharField(
        _('منبع رزرو'),
        max_length=20,
        choices=BOOKING_SOURCE_CHOICES,
        default=BOOKING_SOURCE_WEB,
    )
    booking_ip = models.GenericIPAddressField(
        _('آی‌پی رزرو'),
        null=True,
        blank=True,
        db_index=True,
    )
    special_requests = models.TextField(
        _('درخواست‌های ویژه'),
        null=True,
        blank=True,
    )
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات اضافی رزرو به صورت JSON'),
    )
    hold_expires_at = models.DateTimeField(
        _('انقضای رزرو موقت'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('تا این زمان صندلی به‌صورت soft-hold قفل است'),
    )
    idempotency_key = models.CharField(
        _('کلید تکرارناپذیر'),
        max_length=64,
        null=True,
        blank=True,
        unique=True,
        db_index=True,
        help_text=_('جلوگیری از دوبار ساختن رزرو با دابل‌کلیک'),
    )
    # Nira / airline ticketing (filled after Nira payment callback)
    nira_pnr = models.CharField(
        _('PNR نیرا'),
        max_length=32,
        null=True,
        blank=True,
        db_index=True,
    )
    nira_ticket_numbers = models.JSONField(
        _('شماره بلیط‌های نیرا'),
        default=list,
        blank=True,
        help_text=_('لیست شماره بلیط الکترونیک پس از صدور'),
    )
    nira_session_id = models.CharField(
        _('Session نیرا'),
        max_length=128,
        null=True,
        blank=True,
        db_index=True,
    )
    ticket_issued_at = models.DateTimeField(
        _('زمان صدور بلیط'),
        null=True,
        blank=True,
        db_index=True,
    )
    cancellation_reason = models.TextField(
        _('دلیل لغو'),
        null=True,
        blank=True,
    )
    cancelled_at = models.DateTimeField(
        _('تاریخ لغو'),
        null=True,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = BookingManager()
    
    class Meta:
        verbose_name = _('رزرو')
        verbose_name_plural = _('رزروها')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['uuid']),
            models.Index(fields=['booking_reference']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['flight', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['booking_ip']),
        ]
    
    def __str__(self):
        return f"{self.booking_reference} - {self.user.email}"
    
    def is_refundable(self):
        """Check if booking is refundable"""
        from .utils import is_booking_refundable
        return is_booking_refundable(self)
    
    def can_modify(self):
        """Check if booking can be modified"""
        from .utils import can_modify_booking
        return can_modify_booking(self)
    
    def get_passenger_count(self):
        """Get passenger count breakdown"""
        from .utils import calculate_passenger_count
        return calculate_passenger_count(self)


class Passenger(models.Model):
    """
    Passenger model representing passengers in a booking
    """
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='passengers',
        verbose_name=_('رزرو'),
    )
    
    # Personal Information
    first_name = models.CharField(_('نام'), max_length=100)
    last_name = models.CharField(_('نام خانوادگی'), max_length=100)
    date_of_birth = models.DateField(_('تاریخ تولد'))
    gender = models.CharField(
        _('جنسیت'),
        max_length=10,
        choices=[('M', 'مرد'), ('F', 'زن')],
    )
    nationality = models.CharField(_('ملیت'), max_length=100, null=True, blank=True)
    
    # Passenger Type
    passenger_type = models.CharField(
        _('نوع مسافر'),
        max_length=20,
        choices=PASSENGER_TYPE_CHOICES,
        default=PASSENGER_ADULT,
    )
    
    # Travel Documents
    passport_number = models.CharField(
        _('شماره گذرنامه'),
        max_length=50,
        null=True,
        blank=True,
    )
    passport_expiry = models.DateField(
        _('تاریخ انقضای گذرنامه'),
        null=True,
        blank=True,
    )
    national_id = models.CharField(
        _('کد ملی'),
        max_length=10,
        null=True,
        blank=True,
    )
    
    # Seat Information
    seat_number = models.CharField(
        _('شماره صندلی'),
        max_length=10,
        null=True,
        blank=True,
        validators=[validate_seat_number],
    )
    
    # Special Requirements
    special_meal = models.BooleanField(_('وعده غذایی ویژه'), default=False)
    wheelchair_assistance = models.BooleanField(_('نیاز به ویلچر'), default=False)
    special_assistance = models.TextField(
        _('کمک‌های ویژه'),
        null=True,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = PassengerManager()
    
    class Meta:
        verbose_name = _('مسافر')
        verbose_name_plural = _('مسافران')
        ordering = ['booking', 'passenger_type', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.get_passenger_type_display()}"
    
    def get_full_name(self):
        """Return full name"""
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        """Override save to validate passenger age"""
        if self.date_of_birth and self.passenger_type:
            validate_passenger_age(self.date_of_birth, self.passenger_type)
        super().save(*args, **kwargs)


class BookingExtra(models.Model):
    """
    BookingExtra model for additional services
    """
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='extras',
        verbose_name=_('رزرو'),
    )
    
    service_type = models.CharField(
        _('نوع سرویس'),
        max_length=50,
    )
    service_name = models.CharField(_('نام سرویس'), max_length=200)
    quantity = models.IntegerField(_('تعداد'), default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(
        _('قیمت واحد'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    total_price = models.DecimalField(
        _('قیمت کل'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('خدمات اضافی')
        verbose_name_plural = _('خدمات اضافی')
    
    def __str__(self):
        return f"{self.service_name} - {self.booking.booking_reference}"
    
    def save(self, *args, **kwargs):
        """Calculate total price before saving"""
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
