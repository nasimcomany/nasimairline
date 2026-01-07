"""
Validators for customer_service app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_session_id(value):
    """Validate session ID format"""
    if not value:
        raise ValidationError(_('شناسه نشست نمی‌تواند خالی باشد'))
    
    if len(value) < 10:
        raise ValidationError(_('شناسه نشست باید حداقل 10 کاراکتر باشد'))

