"""
Custom managers for support app
"""
from django.db import models
from django.utils import timezone
from .constants import (
    TICKET_STATUS_OPEN,
    TICKET_STATUS_IN_PROGRESS,
    TICKET_STATUS_WAITING_CUSTOMER,
    TICKET_STATUS_RESOLVED,
    TICKET_STATUS_CLOSED,
    TICKET_PRIORITY_URGENT,
    TICKET_PRIORITY_CRITICAL,
)


class TicketManager(models.Manager):
    """
    Custom manager for Ticket model
    """
    
    def active(self):
        """Get active tickets (not closed or cancelled)"""
        return self.filter(
            status__in=[
                TICKET_STATUS_OPEN,
                TICKET_STATUS_IN_PROGRESS,
                TICKET_STATUS_WAITING_CUSTOMER,
            ]
        )
    
    def closed(self):
        """Get closed tickets"""
        return self.filter(
            status__in=[
                TICKET_STATUS_RESOLVED,
                TICKET_STATUS_CLOSED,
            ]
        )
    
    def urgent(self):
        """Get urgent and critical tickets"""
        return self.filter(
            priority__in=[
                TICKET_PRIORITY_URGENT,
                TICKET_PRIORITY_CRITICAL,
            ]
        )
    
    def by_user(self, user):
        """Get tickets by user"""
        return self.filter(user=user)
    
    def by_category(self, category):
        """Get tickets by category"""
        return self.filter(category=category)
    
    def by_status(self, status):
        """Get tickets by status"""
        return self.filter(status=status)
    
    def by_priority(self, priority):
        """Get tickets by priority"""
        return self.filter(priority=priority)
    
    def overdue(self):
        """Get tickets that are overdue (past SLA deadline)"""
        return self.filter(
            sla_deadline__lt=timezone.now(),
            status__in=[
                TICKET_STATUS_OPEN,
                TICKET_STATUS_IN_PROGRESS,
                TICKET_STATUS_WAITING_CUSTOMER,
            ]
        )
    
    def from_nira(self):
        """Get tickets created from Nira system"""
        return self.filter(source='NIRA')


class TicketMessageManager(models.Manager):
    """
    Custom manager for TicketMessage model
    """
    
    def by_ticket(self, ticket):
        """Get messages by ticket"""
        return self.filter(ticket=ticket)
    
    def by_user(self, user):
        """Get messages by user"""
        return self.filter(user=user)
    
    def customer_messages(self):
        """Get customer messages"""
        return self.filter(message_type='CUSTOMER')
    
    def staff_messages(self):
        """Get staff messages"""
        return self.filter(message_type='STAFF')
    
    def unread(self):
        """Get unread messages"""
        return self.filter(is_read=False)

