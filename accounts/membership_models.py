"""
Membership and Loyalty System Models
مدل‌های سیستم باشگاه مشتریان با قابلیت تنظیم توسط ادمین
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


class MembershipTierConfig(models.Model):
    """
    تنظیمات tier های باشگاه مشتریان (قابل تنظیم توسط ادمین)
    ادمین می‌تونه معیارها و اولویت‌ها رو تنظیم کنه
    """
    TIER_BRONZE = 'BRONZE'
    TIER_SILVER = 'SILVER'
    TIER_GOLD = 'GOLD'
    TIER_PLATINUM = 'PLATINUM'
    
    TIER_CHOICES = [
        (TIER_BRONZE, 'برنزی'),
        (TIER_SILVER, 'نقره‌ای'),
        (TIER_GOLD, 'طلایی'),
        (TIER_PLATINUM, 'پلاتینیوم'),
    ]
    
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )
    tier = models.CharField(
        _('سطح عضویت'),
        max_length=20,
        choices=TIER_CHOICES,
        unique=True,
        db_index=True
    )
    name_fa = models.CharField(_('نام فارسی'), max_length=50, default='')
    name_en = models.CharField(_('نام انگلیسی'), max_length=50, default='')
    
    # معیارها برای ارتقا (همه اختیاری - ادمین تعیین می‌کنه کدوم فعال باشه)
    
    # تعداد رزرو
    min_bookings_total = models.IntegerField(
        _('حداقل تعداد رزرو (کل)'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='حداقل تعداد رزروهای کامل شده (0 = غیرفعال)'
    )
    min_bookings_per_month = models.IntegerField(
        _('حداقل رزرو در ماه'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='حداقل تعداد رزرو در یک ماه (0 = غیرفعال)'
    )
    min_bookings_per_week = models.IntegerField(
        _('حداقل رزرو در هفته'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='حداقل تعداد رزرو در یک هفته (0 = غیرفعال)'
    )
    
    # بازه زمانی عضویت
    min_membership_days = models.IntegerField(
        _('حداقل روز عضویت'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='حداقل تعداد روز از تاریخ ثبت‌نام (0 = غیرفعال)'
    )
    
    # فرکانس استفاده
    min_active_months = models.IntegerField(
        _('حداقل ماه فعال'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='حداقل تعداد ماه‌هایی که کاربر حداقل 1 رزرو داشته (0 = غیرفعال)'
    )
    
    # موارد دیگر
    min_completed_flights = models.IntegerField(
        _('حداقل پرواز انجام شده'),
        default=0,
        validators=[MinValueValidator(0)],
        help_text='حداقل تعداد پروازهایی که کاربر انجام داده (0 = غیرفعال)'
    )
    
    # اولویت معیارها (1 = بالاترین اولویت)
    criteria_priority_1 = models.CharField(
        _('معیار اولویت 1'),
        max_length=50,
        choices=[
            ('total_bookings', 'تعداد کل رزرو'),
            ('monthly_bookings', 'رزرو ماهانه'),
            ('weekly_bookings', 'رزرو هفتگی'),
            ('membership_duration', 'مدت عضویت'),
            ('active_months', 'ماه‌های فعال'),
            ('completed_flights', 'پروازهای انجام شده'),
        ],
        default='total_bookings'
    )
    criteria_priority_2 = models.CharField(
        _('معیار اولویت 2'),
        max_length=50,
        choices=[
            ('total_bookings', 'تعداد کل رزرو'),
            ('monthly_bookings', 'رزرو ماهانه'),
            ('weekly_bookings', 'رزرو هفتگی'),
            ('membership_duration', 'مدت عضویت'),
            ('active_months', 'ماه‌های فعال'),
            ('completed_flights', 'پروازهای انجام شده'),
        ],
        blank=True,
        null=True
    )
    criteria_priority_3 = models.CharField(
        _('معیار اولویت 3'),
        max_length=50,
        choices=[
            ('total_bookings', 'تعداد کل رزرو'),
            ('monthly_bookings', 'رزرو ماهانه'),
            ('weekly_bookings', 'رزرو هفتگی'),
            ('membership_duration', 'مدت عضویت'),
            ('active_months', 'ماه‌های فعال'),
            ('completed_flights', 'پروازهای انجام شده'),
        ],
        blank=True,
        null=True
    )
    
    # تنظیمات
    is_active = models.BooleanField(_('فعال'), default=True)
    auto_upgrade = models.BooleanField(
        _('ارتقا خودکار'),
        default=True,
        help_text='آیا کاربران به صورت خودکار ارتقا پیدا کنند؟'
    )
    
    # Metadata
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ آخرین بروزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('تنظیمات سطح عضویت')
        verbose_name_plural = _('تنظیمات سطوح عضویت')
        ordering = ['tier']
    
    def __str__(self):
        return f"{self.get_tier_display()} - {self.name_fa}"


class UserMembershipActivity(models.Model):
    """
    فعالیت‌های کاربر برای محاسبه tier
    این مدل تمام فعالیت‌های مربوط به رزرو و پرواز رو track می‌کنه
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )
    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='membership_activity',
        verbose_name=_('کاربر')
    )
    
    # آمار رزرو
    total_bookings = models.IntegerField(
        _('تعداد کل رزرو'),
        default=0,
        help_text='تعداد کل رزروهای تکمیل شده'
    )
    total_completed_flights = models.IntegerField(
        _('تعداد پروازهای انجام شده'),
        default=0,
        help_text='تعداد پروازهایی که کاربر انجام داده'
    )
    
    # آمار زمانی
    first_booking_date = models.DateTimeField(
        _('تاریخ اولین رزرو'),
        null=True,
        blank=True
    )
    last_booking_date = models.DateTimeField(
        _('تاریخ آخرین رزرو'),
        null=True,
        blank=True
    )
    
    # فرکانس استفاده
    bookings_last_7_days = models.IntegerField(
        _('رزرو در 7 روز اخیر'),
        default=0
    )
    bookings_last_30_days = models.IntegerField(
        _('رزرو در 30 روز اخیر'),
        default=0
    )
    bookings_last_90_days = models.IntegerField(
        _('رزرو در 90 روز اخیر'),
        default=0
    )
    
    # ماه‌های فعال (ماه‌هایی که حداقل 1 رزرو داشته)
    active_months_count = models.IntegerField(
        _('تعداد ماه‌های فعال'),
        default=0,
        help_text='تعداد ماه‌هایی که کاربر حداقل 1 رزرو داشته'
    )
    
    # سایر آمار
    average_bookings_per_month = models.FloatField(
        _('میانگین رزرو ماهانه'),
        default=0.0
    )
    
    # تاریخ آخرین محاسبه
    last_calculated_at = models.DateTimeField(
        _('تاریخ آخرین محاسبه'),
        auto_now=True
    )
    
    # Metadata
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ بروزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('فعالیت عضویت کاربر')
        verbose_name_plural = _('فعالیت‌های عضویت کاربران')
        ordering = ['-total_bookings']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['total_bookings']),
            models.Index(fields=['last_booking_date']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.total_bookings} bookings"
    
    def calculate_membership_duration_days(self):
        """محاسبه تعداد روزهای عضویت"""
        if not self.user.date_joined:
            return 0
        delta = timezone.now() - self.user.date_joined
        return delta.days
    
    def update_statistics(self):
        """بروزرسانی آمارها"""
        from bookings.models import Booking
        from django.db.models import Count, Q
        from django.db.models.functions import TruncMonth
        from datetime import timedelta
        
        now = timezone.now()
        
        # تعداد کل رزروهای تکمیل شده یا تایید شده
        completed_bookings = Booking.objects.filter(
            user=self.user,
            status__in=['CONFIRMED', 'COMPLETED']
        )
        self.total_bookings = completed_bookings.count()
        
        # تاریخ اولین و آخرین رزرو
        if self.total_bookings > 0:
            first_booking = completed_bookings.order_by('created_at').first()
            last_booking = completed_bookings.order_by('-created_at').first()
            if first_booking:
                self.first_booking_date = first_booking.created_at
            if last_booking:
                self.last_booking_date = last_booking.created_at
        
        # رزروهای اخیر
        self.bookings_last_7_days = completed_bookings.filter(
            created_at__gte=now - timedelta(days=7)
        ).count()
        
        self.bookings_last_30_days = completed_bookings.filter(
            created_at__gte=now - timedelta(days=30)
        ).count()
        
        self.bookings_last_90_days = completed_bookings.filter(
            created_at__gte=now - timedelta(days=90)
        ).count()
        
        # محاسبه ماه‌های فعال
        # ماه‌هایی که کاربر حداقل 1 رزرو داشته
        bookings_by_month = 0
        if completed_bookings.exists():
            bookings_by_month = (
                completed_bookings
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .distinct()
                .count()
            )

        # برای همخوانی با روزهای عضویت:
        # اگر کاربر مثلا 71 روز عضو بوده، حداقل 2 ماه فعال در نظر گرفته شود.
        membership_days = self.calculate_membership_duration_days()
        membership_months = max(0, membership_days // 30)
        self.active_months_count = max(bookings_by_month, membership_months)
        
        # میانگین رزرو ماهانه
        if membership_days > 30:
            self.average_bookings_per_month = (self.total_bookings / (membership_days / 30.0))
        
        self.save()


class MembershipUpgradeLog(models.Model):
    """
    لاگ ارتقا tier کاربران
    برای track کردن تغییرات tier
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='tier_upgrade_logs',
        verbose_name=_('کاربر')
    )
    
    old_tier = models.CharField(
        _('tier قبلی'),
        max_length=20,
        choices=MembershipTierConfig.TIER_CHOICES
    )
    new_tier = models.CharField(
        _('tier جدید'),
        max_length=20,
        choices=MembershipTierConfig.TIER_CHOICES
    )
    
    # دلیل ارتقا
    reason = models.TextField(
        _('دلیل ارتقا'),
        blank=True,
        help_text='معیارهایی که باعث ارتقا شدند'
    )
    
    # آمار در زمان ارتقا
    total_bookings_at_upgrade = models.IntegerField(_('تعداد رزرو'), default=0)
    membership_days_at_upgrade = models.IntegerField(_('روزهای عضویت'), default=0)
    
    # خودکار یا دستی
    is_automatic = models.BooleanField(
        _('ارتقا خودکار'),
        default=True,
        help_text='آیا ارتقا به صورت خودکار انجام شده؟'
    )
    upgraded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tier_upgrades_performed',
        verbose_name=_('ارتقا توسط')
    )
    
    # Metadata
    created_at = models.DateTimeField(_('تاریخ ارتقا'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('لاگ ارتقا عضویت')
        verbose_name_plural = _('لاگ‌های ارتقا عضویت')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['new_tier', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email}: {self.old_tier} → {self.new_tier}"
