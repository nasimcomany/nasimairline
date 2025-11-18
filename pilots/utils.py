"""
Utility functions for pilots app
"""
from datetime import datetime, timedelta


def calculate_flight_hours(pilot):
    """
    Calculate total flight hours for a pilot
    
    Args:
        pilot: Pilot instance
        
    Returns:
        Integer total flight hours
    """
    # This would calculate from completed flights
    # Placeholder implementation
    return pilot.total_flight_hours or 0


def is_pilot_available(pilot, start_time, end_time):
    """
    Check if pilot is available for a time period
    
    Args:
        pilot: Pilot instance
        start_time: DateTime start time
        end_time: DateTime end time
        
    Returns:
        Boolean availability
    """
    if pilot.status != 'ACTIVE':
        return False
    
    # Check if pilot has conflicting flights
    # This would check against scheduled flights
    # Placeholder implementation
    return True

