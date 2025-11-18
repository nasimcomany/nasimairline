"""
Utility functions for bookings app
"""
from decimal import Decimal
from datetime import datetime, timedelta
from .constants import (
    BOOKING_CONFIRMED,
    BOOKING_CANCELLED,
    CANCELLATION_FULL_REFUND_HOURS,
    CANCELLATION_PARTIAL_REFUND_HOURS,
    PASSENGER_ADULT,
    PASSENGER_CHILD,
    PASSENGER_INFANT,
)


def generate_booking_reference():
    """
    Generate a unique booking reference code
    
    Returns:
        String booking reference (e.g., NS123456)
    """
    import random
    import string
    
    # Generate 6 random alphanumeric characters
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choice(chars) for _ in range(6))
    return f"NS{code}"


def calculate_booking_total(base_price, passengers, extras_price=0, taxes=0):
    """
    Calculate total booking amount
    
    Args:
        base_price: Decimal base price per passenger
        passengers: List of passenger types
        extras_price: Decimal extras price
        taxes: Decimal taxes
        
    Returns:
        Decimal total amount
    """
    total = Decimal('0')
    
    for passenger_type in passengers:
        if passenger_type == PASSENGER_ADULT:
            total += base_price
        elif passenger_type == PASSENGER_CHILD:
            # Children usually pay 75% of adult price
            total += base_price * Decimal('0.75')
        elif passenger_type == PASSENGER_INFANT:
            # Infants usually pay 10% of adult price
            total += base_price * Decimal('0.10')
    
    total += Decimal(str(extras_price))
    total += Decimal(str(taxes))
    
    return total.quantize(Decimal('0.01'))


def calculate_refund_amount(booking, cancellation_time=None):
    """
    Calculate refund amount based on cancellation policy
    
    Args:
        booking: Booking instance
        cancellation_time: DateTime cancellation time (default: now)
        
    Returns:
        Decimal refund amount
    """
    if not cancellation_time:
        cancellation_time = datetime.now()
    
    flight_departure = booking.flight.departure_time
    hours_before = (flight_departure - cancellation_time).total_seconds() / 3600
    
    total_amount = booking.total_amount
    
    if hours_before >= CANCELLATION_FULL_REFUND_HOURS:
        # Full refund
        return total_amount
    elif hours_before >= CANCELLATION_PARTIAL_REFUND_HOURS:
        # 50% refund
        return total_amount * Decimal('0.5')
    else:
        # No refund
        return Decimal('0')


def is_booking_refundable(booking):
    """
    Check if booking is refundable
    
    Args:
        booking: Booking instance
        
    Returns:
        Boolean refundable status
    """
    if booking.status != BOOKING_CONFIRMED:
        return False
    
    now = datetime.now()
    flight_departure = booking.flight.departure_time
    hours_before = (flight_departure - now).total_seconds() / 3600
    
    return hours_before >= CANCELLATION_PARTIAL_REFUND_HOURS


def calculate_passenger_count(booking):
    """
    Calculate passenger count breakdown
    
    Args:
        booking: Booking instance
        
    Returns:
        Dictionary with adult, child, infant counts
    """
    passengers = booking.passengers.all()
    
    return {
        'adults': passengers.filter(passenger_type=PASSENGER_ADULT).count(),
        'children': passengers.filter(passenger_type=PASSENGER_CHILD).count(),
        'infants': passengers.filter(passenger_type=PASSENGER_INFANT).count(),
        'total': passengers.count(),
    }


def get_booking_summary(booking):
    """
    Get booking summary information
    
    Args:
        booking: Booking instance
        
    Returns:
        Dictionary with booking summary
    """
    passenger_count = calculate_passenger_count(booking)
    
    return {
        'booking_reference': booking.booking_reference,
        'flight': f"{booking.flight.flight_number} - {booking.flight.get_route()}",
        'departure_time': booking.flight.departure_time,
        'passengers': passenger_count,
        'total_amount': booking.total_amount,
        'status': booking.get_status_display(),
    }


def can_modify_booking(booking):
    """
    Check if booking can be modified
    
    Args:
        booking: Booking instance
        
    Returns:
        Boolean can modify
    """
    if booking.status != BOOKING_CONFIRMED:
        return False
    
    now = datetime.now()
    flight_departure = booking.flight.departure_time
    hours_before = (flight_departure - now).total_seconds() / 3600
    
    # Can modify if more than 6 hours before flight
    return hours_before >= 6

