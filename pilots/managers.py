"""
Custom managers for pilots app
"""
from django.db import models
from .constants import PILOT_ACTIVE, REQUEST_PENDING


class PilotManager(models.Manager):
    """
    Custom manager for Pilot model
    """
    
    def active(self):
        """Return active pilots"""
        return self.filter(status=PILOT_ACTIVE)
    
    def available(self):
        """Return available pilots (active and not on leave)"""
        return self.filter(status=PILOT_ACTIVE).exclude(status='ON_LEAVE')


class PilotRequestManager(models.Manager):
    """
    Custom manager for PilotRequest model
    """
    
    def pending(self):
        """Return pending requests"""
        return self.filter(status=REQUEST_PENDING)
    
    def approved(self):
        """Return approved requests"""
        return self.filter(status='APPROVED')
    
    def by_pilot(self, pilot):
        """Filter requests by pilot"""
        return self.filter(pilot=pilot)

