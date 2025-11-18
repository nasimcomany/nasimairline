"""
Validators for pilots app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_license_number(value):
    """
    Validate pilot license number
    """
    if not value:
        return
    
    import re
    value = str(value).strip().upper()
    
    # License format: alphanumeric, 6-12 characters
    if len(value) < 6 or len(value) > 12:
        raise ValidationError(
            _('شماره مجوز باید بین 6 تا 12 کاراکتر باشد'),
            code='invalid_license_length'
        )
    
    if not re.match(r'^[A-Z0-9]+$', value):
        raise ValidationError(
            _('شماره مجوز باید شامل حروف انگلیسی و اعداد باشد'),
            code='invalid_license_format'
        )


def validate_flight_hours(value):
    """
    Validate flight hours (must be non-negative)
    """
    if value < 0:
        raise ValidationError(
            _('ساعات پرواز نمی‌تواند منفی باشد'),
            code='negative_hours'
        )

