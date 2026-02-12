"""
Signals for bookings app
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Booking, Passenger
from .utils import generate_booking_reference, calculate_booking_total


@receiver(pre_save, sender=Booking)
def generate_reference(sender, instance, **kwargs):
    """
    Automatically generate booking reference if not provided
    """
    if not instance.booking_reference:
        instance.booking_reference = generate_booking_reference()


@receiver(pre_save, sender=Booking)
def calculate_total(sender, instance, **kwargs):
    """
    Automatically calculate total amount before saving
    """
    if instance.pk:  # Only for existing bookings
        # Recalculate total if passengers or flight changed
        passengers = instance.passengers.all()
        if passengers.exists():
            passenger_types = [p.passenger_type for p in passengers]
            base_price = instance.flight.get_price(instance.cabin_class)
            
            # Calculate total (extras and taxes should be set separately)
            total = calculate_booking_total(
                base_price,
                passenger_types,
                instance.extras_price or 0,
                instance.taxes or 0
            )
            instance.total_amount = total


@receiver(post_save, sender=Booking)
def update_flight_availability(sender, instance, created, **kwargs):
    """
    Update flight seat availability when booking is created or cancelled
    """
    if created and instance.status == 'CONFIRMED':
        # Decrease available seats
        flight = instance.flight
        cabin_class = instance.cabin_class.lower()
        available_field = f'{cabin_class}_available'
        
        current_available = getattr(flight, available_field, 0)
        passenger_count = instance.passengers.count()
        
        setattr(flight, available_field, max(0, current_available - passenger_count))
        flight.save(update_fields=[available_field])
    
    elif instance.status == 'CANCELLED':
        # Increase available seats
        flight = instance.flight
        cabin_class = instance.cabin_class.lower()
        available_field = f'{cabin_class}_available'
        
        current_available = getattr(flight, available_field, 0)
        passenger_count = instance.passengers.count()
        
        # Get total seats for this cabin class
        total_field = f'{cabin_class}_seats'
        total_seats = getattr(flight.aircraft, total_field, 0)
        
        setattr(flight, available_field, min(total_seats, current_available + passenger_count))
        flight.save(update_fields=[available_field])


@receiver(post_save, sender=Passenger)
def update_booking_on_passenger_change(sender, instance, created, **kwargs):
    """
    Update booking when passenger is added or modified
    """
    if instance.booking:
        # Recalculate booking total
        booking = instance.booking
        booking.save()  # This will trigger pre_save signal to recalculate total


@receiver(post_save, sender=Booking)
def update_membership_on_booking_completion(sender, instance, created, **kwargs):
    """
    Update user membership activity when booking is completed/confirmed
    and check for tier upgrade
    """
    # وقتی که booking به CONFIRMED یا COMPLETED تغییر پیدا می‌کنه
    if instance.status in ['CONFIRMED', 'COMPLETED'] and instance.user:
        from accounts.membership_models import UserMembershipActivity
        from accounts.membership_service import MembershipTierService
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            # بروزرسانی آمار کاربر
            activity, created_activity = UserMembershipActivity.objects.get_or_create(
                user=instance.user
            )
            activity.update_statistics()
            
            # چک کردن و ارتقا tier
            upgraded, new_tier, old_tier = MembershipTierService.check_and_upgrade_user_tier(
                instance.user
            )
            
            if upgraded:
                logger.info(
                    f"✨ User {instance.user.email} upgraded from {old_tier} to {new_tier} "
                    f"after booking {instance.booking_reference}"
                )
        except Exception as e:
            logger.error(
                f"Error updating membership for booking {instance.booking_reference}: {str(e)}"
            )

