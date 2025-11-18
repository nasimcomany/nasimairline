"""
Utility functions for accounts app
"""
from .constants import (
    MEMBERSHIP_BRONZE,
    MEMBERSHIP_SILVER,
    MEMBERSHIP_GOLD,
    MEMBERSHIP_PLATINUM,
    MEMBERSHIP_THRESHOLDS,
    MEMBERSHIP_POINTS_RATES,
)


def calculate_membership_level(points):
    """
    Calculate membership level based on loyalty points
    
    Args:
        points: Integer loyalty points
        
    Returns:
        String membership level
    """
    if points >= MEMBERSHIP_THRESHOLDS[MEMBERSHIP_PLATINUM]:
        return MEMBERSHIP_PLATINUM
    elif points >= MEMBERSHIP_THRESHOLDS[MEMBERSHIP_GOLD]:
        return MEMBERSHIP_GOLD
    elif points >= MEMBERSHIP_THRESHOLDS[MEMBERSHIP_SILVER]:
        return MEMBERSHIP_SILVER
    else:
        return MEMBERSHIP_BRONZE


def calculate_points_from_purchase(amount, membership_level):
    """
    Calculate loyalty points from purchase amount
    
    Args:
        amount: Decimal purchase amount
        membership_level: String membership level
        
    Returns:
        Integer points to add
    """
    rate = MEMBERSHIP_POINTS_RATES.get(membership_level, 1)
    points = int(amount * rate)
    return points


def get_membership_benefits(level):
    """
    Get benefits for a membership level
    
    Args:
        level: String membership level
        
    Returns:
        Dictionary of benefits
    """
    benefits = {
        MEMBERSHIP_BRONZE: {
            'discount_percentage': 0,
            'priority_boarding': False,
            'free_baggage': False,
            'lounge_access': False,
            'points_rate': MEMBERSHIP_POINTS_RATES[MEMBERSHIP_BRONZE],
        },
        MEMBERSHIP_SILVER: {
            'discount_percentage': 5,
            'priority_boarding': True,
            'free_baggage': False,
            'lounge_access': False,
            'points_rate': MEMBERSHIP_POINTS_RATES[MEMBERSHIP_SILVER],
        },
        MEMBERSHIP_GOLD: {
            'discount_percentage': 10,
            'priority_boarding': True,
            'free_baggage': True,
            'lounge_access': False,
            'points_rate': MEMBERSHIP_POINTS_RATES[MEMBERSHIP_GOLD],
        },
        MEMBERSHIP_PLATINUM: {
            'discount_percentage': 15,
            'priority_boarding': True,
            'free_baggage': True,
            'lounge_access': True,
            'points_rate': MEMBERSHIP_POINTS_RATES[MEMBERSHIP_PLATINUM],
        },
    }
    
    return benefits.get(level, benefits[MEMBERSHIP_BRONZE])


def format_phone_number(phone):
    """
    Format phone number to standard Iranian format (09123456789)
    
    Args:
        phone: String phone number in various formats
        
    Returns:
        String formatted phone number
    """
    if not phone:
        return None
    
    # Remove all non-digit characters
    digits = ''.join(filter(str.isdigit, str(phone)))
    
    # Convert to Iranian format
    if digits.startswith('989'):
        return '0' + digits[2:]
    elif digits.startswith('00989'):
        return '0' + digits[3:]
    elif digits.startswith('9') and len(digits) == 10:
        return '0' + digits
    elif digits.startswith('09') and len(digits) == 11:
        return digits
    
    return phone


def generate_verification_code():
    """
    Generate a 6-digit verification code for 2FA
    
    Returns:
        String 6-digit code
    """
    import random
    return str(random.randint(100000, 999999))

