"""
Models for support app - Professional ticket system
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .managers import TicketManager, TicketMessageManager
from .constants import (
    TICKET_STATUS_CHOICES,
    TICKET_STATUS_OPEN,
    TICKET_PRIORITY_CHOICES,
    TICKET_PRIORITY_NORMAL,
    TICKET_CATEGORY_CHOICES,
    TICKET_CATEGORY_OTHER,
    TICKET_SOURCE_CHOICES,
    TICKET_SOURCE_WEB,
    MESSAGE_TYPE_CHOICES,
    MESSAGE_TYPE_CUSTOMER,
    ATTACHMENT_TYPE_CHOICES,
    ATTACHMENT_TYPE_OTHER,
)
from .validators import (
    validate_ticket_reference,
    validate_file_size,
    validate_file_type,
)
from .utils import (
    generate_ticket_reference,
    calculate_sla_deadline,
)


class TicketCategory(models.Model):
    """
    Ticket category model for organizing tickets
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    name = models.CharField(
        _('نام دسته‌بندی'),
        max_length=100,
        unique=True,
        db_index=True,
    )
    
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=100,
        unique=True,
        db_index=True,
    )
    
    description = models.TextField(
        _('توضیحات'),
        blank=True,
    )
    
    is_active = models.BooleanField(
        _('فعال'),
        default=True,
        db_index=True,
    )
    
    order = models.PositiveIntegerField(
        _('ترتیب'),
        default=0,
        db_index=True,
    )
    
    created_at = models.DateTimeField(
        _('تاریخ ایجاد'),
        auto_now_add=True,
    )
    
    updated_at = models.DateTimeField(
        _('تاریخ به‌روزرسانی'),
        auto_now=True,
    )
    
    class Meta:
        verbose_name = _('دسته‌بندی تیکت')
        verbose_name_plural = _('دسته‌بندی‌های تیکت')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug', 'is_active']),
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return self.name


class Ticket(models.Model):
    """
    Professional ticket model for customer support
    """
    # UUID for external references
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    # Reference Number (e.g., NAS-20240101-000001)
    reference = models.CharField(
        _('شماره تیکت'),
        max_length=20,
        unique=True,
        db_index=True,
        validators=[validate_ticket_reference],
        help_text=_('شماره یکتای تیکت (خودکار تولید می‌شود)'),
    )
    
    # User Information
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name=_('کاربر'),
        db_index=True,
    )
    
    # Ticket Details
    title = models.CharField(
        _('عنوان'),
        max_length=255,
        db_index=True,
    )
    
    description = models.TextField(
        _('توضیحات'),
        help_text=_('توضیحات کامل مشکل یا درخواست'),
    )
    
    # Category and Classification
    category = models.CharField(
        _('دسته‌بندی'),
        max_length=50,
        choices=TICKET_CATEGORY_CHOICES,
        default=TICKET_CATEGORY_OTHER,
        db_index=True,
    )
    
    ticket_category = models.ForeignKey(
        TicketCategory,
        on_delete=models.SET_NULL,
        related_name='tickets',
        verbose_name=_('دسته‌بندی تیکت'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    # Priority and Status
    priority = models.CharField(
        _('اولویت'),
        max_length=20,
        choices=TICKET_PRIORITY_CHOICES,
        default=TICKET_PRIORITY_NORMAL,
        db_index=True,
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=TICKET_STATUS_CHOICES,
        default=TICKET_STATUS_OPEN,
        db_index=True,
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assigned_tickets',
        verbose_name=_('اختصاص داده شده به'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    # Source Information
    source = models.CharField(
        _('منبع'),
        max_length=20,
        choices=TICKET_SOURCE_CHOICES,
        default=TICKET_SOURCE_WEB,
        db_index=True,
    )
    
    # Nira Integration Fields
    nira_ticket_id = models.CharField(
        _('شناسه تیکت در نیرا'),
        max_length=100,
        null=True,
        blank=True,
        unique=True,
        db_index=True,
        help_text=_('شناسه تیکت در سیستم نیرا'),
    )
    
    nira_data = models.JSONField(
        _('اطلاعات نیرا'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات دریافتی از سیستم نیرا'),
    )
    
    # Related Booking/Flight (if applicable)
    related_booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.SET_NULL,
        related_name='support_tickets',
        verbose_name=_('رزرو مرتبط'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    related_flight = models.ForeignKey(
        'flights.Flight',
        on_delete=models.SET_NULL,
        related_name='support_tickets',
        verbose_name=_('پرواز مرتبط'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    # SLA Information
    sla_deadline = models.DateTimeField(
        _('مهلت SLA'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('مهلت پاسخگویی بر اساس اولویت'),
    )
    
    first_response_at = models.DateTimeField(
        _('زمان اولین پاسخ'),
        null=True,
        blank=True,
        help_text=_('زمان اولین پاسخ پرسنل'),
    )
    
    resolved_at = models.DateTimeField(
        _('زمان حل شدن'),
        null=True,
        blank=True,
        help_text=_('زمان حل شدن تیکت'),
    )
    
    closed_at = models.DateTimeField(
        _('زمان بسته شدن'),
        null=True,
        blank=True,
        help_text=_('زمان بسته شدن تیکت'),
    )
    
    # IP Tracking
    ticket_ip = models.GenericIPAddressField(
        _('آی‌پی ایجاد تیکت'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات اضافی به صورت JSON'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        _('تاریخ ایجاد'),
        auto_now_add=True,
        db_index=True,
    )
    
    updated_at = models.DateTimeField(
        _('تاریخ به‌روزرسانی'),
        auto_now=True,
    )
    
    # Custom Manager
    objects = TicketManager()
    
    class Meta:
        verbose_name = _('تیکت')
        verbose_name_plural = _('تیکت‌ها')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['source', 'status']),
            models.Index(fields=['sla_deadline', 'status']),
            models.Index(fields=['created_at', 'status']),
            models.Index(fields=['nira_ticket_id']),
        ]
    
    def __str__(self):
        return f"{self.reference} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Auto-generate reference and calculate SLA deadline"""
        # Generate reference if not set
        if not self.reference:
            self.reference = generate_ticket_reference()
        
        # Calculate SLA deadline if not set
        if not self.sla_deadline and self.priority:
            self.sla_deadline = calculate_sla_deadline(
                self.priority,
                self.created_at or timezone.now()
            )
        
        # Set resolved_at when status changes to RESOLVED
        if self.status == 'RESOLVED' and not self.resolved_at:
            self.resolved_at = timezone.now()
        
        # Set closed_at when status changes to CLOSED
        if self.status == 'CLOSED' and not self.closed_at:
            self.closed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def get_user_info(self):
        """Get user information for display"""
        return {
            'email': self.user.email,
            'full_name': self.user.get_full_name(),
            'phone': self.user.phone_number,
            'membership_level': self.user.membership_level,
            'loyalty_points': self.user.loyalty_points,
        }
    
    def is_overdue(self):
        """Check if ticket is overdue"""
        if self.sla_deadline and self.status not in ['RESOLVED', 'CLOSED']:
            return timezone.now() > self.sla_deadline
        return False
    
    def get_message_count(self):
        """Get total message count"""
        return self.messages.count()
    
    def get_unread_message_count(self):
        """Get unread message count"""
        return self.messages.filter(is_read=False).count()


class TicketMessage(models.Model):
    """
    Message model for ticket conversations
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('تیکت'),
        db_index=True,
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ticket_messages',
        verbose_name=_('کاربر'),
        db_index=True,
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
    
    is_internal = models.BooleanField(
        _('داخلی'),
        default=False,
        help_text=_('اگر فعال باشد، مشتری این پیام را نمی‌بیند'),
    )
    
    # IP Tracking
    message_ip = models.GenericIPAddressField(
        _('آی‌پی ارسال پیام'),
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
    created_at = models.DateTimeField(
        _('تاریخ ایجاد'),
        auto_now_add=True,
        db_index=True,
    )
    
    updated_at = models.DateTimeField(
        _('تاریخ به‌روزرسانی'),
        auto_now=True,
    )
    
    # Custom Manager
    objects = TicketMessageManager()
    
    class Meta:
        verbose_name = _('پیام تیکت')
        verbose_name_plural = _('پیام‌های تیکت')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['ticket', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['message_type', 'is_read']),
            models.Index(fields=['is_read', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message for {self.ticket.reference}"


class TicketAttachment(models.Model):
    """
    Attachment model for ticket files
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('تیکت'),
        db_index=True,
    )
    
    message = models.ForeignKey(
        TicketMessage,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('پیام'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    file = models.FileField(
        _('فایل'),
        upload_to='support/attachments/%Y/%m/%d/',
        validators=[validate_file_size, validate_file_type],
        help_text=_('حداکثر 10 مگابایت'),
    )
    
    file_name = models.CharField(
        _('نام فایل'),
        max_length=255,
    )
    
    file_size = models.PositiveIntegerField(
        _('حجم فایل (بایت)'),
        help_text=_('حجم فایل به بایت'),
    )
    
    file_type = models.CharField(
        _('نوع فایل'),
        max_length=20,
        choices=ATTACHMENT_TYPE_CHOICES,
        default=ATTACHMENT_TYPE_OTHER,
    )
    
    mime_type = models.CharField(
        _('نوع MIME'),
        max_length=100,
        blank=True,
    )
    
    description = models.TextField(
        _('توضیحات'),
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        _('تاریخ ایجاد'),
        auto_now_add=True,
        db_index=True,
    )
    
    class Meta:
        verbose_name = _('پیوست تیکت')
        verbose_name_plural = _('پیوست‌های تیکت')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ticket', 'created_at']),
            models.Index(fields=['message', 'created_at']),
            models.Index(fields=['file_type']),
        ]
    
    def __str__(self):
        return f"{self.file_name} - {self.ticket.reference}"
    
    def save(self, *args, **kwargs):
        """Auto-extract file information"""
        if self.file:
            self.file_name = self.file.name
            self.file_size = self.file.size
            # Extract file extension and determine type
            ext = self.file.name.split('.')[-1].lower()
            if ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp']:
                self.file_type = 'IMAGE'
            elif ext == 'pdf':
                self.file_type = 'PDF'
            elif ext in ['doc', 'docx', 'xls', 'xlsx', 'txt', 'csv']:
                self.file_type = 'DOCUMENT'
        
        super().save(*args, **kwargs)


class ChatMessage(models.Model):
    """
    Online chat message model for real-time customer support
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages',
        verbose_name=_('کاربر'),
        db_index=True,
        null=True,
        blank=True,
        help_text=_('اگر کاربر لاگین باشد، این فیلد پر می‌شود'),
    )
    
    # برای کاربران غیر لاگین
    guest_name = models.CharField(
        _('نام مهمان'),
        max_length=100,
        null=True,
        blank=True,
        help_text=_('نام کاربر برای مهمانان (غیر لاگین)'),
    )
    
    guest_email = models.EmailField(
        _('ایمیل مهمان'),
        null=True,
        blank=True,
        help_text=_('ایمیل کاربر برای مهمانان (غیر لاگین)'),
    )
    
    message = models.TextField(
        _('پیام'),
        help_text=_('متن پیام چت'),
    )
    
    is_staff = models.BooleanField(
        _('پیام از پرسنل'),
        default=False,
        db_index=True,
        help_text=_('اگر فعال باشد، این پیام از پرسنل پشتیبانی است'),
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
    
    # Session ID برای ردیابی چت‌های مهمان
    session_id = models.CharField(
        _('شناسه نشست'),
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
        help_text=_('شناسه نشست برای ردیابی چت‌های مهمان'),
    )
    
    # Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        _('تاریخ ایجاد'),
        auto_now_add=True,
        db_index=True,
    )
    
    updated_at = models.DateTimeField(
        _('تاریخ به‌روزرسانی'),
        auto_now=True,
    )
    
    class Meta:
        verbose_name = _('پیام چت')
        verbose_name_plural = _('پیام‌های چت')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['is_staff', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        if self.user:
            return f"Chat message from {self.user.email}"
        return f"Chat message from {self.guest_name or 'Guest'}"
    
    def get_sender_name(self):
        """Get sender name"""
        if self.user:
            return self.user.get_full_name() or self.user.email
        return self.guest_name or 'مهمان'
    
    def get_sender_email(self):
        """Get sender email"""
        if self.user:
            return self.user.email
        return self.guest_email or ''
