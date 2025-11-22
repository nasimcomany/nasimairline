"""
Validators for blog app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_slug(slug):
    """
    Validate slug format
    """
    if not slug:
        raise ValidationError(_('اسلاگ نمی‌تواند خالی باشد.'))
    
    if len(slug) < 3:
        raise ValidationError(_('اسلاگ باید حداقل 3 کاراکتر باشد.'))
    
    if len(slug) > 100:
        raise ValidationError(_('اسلاگ نمی‌تواند بیشتر از 100 کاراکتر باشد.'))
    
    # Check for valid characters (letters, numbers, hyphens, underscores)
    import re
    if not re.match(r'^[a-z0-9_-]+$', slug):
        raise ValidationError(_('اسلاگ فقط می‌تواند شامل حروف کوچک، اعداد، خط تیره و زیرخط باشد.'))


def validate_meta_description(description):
    """
    Validate meta description length for SEO
    """
    if description and len(description) > 160:
        raise ValidationError(_('توضیحات متا نباید بیشتر از 160 کاراکتر باشد.'))


def validate_meta_title(title):
    """
    Validate meta title length for SEO
    """
    if title and len(title) > 60:
        raise ValidationError(_('عنوان متا نباید بیشتر از 60 کاراکتر باشد.'))


def validate_reading_time(content):
    """
    Validate reading time calculation
    """
    if not content:
        return 0
    
    # Average reading speed: 200 words per minute
    words = len(content.split())
    reading_time = max(1, round(words / 200))
    return reading_time

