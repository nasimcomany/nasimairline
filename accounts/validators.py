"""
Validators for accounts app
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_iranian_phone_number(value):
    """
    Validate Iranian phone number format
    Accepts: 09123456789, +989123456789, 00989123456789
    """
    if not value:
        return
    
    # Remove spaces and dashes
    phone = re.sub(r'[\s-]', '', str(value))
    
    # Check for Iranian phone number patterns
    patterns = [
        r'^09\d{9}$',  # 09123456789
        r'^\+989\d{9}$',  # +989123456789
        r'^00989\d{9}$',  # 00989123456789
    ]
    
    if not any(re.match(pattern, phone) for pattern in patterns):
        raise ValidationError(
            _('شماره تلفن باید در فرمت صحیح ایرانی باشد (مثال: 09123456789)'),
            code='invalid_phone'
        )


def validate_passport_number(value):
    """
    Validate passport number format
    Most passports have 6-9 alphanumeric characters
    """
    if not value:
        return
    
    value = str(value).strip().upper()
    
    # Check length
    if len(value) < 6 or len(value) > 9:
        raise ValidationError(
            _('شماره گذرنامه باید بین 6 تا 9 کاراکتر باشد'),
            code='invalid_passport_length'
        )
    
    # Check if alphanumeric
    if not re.match(r'^[A-Z0-9]+$', value):
        raise ValidationError(
            _('شماره گذرنامه باید فقط شامل حروف انگلیسی و اعداد باشد'),
            code='invalid_passport_format'
        )


def validate_national_id(value):
    """
    Validate Iranian national ID (کد ملی)
    Should be 10 digits
    """
    if not value:
        return
    
    value = str(value).strip()
    
    # Check if all digits
    if not value.isdigit():
        raise ValidationError(
            _('کد ملی باید فقط شامل اعداد باشد'),
            code='invalid_national_id_format'
        )
    
    # Check length
    if len(value) != 10:
        raise ValidationError(
            _('کد ملی باید دقیقاً 10 رقم باشد'),
            code='invalid_national_id_length'
        )
    
    # Basic checksum validation (simplified)
    if len(set(value)) == 1:  # All digits are the same
        raise ValidationError(
            _('کد ملی معتبر نیست'),
            code='invalid_national_id_checksum'
        )


def validate_loyalty_points(value):
    """
    Validate loyalty points (should be non-negative)
    """
    if value < 0:
        raise ValidationError(
            _('امتیاز وفاداری نمی‌تواند منفی باشد'),
            code='negative_points'
        )


def validate_email_domain(value):
    """
    Validate email domain (basic check)
    """
    if not value:
        return
    
    email = str(value).strip().lower()
    
    # Check for common invalid domains
    invalid_domains = ['example.com', 'test.com', 'invalid.com']
    domain = email.split('@')[-1] if '@' in email else ''
    
    if domain in invalid_domains:
        raise ValidationError(
            _('لطفاً از یک آدرس ایمیل معتبر استفاده کنید'),
            code='invalid_email_domain'
        )

