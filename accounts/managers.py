"""
Custom managers for accounts app
"""
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    for authentication instead of username.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        """
        if not email:
            raise ValueError(_('ایمیل الزامی است'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)
    
    def active(self):
        """Return only active users"""
        return self.filter(is_active=True)
    
    def by_membership_level(self, level):
        """Filter users by membership level"""
        return self.filter(membership_level=level)
    
    def with_loyalty_points(self, min_points=0):
        """Filter users with minimum loyalty points"""
        return self.filter(loyalty_points__gte=min_points)

