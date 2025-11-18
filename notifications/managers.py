"""
Custom managers for notifications app
"""
from django.db import models
from .constants import (
    NOTIFICATION_SENT,
    NOTIFICATION_PENDING,
    NOTIFICATION_READ,
)


class NotificationManager(models.Manager):
    """
    Custom manager for Notification model
    """
    
    def sent(self):
        """Return sent notifications"""
        return self.filter(status=NOTIFICATION_SENT)
    
    def pending(self):
        """Return pending notifications"""
        return self.filter(status=NOTIFICATION_PENDING)
    
    def unread(self):
        """Return unread notifications"""
        return self.exclude(status=NOTIFICATION_READ)
    
    def by_user(self, user):
        """Filter notifications by user"""
        return self.filter(user=user)
    
    def by_type(self, notification_type):
        """Filter notifications by type"""
        return self.filter(notification_type=notification_type)
    
    def by_channel(self, channel):
        """Filter notifications by channel"""
        return self.filter(channel=channel)

