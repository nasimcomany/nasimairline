"""
Custom managers for bookings app
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .constants import (
    BOOKING_CONFIRMED,
    BOOKING_CANCELLED,
    BOOKING_PENDING,
    BOOKING_COMPLETED,
)


class BookingManager(models.Manager):
    """
    Custom manager for Booking model
    """
    
    def confirmed(self):
        """Return confirmed bookings"""
        return self.filter(status=BOOKING_CONFIRMED)
    
    def pending(self):
        """Return pending bookings"""
        return self.filter(status=BOOKING_PENDING)
    
    def cancelled(self):
        """Return cancelled bookings"""
        return self.filter(status=BOOKING_CANCELLED)
    
    def completed(self):
        """Return completed bookings"""
        return self.filter(status=BOOKING_COMPLETED)
    
    def by_user(self, user):
        """Filter bookings by user"""
        return self.filter(user=user)
    
    def upcoming(self, days=30):
        """Return upcoming bookings within specified days"""
        now = timezone.now()
        future_date = now + timedelta(days=days)
        return self.filter(
            flight__departure_time__gte=now,
            flight__departure_time__lte=future_date,
            status=BOOKING_CONFIRMED
        )
    
    def past(self):
        """Return past bookings"""
        now = timezone.now()
        return self.filter(
            flight__departure_time__lt=now,
            status__in=[BOOKING_CONFIRMED, BOOKING_COMPLETED]
        )
    
    def by_flight(self, flight):
        """Filter bookings by flight"""
        return self.filter(flight=flight)
    
    def by_date_range(self, start_date, end_date):
        """Filter bookings by flight date range"""
        return self.filter(
            flight__departure_time__gte=start_date,
            flight__departure_time__lte=end_date
        )
    
    def refundable(self):
        """Return refundable bookings"""
        now = timezone.now()
        return self.filter(
            flight__departure_time__gt=now + timedelta(hours=24),
            status=BOOKING_CONFIRMED
        )


class PassengerManager(models.Manager):
    """
    Custom manager for Passenger model
    """
    
    def adults(self):
        """Return adult passengers"""
        return self.filter(passenger_type='ADULT')
    
    def children(self):
        """Return child passengers"""
        return self.filter(passenger_type='CHILD')
    
    def infants(self):
        """Return infant passengers"""
        return self.filter(passenger_type='INFANT')
    
    def by_booking(self, booking):
        """Filter passengers by booking"""
        return self.filter(booking=booking)

