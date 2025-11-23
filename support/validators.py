"""
Validators for support app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_ticket_reference(value):
    """
    Validate ticket reference number format
    Format: NAS-YYYYMMDD-XXXXXX (e.g., NAS-20240101-000001)
    """
    if not value:
        return
    
    parts = value.split('-')
    if len(parts) != 3:
        raise ValidationError(
            _('فرمت شماره تیکت باید به صورت NAS-YYYYMMDD-XXXXXX باشد.')
        )
    
    if parts[0] != 'NAS':
        raise ValidationError(
            _('شماره تیکت باید با NAS شروع شود.')
        )
    
    if len(parts[1]) != 8 or not parts[1].isdigit():
        raise ValidationError(
            _('بخش تاریخ باید 8 رقم باشد (YYYYMMDD).')
        )
    
    if len(parts[2]) != 6 or not parts[2].isdigit():
        raise ValidationError(
            _('بخش شماره سریال باید 6 رقم باشد.')
        )


def validate_file_size(value):
    """
    Validate file size (max 10MB)
    """
    max_size = 10 * 1024 * 1024  # 10MB
    if value.size > max_size:
        raise ValidationError(
            _('حجم فایل نباید بیشتر از 10 مگابایت باشد.')
        )


def validate_file_type(value):
    """
    Validate file type (images and documents only)
    """
    allowed_extensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.bmp',  # Images
        '.pdf', '.doc', '.docx', '.xls', '.xlsx',  # Documents
        '.txt', '.csv',  # Text files
    ]
    
    file_extension = value.name.lower().split('.')[-1]
    if f'.{file_extension}' not in allowed_extensions:
        raise ValidationError(
            _('نوع فایل مجاز نیست. فقط تصاویر و اسناد مجاز هستند.')
        )

