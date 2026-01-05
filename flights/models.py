"""
Models for flights app
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.utils.text import slugify
from .managers import AirportManager, FlightManager, AircraftManager
from .constants import (
    FLIGHT_STATUS_CHOICES,
    FLIGHT_SCHEDULED,
    CABIN_CLASS_CHOICES,
    AIRCRAFT_TYPE_CHOICES,
    FLIGHT_TYPE_CHOICES,
)
from .validators import (
    validate_flight_number,
    validate_airport_code,
    validate_positive_price,
    validate_available_seats,
)


class Airport(models.Model):
    """
    Airport model representing airports
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        null=True,  # موقتاً برای migration
        blank=True,
        db_index=True,
    )
    code = models.CharField(
        _('کد فرودگاه'),
        max_length=3,
        unique=True,
        validators=[validate_airport_code],
        db_index=True,
        help_text=_('کد IATA فرودگاه (3 حرف)'),
    )
    name = models.CharField(_('نام فرودگاه'), max_length=200)
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=255,
        unique=True,
        blank=True,
        db_index=True,
        help_text=_('برای SEO و URL های دوستانه'),
    )
    city = models.CharField(_('شهر'), max_length=100, db_index=True)
    country = models.CharField(_('کشور'), max_length=100, db_index=True)
    
    # Location
    latitude = models.DecimalField(
        _('عرض جغرافیایی'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    longitude = models.DecimalField(
        _('طول جغرافیایی'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    
    # Additional Information
    timezone = models.CharField(_('منطقه زمانی'), max_length=50, null=True, blank=True)
    is_active = models.BooleanField(_('فعال'), default=True, db_index=True)
    flight_count = models.PositiveIntegerField(_('تعداد پروازها'), default=0)
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات اضافی به صورت JSON'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = AirportManager()
    
    class Meta:
        verbose_name = _('فرودگاه')
        verbose_name_plural = _('فرودگاه‌ها')
        ordering = ['country', 'city', 'name']
        indexes = [
            models.Index(fields=['uuid']),
            models.Index(fields=['code']),
            models.Index(fields=['slug']),
            models.Index(fields=['country', 'city']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name} ({self.city}, {self.country})"
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided"""
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.code}")
        super().save(*args, **kwargs)
    
    def get_full_name(self):
        """Return full airport name"""
        return f"{self.name} ({self.code})"


class Aircraft(models.Model):
    """
    Aircraft model representing aircrafts
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        null=True,  # موقتاً برای migration
        blank=True,
        db_index=True,
    )
    registration_number = models.CharField(
        _('شماره ثبت'),
        max_length=20,
        unique=True,
        db_index=True,
    )
    model = models.CharField(_('مدل'), max_length=100, db_index=True)
    manufacturer = models.CharField(_('سازنده'), max_length=100)
    aircraft_type = models.CharField(
        _('نوع هواپیما'),
        max_length=20,
        choices=AIRCRAFT_TYPE_CHOICES,
        null=True,
        blank=True,
    )
    
    # Seat Configuration
    total_seats = models.PositiveIntegerField(
        _('کل صندلی‌ها'),
        validators=[MinValueValidator(1)],
    )
    economy_seats = models.PositiveIntegerField(
        _('صندلی‌های اکونومی'),
        validators=[MinValueValidator(0)],
        default=0,
    )
    business_seats = models.PositiveIntegerField(
        _('صندلی‌های بیزینس'),
        validators=[MinValueValidator(0)],
        default=0,
    )
    first_class_seats = models.PositiveIntegerField(
        _('صندلی‌های فرست کلاس'),
        validators=[MinValueValidator(0)],
        default=0,
    )
    
    # Status
    is_active = models.BooleanField(_('فعال'), default=True, db_index=True)
    in_service_date = models.DateField(_('تاریخ ورود به خدمت'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = AircraftManager()
    
    class Meta:
        verbose_name = _('هواپیما')
        verbose_name_plural = _('هواپیماها')
        ordering = ['manufacturer', 'model', 'registration_number']
        indexes = [
            models.Index(fields=['uuid']),
            models.Index(fields=['registration_number']),
            models.Index(fields=['model']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.model} - {self.registration_number}"
    
    def save(self, *args, **kwargs):
        """Override save to validate seat configuration"""
        from .validators import validate_seat_capacity
        if self.pk:  # Only validate on update
            validate_seat_capacity(
                self.total_seats,
                self.economy_seats,
                self.business_seats,
                self.first_class_seats
            )
        super().save(*args, **kwargs)


class Flight(models.Model):
    """
    Flight model representing flights
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        null=True,  # موقتاً برای migration
        blank=True,
        db_index=True,
    )
    flight_number = models.CharField(
        _('شماره پرواز'),
        max_length=20,
        unique=True,
        validators=[validate_flight_number],
        db_index=True,
    )
    
    # Route
    origin = models.ForeignKey(
        Airport,
        on_delete=models.CASCADE,
        related_name='departures',
        verbose_name=_('مبدا'),
        db_index=True,
    )
    destination = models.ForeignKey(
        Airport,
        on_delete=models.CASCADE,
        related_name='arrivals',
        verbose_name=_('مقصد'),
        db_index=True,
    )
    
    # Aircraft
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.CASCADE,
        related_name='flights',
        verbose_name=_('هواپیما'),
    )
    
    # Schedule
    departure_time = models.DateTimeField(_('زمان پرواز'), db_index=True)
    arrival_time = models.DateTimeField(_('زمان فرود'), db_index=True)
    departure_date = models.DateField(_('تاریخ پرواز'), db_index=True, null=True, blank=True)
    arrival_date = models.DateField(_('تاریخ فرود'), db_index=True, null=True, blank=True)
    departure_time_only = models.TimeField(_('ساعت پرواز'), null=True, blank=True)
    arrival_time_only = models.TimeField(_('ساعت فرود'), null=True, blank=True)
    duration = models.DurationField(_('مدت پرواز'), null=True, blank=True)
    
    # Pricing
    economy_price = models.DecimalField(
        _('قیمت اکونومی'),
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive_price],
    )
    business_price = models.DecimalField(
        _('قیمت بیزینس'),
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive_price],
    )
    first_class_price = models.DecimalField(
        _('قیمت فرست کلاس'),
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive_price],
    )
    
    # Availability
    economy_available = models.PositiveIntegerField(
        _('صندلی‌های اکونومی موجود'),
        validators=[MinValueValidator(0)],
        default=0,
    )
    business_available = models.PositiveIntegerField(
        _('صندلی‌های بیزینس موجود'),
        validators=[MinValueValidator(0)],
        default=0,
    )
    first_class_available = models.PositiveIntegerField(
        _('صندلی‌های فرست کلاس موجود'),
        validators=[MinValueValidator(0)],
        default=0,
    )
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات اضافی به صورت JSON (مثل شرایط آب و هوا، تاخیرات و...)'),
    )
    
    # Status
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=FLIGHT_STATUS_CHOICES,
        default=FLIGHT_SCHEDULED,
        db_index=True,
    )
    
    # Additional Information
    flight_type = models.CharField(
        _('نوع پرواز'),
        max_length=20,
        choices=FLIGHT_TYPE_CHOICES,
        default='DIRECT',
    )
    gate = models.CharField(_('گیت'), max_length=10, null=True, blank=True)
    departure_gate = models.CharField(_('گیت پرواز'), max_length=10, null=True, blank=True)
    arrival_gate = models.CharField(_('گیت فرود'), max_length=10, null=True, blank=True)
    terminal = models.CharField(_('ترمینال'), max_length=10, null=True, blank=True)
    
    # Real-time Information (از API های خارجی)
    actual_departure_time = models.DateTimeField(
        _('زمان واقعی پرواز'),
        null=True,
        blank=True,
        help_text=_('زمان واقعی پرواز (از API های خارجی)'),
    )
    actual_arrival_time = models.DateTimeField(
        _('زمان واقعی فرود'),
        null=True,
        blank=True,
        help_text=_('زمان واقعی فرود (از API های خارجی)'),
    )
    delay_minutes = models.IntegerField(
        _('تأخیر به دقیقه'),
        null=True,
        blank=True,
        help_text=_('تأخیر پرواز به دقیقه (از API های خارجی)'),
    )
    stops = models.PositiveIntegerField(
        _('تعداد توقف'),
        default=0,
        help_text=_('تعداد توقف پرواز (می‌تواند از FlightDurationTime محاسبه شود)'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = FlightManager()
    
    class Meta:
        verbose_name = _('پرواز')
        verbose_name_plural = _('پروازها')
        ordering = ['departure_time']
        indexes = [
            models.Index(fields=['uuid']),
            models.Index(fields=['flight_number']),
            models.Index(fields=['origin', 'destination']),
            models.Index(fields=['departure_time']),
            models.Index(fields=['departure_date']),
            models.Index(fields=['status']),
            models.Index(fields=['origin', 'destination', 'departure_date']),
            models.Index(fields=['status', 'departure_date']),
        ]
    
    def __str__(self):
        return f"{self.flight_number} - {self.origin.code} to {self.destination.code}"
    
    def get_route(self):
        """Return route string"""
        return f"{self.origin.code} → {self.destination.code}"
    
    def is_available(self, cabin_class='ECONOMY', seats=1):
        """Check if flight has available seats"""
        from .utils import is_flight_available
        return is_flight_available(self, cabin_class, seats)
    
    def get_price(self, cabin_class='ECONOMY'):
        """Get price for cabin class"""
        from .utils import get_price_for_cabin
        return get_price_for_cabin(self, cabin_class)
    
    def save(self, *args, **kwargs):
        """Auto-populate date fields from datetime"""
        if self.departure_time and not self.departure_date:
            self.departure_date = self.departure_time.date()
            self.departure_time_only = self.departure_time.time()
        if self.arrival_time and not self.arrival_date:
            self.arrival_date = self.arrival_time.date()
            self.arrival_time_only = self.arrival_time.time()
        super().save(*args, **kwargs)
