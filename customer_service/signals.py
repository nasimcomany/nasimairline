"""
Signals for customer_service app
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from payments.models import Payment
from bookings.models import Booking
from .utils import calculate_customer_tier

User = get_user_model()


@receiver(post_save, sender=Payment)
def update_tier_on_payment(sender, instance, **kwargs):
    """
    Update user tier when payment is completed
    """
    if instance.status == 'COMPLETED' and instance.user:
        new_tier = calculate_customer_tier(instance.user)
        if instance.user.membership_level != new_tier:
            instance.user.membership_level = new_tier
            instance.user.save(update_fields=['membership_level'])


@receiver(post_save, sender=Booking)
def update_tier_on_booking(sender, instance, **kwargs):
    """
    Update user tier when booking is confirmed
    """
    if instance.status == 'CONFIRMED' and instance.user:
        new_tier = calculate_customer_tier(instance.user)
        if instance.user.membership_level != new_tier:
            instance.user.membership_level = new_tier
            instance.user.save(update_fields=['membership_level'])

