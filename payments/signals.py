"""
Signals for payments app
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Payment, Transaction
from .utils import generate_transaction_id
from .constants import PAYMENT_COMPLETED


@receiver(pre_save, sender=Payment)
def generate_transaction_id_signal(sender, instance, **kwargs):
    """
    Automatically generate transaction ID if not provided
    """
    if not instance.transaction_id:
        instance.transaction_id = generate_transaction_id()


@receiver(post_save, sender=Payment)
def create_transaction_on_payment(sender, instance, created, **kwargs):
    """
    Create transaction record when payment is created
    """
    if created:
        Transaction.objects.create(
            payment=instance,
            transaction_type='PAYMENT',
            amount=instance.amount,
            status=instance.status,
            gateway=instance.gateway,
            transaction_id=instance.transaction_id,
        )


@receiver(post_save, sender=Payment)
def update_booking_on_payment_complete(sender, instance, **kwargs):
    """
    Update booking status when payment is completed
    """
    if instance.status == PAYMENT_COMPLETED and instance.booking:
        booking = instance.booking
        if booking.status == 'PENDING':
            booking.status = 'CONFIRMED'
            booking.save(update_fields=['status'])

