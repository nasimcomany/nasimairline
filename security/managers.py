"""
Custom managers for security app
"""
from django.db import models
from .constants import ALERT_ACTIVE


class SecurityInfoManager(models.Manager):
    """
    Custom manager for SecurityInfo model
    """
    
    def by_flight(self, flight):
        """Filter security info by flight"""
        return self.filter(flight=flight)
    
    def high_priority(self):
        """Return high priority security info"""
        return self.filter(security_level__in=['HIGH', 'CRITICAL'])


class SecurityAlertManager(models.Manager):
    """
    Custom manager for SecurityAlert model
    """
    
    def active(self):
        """Return active alerts"""
        return self.filter(status=ALERT_ACTIVE)
    
    def resolved(self):
        """Return resolved alerts"""
        return self.filter(status='RESOLVED')

