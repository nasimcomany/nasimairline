"""
Utility functions for support app
"""
from django.utils import timezone
from datetime import datetime
from .constants import TICKET_SOURCE_NIRA


def generate_ticket_reference():
    """
    Generate unique ticket reference number
    Format: NAS-YYYYMMDD-XXXXXX
    """
    from .models import Ticket
    
    today = timezone.now().date()
    date_str = today.strftime('%Y%m%d')
    
    # Get last ticket number for today
    last_ticket = Ticket.objects.filter(
        reference__startswith=f'NAS-{date_str}'
    ).order_by('-reference').first()
    
    if last_ticket:
        # Extract last number and increment
        last_number = int(last_ticket.reference.split('-')[-1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    # Format with leading zeros
    number_str = str(new_number).zfill(6)
    
    return f'NAS-{date_str}-{number_str}'


def calculate_sla_deadline(priority, created_at=None):
    """
    Calculate SLA deadline based on priority
    """
    from datetime import timedelta
    from .constants import (
        TICKET_PRIORITY_CRITICAL,
        TICKET_PRIORITY_URGENT,
        TICKET_PRIORITY_HIGH,
        TICKET_PRIORITY_NORMAL,
        TICKET_PRIORITY_LOW,
    )
    
    if created_at is None:
        created_at = timezone.now()
    
    # SLA hours based on priority
    sla_hours = {
        TICKET_PRIORITY_CRITICAL: 1,   # 1 hour
        TICKET_PRIORITY_URGENT: 4,     # 4 hours
        TICKET_PRIORITY_HIGH: 24,      # 24 hours
        TICKET_PRIORITY_NORMAL: 72,    # 3 days
        TICKET_PRIORITY_LOW: 168,      # 7 days
    }
    
    hours = sla_hours.get(priority, 72)
    deadline = created_at + timedelta(hours=hours)
    
    return deadline


def sync_with_nira(ticket):
    """
    Sync ticket with Nira system
    This function will be implemented when Nira integration is ready
    """
    # TODO: Implement Nira API integration
    pass


def create_ticket_from_nira(nira_data):
    """
    Create ticket from Nira system data
    This function will be called when receiving data from Nira
    """
    from .models import Ticket
    from accounts.models import User
    
    # Extract user information from Nira data
    # This is a placeholder - actual implementation depends on Nira API structure
    user_email = nira_data.get('customer_email')
    user = User.objects.filter(email=user_email).first()
    
    if not user:
        # Create user if doesn't exist (based on Nira data)
        # This should be handled carefully in production
        pass
    
    ticket = Ticket.objects.create(
        user=user,
        title=nira_data.get('subject', 'تیکت از سیستم نیرا'),
        description=nira_data.get('description', ''),
        category=nira_data.get('category', 'OTHER'),
        priority=nira_data.get('priority', 'NORMAL'),
        source=TICKET_SOURCE_NIRA,
        nira_ticket_id=nira_data.get('ticket_id'),
        nira_data=nira_data,
    )
    
    return ticket

