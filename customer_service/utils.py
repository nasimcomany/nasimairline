"""
Utility functions for customer_service app
"""
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Q
from .constants import (
    CRITERIA_TYPE_TOTAL_PURCHASE_AMOUNT,
    CRITERIA_TYPE_TOTAL_BOOKINGS_COUNT,
    CRITERIA_TYPE_MONTHLY_PURCHASE_AMOUNT,
    CRITERIA_TYPE_DAYS_SINCE_REGISTRATION,
    CRITERIA_TYPE_LAST_PURCHASE_DAYS,
    CUSTOMER_TIER_GOLD,
    CUSTOMER_TIER_SILVER,
    CUSTOMER_TIER_BRONZE,
)


def calculate_user_metric(user, criteria_type):
    """
    Calculate a specific metric for a user based on criteria type
    
    Args:
        user: User instance
        criteria_type: Type of criteria (from constants)
    
    Returns:
        float: Calculated metric value
    """
    if criteria_type == CRITERIA_TYPE_TOTAL_PURCHASE_AMOUNT:
        # Total amount of all completed payments
        from payments.models import Payment
        total = Payment.objects.filter(
            user=user,
            status='COMPLETED'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return float(total)
    
    elif criteria_type == CRITERIA_TYPE_TOTAL_BOOKINGS_COUNT:
        # Total count of completed bookings
        from bookings.models import Booking
        count = Booking.objects.filter(
            user=user,
            status='CONFIRMED'
        ).count()
        return float(count)
    
    elif criteria_type == CRITERIA_TYPE_MONTHLY_PURCHASE_AMOUNT:
        # Total purchase amount in the last 30 days
        from payments.models import Payment
        thirty_days_ago = timezone.now() - timedelta(days=30)
        total = Payment.objects.filter(
            user=user,
            status='COMPLETED',
            created_at__gte=thirty_days_ago
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return float(total)
    
    elif criteria_type == CRITERIA_TYPE_DAYS_SINCE_REGISTRATION:
        # Days since user registration
        if user.date_joined:
            delta = timezone.now() - user.date_joined
            return float(delta.days)
        return 0.0
    
    elif criteria_type == CRITERIA_TYPE_LAST_PURCHASE_DAYS:
        # Days since last purchase
        from payments.models import Payment
        last_payment = Payment.objects.filter(
            user=user,
            status='COMPLETED'
        ).order_by('-created_at').first()
        
        if last_payment:
            delta = timezone.now() - last_payment.created_at
            return float(delta.days)
        return 999999.0  # Very high number if no purchase
    
    return 0.0


def calculate_customer_tier(user):
    """
    Calculate customer tier based on active criteria settings
    
    Args:
        user: User instance
    
    Returns:
        str: Tier level (GOLD, SILVER, or BRONZE)
    """
    from .models import CustomerTierSettings
    
    # Get all active tier settings, ordered by priority (highest first)
    tier_settings = CustomerTierSettings.objects.filter(
        is_active=True
    ).order_by('-priority', 'tier')
    
    # Check each tier from highest to lowest (GOLD -> SILVER -> BRONZE)
    tier_priority = [CUSTOMER_TIER_GOLD, CUSTOMER_TIER_SILVER, CUSTOMER_TIER_BRONZE]
    
    for tier in tier_priority:
        # Get all criteria for this tier
        tier_criteria = tier_settings.filter(tier=tier)
        
        # Check if user meets all criteria for this tier
        # (You can modify this logic: all criteria OR any criteria)
        tier_matched = False
        
        for criterion in tier_criteria:
            if criterion.check_criteria(user):
                tier_matched = True
                break  # User matches at least one criterion for this tier
        
        if tier_matched:
            return tier
    
    # Default to BRONZE if no criteria matched
    return CUSTOMER_TIER_BRONZE


def get_customer_tier_info(user):
    """
    Get detailed customer tier information
    
    Args:
        user: User instance
    
    Returns:
        dict: Tier information with metrics
    """
    from .models import CustomerTierSettings
    
    current_tier = calculate_customer_tier(user)
    
    # Calculate all metrics
    metrics = {
        'total_purchase_amount': calculate_user_metric(user, CRITERIA_TYPE_TOTAL_PURCHASE_AMOUNT),
        'total_bookings_count': calculate_user_metric(user, CRITERIA_TYPE_TOTAL_BOOKINGS_COUNT),
        'monthly_purchase_amount': calculate_user_metric(user, CRITERIA_TYPE_MONTHLY_PURCHASE_AMOUNT),
        'days_since_registration': calculate_user_metric(user, CRITERIA_TYPE_DAYS_SINCE_REGISTRATION),
        'days_since_last_purchase': calculate_user_metric(user, CRITERIA_TYPE_LAST_PURCHASE_DAYS),
    }
    
    # Get next tier requirements
    tier_priority = [CUSTOMER_TIER_GOLD, CUSTOMER_TIER_SILVER, CUSTOMER_TIER_BRONZE]
    current_index = tier_priority.index(current_tier) if current_tier in tier_priority else 2
    
    next_tier = None
    next_tier_requirements = []
    
    if current_index > 0:
        next_tier = tier_priority[current_index - 1]
        next_tier_criteria = CustomerTierSettings.objects.filter(
            tier=next_tier,
            is_active=True
        ).order_by('-priority')
        
        for criterion in next_tier_criteria:
            user_value = calculate_user_metric(user, criterion.criteria_type)
            requirement = {
                'criteria_type': criterion.get_criteria_type_display(),
                'operator': criterion.get_operator_display(),
                'required_value': float(criterion.value),
                'current_value': user_value,
                'met': criterion.check_criteria(user),
            }
            next_tier_requirements.append(requirement)
    
    return {
        'current_tier': current_tier,
        'current_tier_display': dict(CUSTOMER_TIER_CHOICES).get(current_tier, ''),
        'metrics': metrics,
        'next_tier': next_tier,
        'next_tier_display': dict(CUSTOMER_TIER_CHOICES).get(next_tier, '') if next_tier else None,
        'next_tier_requirements': next_tier_requirements,
    }


def generate_session_id():
    """
    Generate a unique session ID for chat sessions
    """
    import secrets
    return secrets.token_urlsafe(32)

