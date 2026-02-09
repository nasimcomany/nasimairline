"""
Models for customer_service app
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from .constants import (
    CUSTOMER_TIER_CHOICES,
    CUSTOMER_TIER_BRONZE,
    CRITERIA_TYPE_CHOICES,
    OPERATOR_CHOICES,
    CHAT_STATUS_CHOICES,
    CHAT_STATUS_OPEN,
    MESSAGE_TYPE_CHOICES,
    MESSAGE_TYPE_CUSTOMER,
    MESSAGE_TYPE_STAFF,
)
from .managers import ChatSessionManager, ChatMessageManager

User = get_user_model()


class CustomerTierSettings(models.Model):
    """
    Settings model for customer tier classification
    Admin can configure tier criteria here
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    tier = models.CharField(
        _('سطح مشتری'),
        max_length=20,
        choices=CUSTOMER_TIER_CHOICES,
        db_index=True,
        help_text=_('سطح مشتری (طلا، نقره، برنز)'),
    )
    
    # Criteria for tier classification
    criteria_type = models.CharField(
        _('نوع معیار'),
        max_length=50,
        choices=CRITERIA_TYPE_CHOICES,
        help_text=_('نوع معیار برای تقسیم‌بندی (مثال: مبلغ کل خرید)'),
    )
    
    operator = models.CharField(
        _('عملگر مقایسه'),
        max_length=10,
        choices=OPERATOR_CHOICES,
        help_text=_('عملگر مقایسه (بزرگتر از، مساوی با و...)'),
    )
    
    value = models.DecimalField(
        _('مقدار'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_('مقدار معیار (مثال: برای مبلغ کل خرید، مقدار به تومان)'),
    )
    
    # Description
    description = models.TextField(
        _('توضیحات'),
        blank=True,
        help_text=_('توضیحات اضافی برای این تنظیمات'),
    )
    
    # Priority: Higher priority is checked first
    priority = models.PositiveIntegerField(
        _('اولویت'),
        default=0,
        help_text=_('اولویت بررسی (عدد بیشتر = اولویت بالاتر)'),
    )
    
    # Active status
    is_active = models.BooleanField(
        _('فعال'),
        default=True,
        db_index=True,
        help_text=_('اگر فعال نباشد، این معیار در محاسبه استفاده نمی‌شود'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('تنظیمات سطح مشتری')
        verbose_name_plural = _('تنظیمات سطوح مشتری')
        ordering = ['-priority', 'tier']
        indexes = [
            models.Index(fields=['tier', 'is_active']),
            models.Index(fields=['is_active', 'priority']),
            models.Index(fields=['criteria_type', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_tier_display()} - {self.get_criteria_type_display()}"
    
    def check_criteria(self, user):
        """
        Check if user meets this criteria
        Returns True if user meets the criteria, False otherwise
        """
        from .utils import calculate_user_metric
        
        user_value = calculate_user_metric(user, self.criteria_type)
        
        if self.operator == 'GT':
            return user_value > self.value
        elif self.operator == 'GTE':
            return user_value >= self.value
        elif self.operator == 'LT':
            return user_value < self.value
        elif self.operator == 'LTE':
            return user_value <= self.value
        elif self.operator == 'EQ':
            return user_value == self.value
        
        return False


class ChatSession(models.Model):
    """
    Chat session model for customer service chat
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_sessions',
        verbose_name=_('کاربر'),
        db_index=True,
        null=True,
        blank=True,
        help_text=_('کاربر لاگین شده (اگر مهمان باشد، خالی می‌ماند)'),
    )
    
    # Guest information
    guest_name = models.CharField(
        _('نام مهمان'),
        max_length=100,
        null=True,
        blank=True,
    )
    
    guest_email = models.EmailField(
        _('ایمیل مهمان'),
        null=True,
        blank=True,
    )
    
    # Session info
    session_id = models.CharField(
        _('شناسه نشست'),
        max_length=255,
        unique=True,
        db_index=True,
        help_text=_('شناسه یکتای نشست چت'),
    )
    
    # Status
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=CHAT_STATUS_CHOICES,
        default=CHAT_STATUS_OPEN,
        db_index=True,
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='assigned_chat_sessions',
        verbose_name=_('اختصاص داده شده به'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('پرسنل پشتیبانی که این چت را مدیریت می‌کند'),
    )
    
    # Customer tier at the time of chat
    customer_tier = models.CharField(
        _('سطح مشتری'),
        max_length=20,
        choices=CUSTOMER_TIER_CHOICES,
        default=CUSTOMER_TIER_BRONZE,
        db_index=True,
        help_text=_('سطح مشتری در زمان شروع چت'),
    )
    
    # Nira integration fields (for future use)
    nira_session_id = models.CharField(
        _('شناسه نشست در نیرا'),
        max_length=100,
        null=True,
        blank=True,
        unique=True,
        db_index=True,
    )
    
    nira_data = models.JSONField(
        _('اطلاعات نیرا'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات دریافتی از سیستم نیرا'),
    )
    
    # IP Tracking
    client_ip = models.GenericIPAddressField(
        _('آی‌پی کلاینت'),
        null=True,
        blank=True,
    )
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    closed_at = models.DateTimeField(_('تاریخ بسته شدن'), null=True, blank=True)
    
    objects = ChatSessionManager()
    
    class Meta:
        verbose_name = _('نشست چت')
        verbose_name_plural = _('نشست‌های چت')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['customer_tier', 'status']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        if self.user:
            return f"Chat Session - {self.user.email}"
        return f"Chat Session - {self.guest_name or 'Guest'}"
    
    def get_customer_name(self):
        """Get customer name"""
        if self.user:
            return self.user.get_full_name() or self.user.email
        return self.guest_name or 'مهمان'
    
    def get_customer_email(self):
        """Get customer email"""
        if self.user:
            return self.user.email
        return self.guest_email or ''
    
    def get_message_count(self):
        """Get total message count"""
        return self.messages.count()
    
    def get_unread_message_count(self):
        """Get unread message count for customer"""
        return self.messages.filter(
            message_type=MESSAGE_TYPE_STAFF,
            is_read=False
        ).count()
    
    def close(self):
        """Close the chat session"""
        self.status = 'CLOSED'
        self.closed_at = timezone.now()
        self.save()


class ChatMessage(models.Model):
    """
    Chat message model for customer service chat
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('نشست چت'),
        db_index=True,
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='customer_service_messages',
        verbose_name=_('کاربر'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('ارسال‌کننده پیام (اگر از پرسنل باشد)'),
    )
    
    message = models.TextField(
        _('پیام'),
        help_text=_('متن پیام'),
    )
    
    message_type = models.CharField(
        _('نوع پیام'),
        max_length=20,
        choices=MESSAGE_TYPE_CHOICES,
        default=MESSAGE_TYPE_CUSTOMER,
        db_index=True,
    )
    
    is_read = models.BooleanField(
        _('خوانده شده'),
        default=False,
        db_index=True,
    )
    
    # IP Tracking
    message_ip = models.GenericIPAddressField(
        _('آی‌پی ارسال پیام'),
        null=True,
        blank=True,
    )
    
    # Nira integration fields
    nira_message_id = models.CharField(
        _('شناسه پیام در نیرا'),
        max_length=100,
        null=True,
        blank=True,
    )
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = ChatMessageManager()
    
    class Meta:
        verbose_name = _('پیام چت')
        verbose_name_plural = _('پیام‌های چت')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['message_type', 'is_read']),
            models.Index(fields=['is_read', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message in {self.session}"
    
    def get_sender_name(self):
        """Get sender name"""
        if self.message_type == MESSAGE_TYPE_STAFF and self.user:
            return self.user.get_full_name() or self.user.email
        elif self.session.user:
            return self.session.user.get_full_name() or self.session.user.email
        return self.session.guest_name or 'مهمان'


class FlightMealFeedback(models.Model):
    """
    Model for collecting feedback about in-flight meal quality via QR code
    """
    QUALITY_CHOICES = [
        (5, _('عالی')),
        (4, _('خوب')),
        (3, _('متوسط')),
        (2, _('ضعیف')),
        (1, _('بسیار ضعیف')),
    ]
    
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    # Flight Information (all optional)
    flight_number = models.CharField(
        _('شماره پرواز'),
        max_length=20,
        blank=True,
        null=True,
        help_text=_('شماره پرواز (مثال: NSN6650)'),
    )
    
    origin_city = models.CharField(
        _('شهر مبدا'),
        max_length=100,
        blank=True,
        null=True,
    )
    
    destination_city = models.CharField(
        _('شهر مقصد'),
        max_length=100,
        blank=True,
        null=True,
    )
    
    # Passenger Information (all optional)
    first_name = models.CharField(
        _('نام'),
        max_length=100,
        blank=True,
        null=True,
    )
    
    last_name = models.CharField(
        _('نام خانوادگی'),
        max_length=100,
        blank=True,
        null=True,
    )
    
    # Meal Quality Ratings (all optional)
    food_quality = models.IntegerField(
        _('کیفیت غذا'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('رتبه‌بندی کلی کیفیت غذا'),
    )
    
    food_temperature = models.IntegerField(
        _('دمای غذا'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('آیا غذا در دمای مناسب سرو شد؟'),
    )
    
    food_taste = models.IntegerField(
        _('طعم غذا'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('طعم و مزه غذا'),
    )
    
    food_presentation = models.IntegerField(
        _('نحوه ارائه غذا'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('ظاهر و نحوه چیدمان غذا'),
    )
    
    portion_size = models.IntegerField(
        _('اندازه پرس'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('آیا مقدار غذا کافی بود؟'),
    )
    
    variety = models.IntegerField(
        _('تنوع غذا'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('تنوع و گزینه‌های غذایی'),
    )
    
    packaging = models.IntegerField(
        _('بسته‌بندی'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('کیفیت بسته‌بندی و ظروف'),
    )
    
    service_quality = models.IntegerField(
        _('کیفیت سرویس'),
        choices=QUALITY_CHOICES,
        blank=True,
        null=True,
        help_text=_('نحوه سرو و برخورد پرسنل'),
    )
    
    # Additional Comments
    comments = models.TextField(
        _('نظرات و پیشنهادات'),
        blank=True,
        null=True,
        help_text=_('نظرات، پیشنهادات یا انتقادات شما'),
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(
        _('آدرس IP'),
        null=True,
        blank=True,
        help_text=_('آدرس IP کاربر در زمان ارسال'),
    )
    
    user_agent = models.TextField(
        _('User Agent'),
        blank=True,
        null=True,
    )
    
    # Timestamps
    submitted_at = models.DateTimeField(
        _('تاریخ ثبت'),
        auto_now_add=True,
        db_index=True,
    )
    
    updated_at = models.DateTimeField(
        _('تاریخ به‌روزرسانی'),
        auto_now=True,
    )
    
    # Admin review
    is_reviewed = models.BooleanField(
        _('بررسی شده'),
        default=False,
        db_index=True,
    )
    
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_meal_feedbacks',
        verbose_name=_('بررسی شده توسط'),
    )
    
    reviewed_at = models.DateTimeField(
        _('تاریخ بررسی'),
        null=True,
        blank=True,
    )
    
    admin_notes = models.TextField(
        _('یادداشت ادمین'),
        blank=True,
        null=True,
        help_text=_('یادداشت‌های داخلی برای ادمین'),
    )
    
    class Meta:
        verbose_name = _('بازخورد غذای پرواز')
        verbose_name_plural = _('بازخوردهای غذای پرواز')
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['flight_number', 'submitted_at']),
            models.Index(fields=['submitted_at']),
            models.Index(fields=['is_reviewed', 'submitted_at']),
        ]
    
    def __str__(self):
        if self.flight_number:
            return f"Feedback for {self.flight_number} - {self.submitted_at.strftime('%Y-%m-%d')}"
        return f"Feedback - {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_average_rating(self):
        """Calculate average rating from all quality fields"""
        ratings = [
            self.food_quality,
            self.food_temperature,
            self.food_taste,
            self.food_presentation,
            self.portion_size,
            self.variety,
            self.packaging,
            self.service_quality,
        ]
        valid_ratings = [r for r in ratings if r is not None]
        if valid_ratings:
            return sum(valid_ratings) / len(valid_ratings)
        return None
    
    def get_passenger_name(self):
        """Get full passenger name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return _('ناشناس')
