"""
Signals for flights app
"""
from datetime import timedelta
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Flight
from .utils import calculate_flight_duration


@receiver(pre_save, sender=Flight)
def calculate_duration(sender, instance, **kwargs):
    """
    Automatically calculate flight duration before saving
    """
    if instance.departure_time and instance.arrival_time:
        duration_minutes = calculate_flight_duration(
            instance.departure_time,
            instance.arrival_time
        )
        instance.duration = timedelta(minutes=duration_minutes)


@receiver(pre_save, sender=Flight)
def validate_flight_data(sender, instance, **kwargs):
    """
    Validate flight data before saving
    """
    from .validators import (
        validate_flight_times,
        validate_available_seats,
    )
    
    # Validate times
    if instance.departure_time and instance.arrival_time:
        validate_flight_times(instance.departure_time, instance.arrival_time)
    
    # Validate seat availability
    if instance.aircraft:
        total_seats = instance.aircraft.total_seats
        total_available = (
            instance.economy_available +
            instance.business_available +
            instance.first_class_available
        )
        validate_available_seats(total_available, total_seats)


@receiver(post_save, sender=Flight)
def update_airport_statistics(sender, instance, created, **kwargs):
    """
    Update airport statistics when flight is created
    """
    if created:
        # Update origin airport flight count
        if instance.origin:
            instance.origin.flight_count = (
                instance.origin.flight_count + 1
                if hasattr(instance.origin, 'flight_count')
                else 1
            )
            instance.origin.save(update_fields=['flight_count'])
        
        # Update destination airport flight count
        if instance.destination:
            instance.destination.flight_count = (
                instance.destination.flight_count + 1
                if hasattr(instance.destination, 'flight_count')
                else 1
            )
            instance.destination.save(update_fields=['flight_count'])

