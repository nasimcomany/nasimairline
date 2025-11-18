"""
Signals for accounts app
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .utils import calculate_membership_level

User = get_user_model()


@receiver(pre_save, sender=User)
def update_membership_level(sender, instance, **kwargs):
    """
    Automatically update membership level based on loyalty points
    """
    if instance.pk:  # Only for existing users
        try:
            old_instance = User.objects.get(pk=instance.pk)
            # Check if points changed
            if old_instance.loyalty_points != instance.loyalty_points:
                new_level = calculate_membership_level(instance.loyalty_points)
                if instance.membership_level != new_level:
                    instance.membership_level = new_level
        except User.DoesNotExist:
            pass
    else:
        # For new users, set initial membership level
        instance.membership_level = calculate_membership_level(instance.loyalty_points)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create user profile when a new user is created
    This can be extended to create related models
    """
    if created:
        # You can create related models here if needed
        # For example: UserProfile.objects.create(user=instance)
        pass

