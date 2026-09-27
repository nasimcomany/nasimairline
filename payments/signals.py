"""
Signals for payments app
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Payment, Transaction
from .utils import generate_transaction_id
from .constants import PAYMENT_COMPLETED
from bookings.constants import BOOKING_HELD, BOOKING_CONFIRMED, BOOKING_PENDING


@receiver(pre_save, sender=Payment)
def generate_transaction_id_signal(sender, instance, **kwargs):
    """Automatically generate transaction ID if not provided; track previous status."""
    if not instance.transaction_id:
        instance.transaction_id = generate_transaction_id()
    if instance.pk:
        try:
            instance._previous_status = Payment.objects.get(pk=instance.pk).status
        except Payment.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Payment)
def create_transaction_on_payment(sender, instance, created, **kwargs):
    """Create transaction record when payment is created."""
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
    Confirm booking only after payment succeeds.
    Soft-hold (HELD) becomes CONFIRMED here — never on pay-click.
    """
    prev = getattr(instance, '_previous_status', None)
    if instance.status != PAYMENT_COMPLETED:
        return
    if prev == PAYMENT_COMPLETED:
        return
    booking = instance.booking
    if not booking:
        return
    if booking.status in (BOOKING_HELD, BOOKING_PENDING):
        booking.status = BOOKING_CONFIRMED
        booking.hold_expires_at = None
        booking.save(update_fields=['status', 'hold_expires_at', 'updated_at'])
