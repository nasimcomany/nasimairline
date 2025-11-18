"""
Validators for bookings app
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from datetime import datetime, timedelta


def validate_booking_date(booking_date, flight_date):
    """
    Validate that booking date is before flight date
    """
    if booking_date and flight_date:
        if booking_date >= flight_date:
            raise ValidationError(
                _('تاریخ رزرو باید قبل از تاریخ پرواز باشد'),
                code='invalid_booking_date'
            )


def validate_passenger_age(date_of_birth, passenger_type):
    """
    Validate passenger age matches passenger type
    
    Adult: 12+ years
    Child: 2-11 years
    Infant: 0-2 years
    """
    if not date_of_birth:
        return
    
    from .constants import PASSENGER_ADULT, PASSENGER_CHILD, PASSENGER_INFANT
    
    today = datetime.now().date()
    age = today.year - date_of_birth.year - (
        (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
    )
    
    if passenger_type == PASSENGER_ADULT and age < 12:
        raise ValidationError(
            _('برای بزرگسال باید حداقل 12 سال سن داشته باشید'),
            code='invalid_adult_age'
        )
    elif passenger_type == PASSENGER_CHILD and (age < 2 or age >= 12):
        raise ValidationError(
            _('برای کودک باید بین 2 تا 11 سال سن داشته باشید'),
            code='invalid_child_age'
        )
    elif passenger_type == PASSENGER_INFANT and age >= 2:
        raise ValidationError(
            _('برای نوزاد باید کمتر از 2 سال سن داشته باشید'),
            code='invalid_infant_age'
        )


def validate_seat_number(value):
    """
    Validate seat number format (e.g., 12A, 1B, 25C)
    """
    if not value:
        return
    
    import re
    value = str(value).strip().upper()
    
    # Pattern: number followed by letter (A-Z)
    pattern = r'^\d{1,2}[A-Z]$'
    
    if not re.match(pattern, value):
        raise ValidationError(
            _('فرمت شماره صندلی نامعتبر است (مثال: 12A)'),
            code='invalid_seat_format'
        )


def validate_booking_total(total_amount, base_price, extras_price, taxes):
    """
    Validate that booking total equals sum of components
    """
    calculated_total = base_price + extras_price + taxes
    
    if abs(float(total_amount) - float(calculated_total)) > 0.01:
        raise ValidationError(
            _('مجموع قیمت‌ها با کل مبلغ همخوانی ندارد'),
            code='invalid_total_amount'
        )


def validate_cancellation_time(booking, cancellation_time):
    """
    Validate cancellation time is before flight departure
    """
    if booking and booking.flight and cancellation_time:
        flight_departure = booking.flight.departure_time
        
        if cancellation_time >= flight_departure:
            raise ValidationError(
                _('لغو رزرو باید قبل از زمان پرواز انجام شود'),
                code='invalid_cancellation_time'
            )


def validate_passenger_count(adults, children, infants):
    """
    Validate passenger count (at least 1 adult required)
    """
    if adults < 1:
        raise ValidationError(
            _('حداقل یک بزرگسال الزامی است'),
            code='no_adults'
        )
    
    if infants > adults:
        raise ValidationError(
            _('تعداد نوزادان نمی‌تواند بیشتر از تعداد بزرگسالان باشد'),
            code='too_many_infants'
        )


def validate_booking_reference(value):
    """
    Validate booking reference format (alphanumeric, 6-10 characters)
    """
    if not value:
        return
    
    import re
    value = str(value).strip().upper()
    
    if len(value) < 6 or len(value) > 10:
        raise ValidationError(
            _('کد رزرو باید بین 6 تا 10 کاراکتر باشد'),
            code='invalid_reference_length'
        )
    
    if not re.match(r'^[A-Z0-9]+$', value):
        raise ValidationError(
            _('کد رزرو باید شامل حروف انگلیسی و اعداد باشد'),
            code='invalid_reference_format'
        )

