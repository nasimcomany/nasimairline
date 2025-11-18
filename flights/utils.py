"""
Utility functions for flights app
"""
from datetime import datetime, timedelta
from decimal import Decimal
from .constants import (
    TIME_MORNING,
    TIME_AFTERNOON,
    TIME_EVENING,
    TIME_NIGHT,
    CABIN_ECONOMY,
    CABIN_BUSINESS,
    CABIN_FIRST_CLASS,
)


def calculate_flight_duration(departure_time, arrival_time):
    """
    Calculate flight duration in minutes
    
    Args:
        departure_time: DateTime departure time
        arrival_time: DateTime arrival time
        
    Returns:
        Integer duration in minutes
    """
    if departure_time and arrival_time:
        duration = arrival_time - departure_time
        return int(duration.total_seconds() / 60)
    return 0


def get_time_of_day(datetime_obj):
    """
    Get time of day category for a datetime
    
    Args:
        datetime_obj: DateTime object
        
    Returns:
        String time of day category
    """
    hour = datetime_obj.hour
    
    if 6 <= hour < 12:
        return TIME_MORNING
    elif 12 <= hour < 18:
        return TIME_AFTERNOON
    elif 18 <= hour < 22:
        return TIME_EVENING
    else:
        return TIME_NIGHT


def calculate_dynamic_price(base_price, factors):
    """
    Calculate dynamic price based on various factors
    
    Args:
        base_price: Decimal base price
        factors: Dictionary of factors and their multipliers
        
    Returns:
        Decimal calculated price
    """
    price = Decimal(str(base_price))
    
    # Demand factor (0.8 to 1.5)
    demand_multiplier = factors.get('demand', 1.0)
    price *= Decimal(str(demand_multiplier))
    
    # Time factor (morning/evening more expensive)
    time_multiplier = factors.get('time', 1.0)
    price *= Decimal(str(time_multiplier))
    
    # Season factor (peak season more expensive)
    season_multiplier = factors.get('season', 1.0)
    price *= Decimal(str(season_multiplier))
    
    # Load factor (more seats sold = higher price)
    load_multiplier = factors.get('load', 1.0)
    price *= Decimal(str(load_multiplier))
    
    return price.quantize(Decimal('0.01'))


def format_flight_duration(minutes):
    """
    Format flight duration in human-readable format
    
    Args:
        minutes: Integer duration in minutes
        
    Returns:
        String formatted duration (e.g., "2h 30m")
    """
    hours = minutes // 60
    mins = minutes % 60
    
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}m"


def is_flight_available(flight, cabin_class, seats_needed=1):
    """
    Check if flight has available seats
    
    Args:
        flight: Flight instance
        cabin_class: String cabin class
        seats_needed: Integer number of seats needed
        
    Returns:
        Boolean availability
    """
    availability_map = {
        CABIN_ECONOMY: flight.economy_available,
        CABIN_BUSINESS: flight.business_available,
        CABIN_FIRST_CLASS: flight.first_class_available,
    }
    
    available = availability_map.get(cabin_class, 0)
    return available >= seats_needed


def get_price_for_cabin(flight, cabin_class):
    """
    Get price for specific cabin class
    
    Args:
        flight: Flight instance
        cabin_class: String cabin class
        
    Returns:
        Decimal price
    """
    price_map = {
        CABIN_ECONOMY: flight.economy_price,
        CABIN_BUSINESS: flight.business_price,
        CABIN_FIRST_CLASS: flight.first_class_price,
    }
    
    return price_map.get(cabin_class, flight.economy_price)


def generate_flight_number(airline_code='NS'):
    """
    Generate a unique flight number
    
    Args:
        airline_code: String airline code (default: NS for Nasim)
        
    Returns:
        String flight number
    """
    import random
    number = random.randint(100, 9999)
    return f"{airline_code}{number}"


def calculate_layover_time(arrival_time, next_departure_time):
    """
    Calculate layover time between flights
    
    Args:
        arrival_time: DateTime arrival time of first flight
        next_departure_time: DateTime departure time of next flight
        
    Returns:
        Integer layover time in minutes
    """
    if arrival_time and next_departure_time:
        layover = next_departure_time - arrival_time
        return int(layover.total_seconds() / 60)
    return 0

