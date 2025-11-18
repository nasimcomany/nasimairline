"""
Validators for payments app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_payment_amount(value):
    """
    Validate payment amount (must be positive)
    """
    if value <= 0:
        raise ValidationError(
            _('مبلغ پرداخت باید بیشتر از صفر باشد'),
            code='invalid_amount'
        )


def validate_transaction_id(value):
    """
    Validate transaction ID format (alphanumeric, 10-50 characters)
    """
    if not value:
        return
    
    import re
    value = str(value).strip()
    
    if len(value) < 10 or len(value) > 50:
        raise ValidationError(
            _('شناسه تراکنش باید بین 10 تا 50 کاراکتر باشد'),
            code='invalid_transaction_id_length'
        )
    
    if not re.match(r'^[A-Za-z0-9_-]+$', value):
        raise ValidationError(
            _('شناسه تراکنش باید شامل حروف، اعداد، خط تیره و زیرخط باشد'),
            code='invalid_transaction_id_format'
        )


def validate_card_number(value):
    """
    Validate credit card number (Luhn algorithm)
    """
    if not value:
        return
    
    # Remove spaces and dashes
    card_number = ''.join(filter(str.isdigit, str(value)))
    
    if len(card_number) < 13 or len(card_number) > 19:
        raise ValidationError(
            _('شماره کارت باید بین 13 تا 19 رقم باشد'),
            code='invalid_card_length'
        )
    
    # Luhn algorithm validation
    def luhn_check(card_num):
        def digits_of(n):
            return [int(d) for d in str(n)]
        digits = digits_of(card_num)
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        checksum = sum(odd_digits)
        for d in even_digits:
            checksum += sum(digits_of(d * 2))
        return checksum % 10 == 0
    
    if not luhn_check(int(card_number)):
        raise ValidationError(
            _('شماره کارت نامعتبر است'),
            code='invalid_card_number'
        )


def validate_cvv(value):
    """
    Validate CVV code (3 or 4 digits)
    """
    if not value:
        return
    
    value = str(value).strip()
    
    if not value.isdigit():
        raise ValidationError(
            _('کد CVV باید فقط شامل اعداد باشد'),
            code='invalid_cvv_format'
        )
    
    if len(value) not in [3, 4]:
        raise ValidationError(
            _('کد CVV باید 3 یا 4 رقم باشد'),
            code='invalid_cvv_length'
        )


def validate_expiry_date(value):
    """
    Validate card expiry date (MM/YY format)
    """
    if not value:
        return
    
    import re
    from datetime import datetime
    
    value = str(value).strip()
    
    # Check format MM/YY
    if not re.match(r'^\d{2}/\d{2}$', value):
        raise ValidationError(
            _('فرمت تاریخ انقضا نامعتبر است (باید MM/YY باشد)'),
            code='invalid_expiry_format'
        )
    
    month, year = value.split('/')
    month = int(month)
    year = int(year)
    
    # Convert YY to YYYY
    current_year = datetime.now().year
    century = (current_year // 100) * 100
    full_year = century + year
    
    # Validate month
    if month < 1 or month > 12:
        raise ValidationError(
            _('ماه باید بین 1 تا 12 باشد'),
            code='invalid_month'
        )
    
    # Validate expiry (should be in future)
    expiry_date = datetime(full_year, month, 1)
    if expiry_date < datetime.now():
        raise ValidationError(
            _('تاریخ انقضای کارت گذشته است'),
            code='expired_card'
        )


def validate_refund_amount(original_amount, refund_amount):
    """
    Validate refund amount doesn't exceed original amount
    """
    if refund_amount > original_amount:
        raise ValidationError(
            _('مبلغ بازپرداخت نمی‌تواند بیشتر از مبلغ اصلی باشد'),
            code='refund_exceeds_original'
        )
    
    if refund_amount <= 0:
        raise ValidationError(
            _('مبلغ بازپرداخت باید بیشتر از صفر باشد'),
            code='invalid_refund_amount'
        )


def validate_installment_plan(months):
    """
    Validate installment plan (3, 6, or 12 months)
    """
    valid_plans = [3, 6, 12]
    if months not in valid_plans:
        raise ValidationError(
            _('طرح اقساط باید 3، 6 یا 12 ماهه باشد'),
            code='invalid_installment_plan'
        )

