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
    Local shadow-flight counters — only on final CONFIRMED (after pay),
    never on HELD soft-hold create (passengers may not exist yet anyway).
    """
    if instance.status == 'CONFIRMED' and created is False:
        # handled below via status transition detection is hard without previous;
        # keep simple: only adjust when explicitly confirmed and passengers exist
        pass

    if instance.status == 'CONFIRMED':
        flight = instance.flight
        cabin_class = (instance.cabin_class or 'economy').lower()
        available_field = f'{cabin_class}_available'
        if not hasattr(flight, available_field):
            return
        passenger_count = instance.passengers.exclude(passenger_type='INFANT').count()
        if passenger_count <= 0:
            return
        # Avoid double-decrement: only if metadata flag not set
        meta = instance.metadata or {}
        if meta.get('local_seats_decremented'):
            return
        current_available = getattr(flight, available_field, 0) or 0
        setattr(flight, available_field, max(0, current_available - passenger_count))
        flight.save(update_fields=[available_field])
        meta['local_seats_decremented'] = True
        Booking.objects.filter(pk=instance.pk).update(metadata=meta)

    elif instance.status in ('CANCELLED', 'EXPIRED'):
        flight = instance.flight
        cabin_class = (instance.cabin_class or 'economy').lower()
        available_field = f'{cabin_class}_available'
        if not hasattr(flight, available_field):
            return
        meta = instance.metadata or {}
        if not meta.get('local_seats_decremented'):
            return
        passenger_count = instance.passengers.exclude(passenger_type='INFANT').count()
        current_available = getattr(flight, available_field, 0) or 0
        total_field = f'{cabin_class}_seats'
        total_seats = getattr(getattr(flight, 'aircraft', None), total_field, None)
        new_val = current_available + passenger_count
        if total_seats is not None:
            new_val = min(total_seats, new_val)
        setattr(flight, available_field, new_val)
        flight.save(update_fields=[available_field])
        meta['local_seats_decremented'] = False
        Booking.objects.filter(pk=instance.pk).update(metadata=meta)


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

