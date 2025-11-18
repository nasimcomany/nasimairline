"""
Validators for flights app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from datetime import datetime, timedelta


def validate_flight_number(value):
    """
    Validate flight number format
    Should be alphanumeric, 3-6 characters
    """
    if not value:
        raise ValidationError(
            _('شماره پرواز الزامی است'),
            code='required'
        )
    
    value = str(value).strip().upper()
    
    if len(value) < 3 or len(value) > 6:
        raise ValidationError(
            _('شماره پرواز باید بین 3 تا 6 کاراکتر باشد'),
            code='invalid_length'
        )
    
    if not value.replace('-', '').isalnum():
        raise ValidationError(
            _('شماره پرواز باید شامل حروف و اعداد باشد'),
            code='invalid_format'
        )


def validate_airport_code(value):
    """
    Validate IATA airport code (3 letters)
    """
    if not value:
        raise ValidationError(
            _('کد فرودگاه الزامی است'),
            code='required'
        )
    
    value = str(value).strip().upper()
    
    if len(value) != 3:
        raise ValidationError(
            _('کد فرودگاه باید دقیقاً 3 حرف باشد'),
            code='invalid_length'
        )
    
    if not value.isalpha():
        raise ValidationError(
            _('کد فرودگاه باید فقط شامل حروف باشد'),
            code='invalid_format'
        )


def validate_flight_times(departure_time, arrival_time):
    """
    Validate that arrival time is after departure time
    """
    if departure_time and arrival_time:
        if arrival_time <= departure_time:
            raise ValidationError(
                _('زمان فرود باید بعد از زمان پرواز باشد'),
                code='invalid_time_range'
            )
        
        # Check if flight duration is reasonable
        duration = arrival_time - departure_time
        if duration < timedelta(minutes=30):
            raise ValidationError(
                _('مدت پرواز باید حداقل 30 دقیقه باشد'),
                code='duration_too_short'
            )
        
        if duration > timedelta(hours=24):
            raise ValidationError(
                _('مدت پرواز نمی‌تواند بیشتر از 24 ساعت باشد'),
                code='duration_too_long'
            )


def validate_seat_capacity(total_seats, economy_seats, business_seats, first_class_seats):
    """
    Validate that sum of cabin seats equals total seats
    """
    if total_seats and economy_seats and business_seats and first_class_seats:
        sum_seats = economy_seats + business_seats + first_class_seats
        if sum_seats != total_seats:
            raise ValidationError(
                _('مجموع صندلی‌های کابین باید برابر با تعداد کل صندلی‌ها باشد'),
                code='seat_mismatch'
            )


def validate_positive_price(value):
    """
    Validate that price is positive
    """
    if value and value <= 0:
        raise ValidationError(
            _('قیمت باید بیشتر از صفر باشد'),
            code='invalid_price'
        )


def validate_available_seats(available, total):
    """
    Validate that available seats don't exceed total seats
    """
    if available and total:
        if available > total:
            raise ValidationError(
                _('تعداد صندلی‌های موجود نمی‌تواند بیشتر از کل صندلی‌ها باشد'),
                code='invalid_availability'
            )
        
        if available < 0:
            raise ValidationError(
                _('تعداد صندلی‌های موجود نمی‌تواند منفی باشد'),
                code='negative_availability'
            )


def validate_future_departure_time(value):
    """
    Validate that departure time is not too far in the past
    Allow flights up to 1 day in the past (for completed flights)
    """
    if value:
        one_day_ago = datetime.now() - timedelta(days=1)
        if value < one_day_ago:
            raise ValidationError(
                _('زمان پرواز نمی‌تواند بیشتر از یک روز در گذشته باشد'),
                code='departure_too_old'
            )

