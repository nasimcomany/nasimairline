"""
Managers for customer_service app
"""
from django.db import models
from django.utils import timezone
from .constants import (
    CHAT_STATUS_OPEN,
    CHAT_STATUS_WAITING,
    CHAT_STATUS_IN_PROGRESS,
    CHAT_STATUS_CLOSED,
)


class ChatSessionManager(models.Manager):
    """Manager for ChatSession model"""
    
    def open(self):
        """Get open chat sessions"""
        return self.filter(status=CHAT_STATUS_OPEN)
    
    def waiting(self):
        """Get waiting chat sessions"""
        return self.filter(status=CHAT_STATUS_WAITING)
    
    def in_progress(self):
        """Get in-progress chat sessions"""
        return self.filter(status=CHAT_STATUS_IN_PROGRESS)
    
    def closed(self):
        """Get closed chat sessions"""
        return self.filter(status=CHAT_STATUS_CLOSED)
    
    def for_user(self, user):
        """Get chat sessions for a specific user"""
        return self.filter(user=user)
    
    def for_staff(self, staff_user):
        """Get chat sessions assigned to a staff member"""
        return self.filter(assigned_to=staff_user)
    
    def unassigned(self):
        """Get unassigned chat sessions"""
        return self.filter(assigned_to__isnull=True, status__in=[CHAT_STATUS_OPEN, CHAT_STATUS_WAITING])


class ChatMessageManager(models.Manager):
    """Manager for ChatMessage model"""
    
    def unread(self):
        """Get unread messages"""
        return self.filter(is_read=False)
    
    def for_session(self, session):
        """Get messages for a specific session"""
        return self.filter(session=session)
    
    def from_staff(self):
        """Get messages from staff"""
        from .constants import MESSAGE_TYPE_STAFF
        return self.filter(message_type=MESSAGE_TYPE_STAFF)
    
    def from_customer(self):
        """Get messages from customer"""
        from .constants import MESSAGE_TYPE_CUSTOMER
        return self.filter(message_type=MESSAGE_TYPE_CUSTOMER)

