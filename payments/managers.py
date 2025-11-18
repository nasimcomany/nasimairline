"""
Custom managers for payments app
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .constants import (
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
    PAYMENT_PENDING,
    PAYMENT_REFUNDED,
)


class PaymentManager(models.Manager):
    """
    Custom manager for Payment model
    """
    
    def completed(self):
        """Return completed payments"""
        return self.filter(status=PAYMENT_COMPLETED)
    
    def pending(self):
        """Return pending payments"""
        return self.filter(status=PAYMENT_PENDING)
    
    def failed(self):
        """Return failed payments"""
        return self.filter(status=PAYMENT_FAILED)
    
    def refunded(self):
        """Return refunded payments"""
        return self.filter(status=PAYMENT_REFUNDED)
    
    def by_user(self, user):
        """Filter payments by user"""
        return self.filter(user=user)
    
    def by_gateway(self, gateway):
        """Filter payments by gateway"""
        return self.filter(gateway=gateway)
    
    def by_date_range(self, start_date, end_date):
        """Filter payments by date range"""
        return self.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
    
    def successful(self):
        """Return successful payments (completed)"""
        return self.filter(status=PAYMENT_COMPLETED)
    
    def today(self):
        """Return today's payments"""
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        return self.filter(created_at__gte=today_start, created_at__lt=today_end)
    
    def this_month(self):
        """Return this month's payments"""
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return self.filter(created_at__gte=month_start)


class TransactionManager(models.Manager):
    """
    Custom manager for Transaction model
    """
    
    def payments(self):
        """Return payment transactions"""
        return self.filter(transaction_type='PAYMENT')
    
    def refunds(self):
        """Return refund transactions"""
        return self.filter(transaction_type__in=['REFUND', 'PARTIAL_REFUND'])
    
    def by_payment(self, payment):
        """Filter transactions by payment"""
        return self.filter(payment=payment)
    
    def successful(self):
        """Return successful transactions"""
        return self.filter(status='COMPLETED')
    
    def failed(self):
        """Return failed transactions"""
        return self.filter(status='FAILED')

