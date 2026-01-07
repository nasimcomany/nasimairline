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
