"""
Validators for gallery app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from PIL import Image
import os


def validate_image_size(image):
    """
    Validate image file size (max 10MB)
    """
    max_size = 10 * 1024 * 1024  # 10MB
    if image.size > max_size:
        raise ValidationError(
            _('حجم فایل تصویر نباید بیشتر از 10 مگابایت باشد.')
        )


def validate_image_format(image):
    """
    Validate image format (only JPEG, PNG, WebP)
    """
    allowed_formats = ['JPEG', 'PNG', 'WEBP']
    try:
        img = Image.open(image)
        if img.format not in allowed_formats:
            raise ValidationError(
                _('فرمت تصویر باید JPEG، PNG یا WebP باشد.')
            )
    except Exception:
        raise ValidationError(_('فایل انتخاب شده یک تصویر معتبر نیست.'))


def validate_video_size(video):
    """
    Validate video file size (max 100MB)
    """
    max_size = 100 * 1024 * 1024  # 100MB
    if video.size > max_size:
        raise ValidationError(
            _('حجم فایل ویدیو نباید بیشتر از 100 مگابایت باشد.')
        )


def validate_document_size(document):
    """
    Validate document file size (max 5MB)
    """
    max_size = 5 * 1024 * 1024  # 5MB
    if document.size > max_size:
        raise ValidationError(
            _('حجم فایل سند نباید بیشتر از 5 مگابایت باشد.')
        )

