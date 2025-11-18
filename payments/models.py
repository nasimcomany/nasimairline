"""
Models for payments app
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from bookings.models import Booking
from .managers import PaymentManager, TransactionManager
from .constants import (
    PAYMENT_STATUS_CHOICES,
    PAYMENT_PENDING,
    PAYMENT_METHOD_CHOICES,
    PAYMENT_METHOD_ONLINE,
    PAYMENT_GATEWAY_CHOICES,
    TRANSACTION_TYPE_CHOICES,
    TRANSACTION_PAYMENT,
)
from .validators import (
    validate_payment_amount,
    validate_transaction_id,
)

User = get_user_model()


class Payment(models.Model):
    """
    Payment model representing payments
    """
    transaction_id = models.CharField(
        _('شناسه تراکنش'),
        max_length=50,
        unique=True,
        validators=[validate_transaction_id],
        db_index=True,
    )
    
    # User and Booking
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('کاربر'),
        db_index=True,
    )
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='payment',
        verbose_name=_('رزرو'),
        null=True,
        blank=True,
    )
    
    # Amount
    amount = models.DecimalField(
        _('مبلغ'),
        max_digits=10,
        decimal_places=2,
        validators=[validate_payment_amount],
    )
    
    # Payment Details
    method = models.CharField(
        _('روش پرداخت'),
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_METHOD_ONLINE,
    )
    gateway = models.CharField(
        _('درگاه پرداخت'),
        max_length=50,
        choices=PAYMENT_GATEWAY_CHOICES,
        null=True,
        blank=True,
    )
    
    # Status
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_PENDING,
        db_index=True,
    )
    
    # Gateway Response
    gateway_transaction_id = models.CharField(
        _('شناسه تراکنش درگاه'),
        max_length=100,
        null=True,
        blank=True,
    )
    gateway_response = models.JSONField(
        _('پاسخ درگاه'),
        null=True,
        blank=True,
    )
    
    # Error Information
    error_message = models.TextField(
        _('پیام خطا'),
        null=True,
        blank=True,
    )
    error_code = models.CharField(
        _('کد خطا'),
        max_length=50,
        null=True,
        blank=True,
    )
    
    # Installment Information
    is_installment = models.BooleanField(_('اقساطی'), default=False)
    installment_months = models.IntegerField(
        _('تعداد اقساط'),
        null=True,
        blank=True,
    )
    monthly_payment = models.DecimalField(
        _('قسط ماهانه'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    completed_at = models.DateTimeField(_('تاریخ تکمیل'), null=True, blank=True)
    
    objects = PaymentManager()
    
    class Meta:
        verbose_name = _('پرداخت')
        verbose_name_plural = _('پرداخت‌ها')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['gateway', 'status']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.amount}"
    
    def is_successful(self):
        """Check if payment is successful"""
        return self.status == 'COMPLETED'
    
    def can_refund(self):
        """Check if payment can be refunded"""
        return self.status == 'COMPLETED' and not self.is_refunded()
    
    def is_refunded(self):
        """Check if payment is refunded"""
        return self.status == 'REFUNDED'
    
    def get_installment_details(self):
        """Get installment calculation details"""
        if self.is_installment and self.installment_months:
            from .utils import calculate_installment_amount
            return calculate_installment_amount(self.amount, self.installment_months)
        return None


class Transaction(models.Model):
    """
    Transaction model for payment transactions
    """
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name=_('پرداخت'),
    )
    
    transaction_type = models.CharField(
        _('نوع تراکنش'),
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        default=TRANSACTION_PAYMENT,
    )
    
    transaction_id = models.CharField(
        _('شناسه تراکنش'),
        max_length=50,
        unique=True,
        validators=[validate_transaction_id],
        db_index=True,
    )
    
    amount = models.DecimalField(
        _('مبلغ'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_PENDING,
    )
    
    gateway = models.CharField(
        _('درگاه پرداخت'),
        max_length=50,
        choices=PAYMENT_GATEWAY_CHOICES,
        null=True,
        blank=True,
    )
    
    gateway_transaction_id = models.CharField(
        _('شناسه تراکنش درگاه'),
        max_length=100,
        null=True,
        blank=True,
    )
    
    description = models.TextField(
        _('توضیحات'),
        null=True,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = TransactionManager()
    
    class Meta:
        verbose_name = _('تراکنش')
        verbose_name_plural = _('تراکنش‌ها')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['payment', 'transaction_type']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.amount} - {self.get_transaction_type_display()}"


class Refund(models.Model):
    """
    Refund model for payment refunds
    """
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='refunds',
        verbose_name=_('پرداخت'),
    )
    
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='refund',
        verbose_name=_('تراکنش'),
        null=True,
        blank=True,
    )
    
    refund_amount = models.DecimalField(
        _('مبلغ بازپرداخت'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    
    refund_percentage = models.DecimalField(
        _('درصد بازپرداخت'),
        max_digits=5,
        decimal_places=2,
        default=100,
    )
    
    reason = models.TextField(_('دلیل بازپرداخت'), null=True, blank=True)
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_PENDING,
    )
    
    gateway_refund_id = models.CharField(
        _('شناسه بازپرداخت درگاه'),
        max_length=100,
        null=True,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    processed_at = models.DateTimeField(_('تاریخ پردازش'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('بازپرداخت')
        verbose_name_plural = _('بازپرداخت‌ها')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Refund {self.refund_amount} for {self.payment.transaction_id}"
