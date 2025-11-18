"""
Validators for notifications app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_email_address(value):
    """
    Validate email address format
    """
    if not value:
        return
    
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, value):
        raise ValidationError(
            _('فرمت ایمیل نامعتبر است'),
            code='invalid_email'
        )


def validate_phone_number(value):
    """
    Validate phone number for SMS notifications
    """
    if not value:
        return
    
    import re
    # Iranian phone number format
    phone = re.sub(r'[\s-]', '', str(value))
    
    patterns = [
        r'^09\d{9}$',
        r'^\+989\d{9}$',
    ]
    
    if not any(re.match(pattern, phone) for pattern in patterns):
        raise ValidationError(
            _('شماره تلفن باید در فرمت صحیح باشد'),
            code='invalid_phone'
        )

