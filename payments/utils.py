"""
Utility functions for payments app
"""
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from .constants import (
    INSTALLMENT_INTEREST_RATES,
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
)


def generate_transaction_id():
    """
    Generate a unique transaction ID
    
    Returns:
        String transaction ID
    """
    import random
    import string
    
    # Generate random alphanumeric string
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choice(chars) for _ in range(12))
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"TXN{timestamp}{random_part}"


def calculate_installment_amount(principal, months):
    """
    Calculate monthly installment amount
    
    Args:
        principal: Decimal principal amount
        months: Integer number of months
        
    Returns:
        Dictionary with installment details
    """
    if months not in INSTALLMENT_INTEREST_RATES:
        raise ValueError(f"Invalid installment plan: {months} months")
    
    annual_rate = Decimal(str(INSTALLMENT_INTEREST_RATES[months]))
    monthly_rate = annual_rate / Decimal('12')
    
    # Calculate monthly payment using amortization formula
    # M = P * (r(1+r)^n) / ((1+r)^n - 1)
    r = monthly_rate
    n = Decimal(str(months))
    P = Decimal(str(principal))
    
    if r == 0:
        monthly_payment = P / n
    else:
        numerator = r * ((1 + r) ** n)
        denominator = ((1 + r) ** n) - 1
        monthly_payment = P * (numerator / denominator)
    
    total_amount = monthly_payment * n
    total_interest = total_amount - P
    
    return {
        'monthly_payment': monthly_payment.quantize(Decimal('0.01')),
        'total_amount': total_amount.quantize(Decimal('0.01')),
        'total_interest': total_interest.quantize(Decimal('0.01')),
        'principal': P,
        'months': months,
    }


def calculate_refund_amount(payment, refund_percentage=100):
    """
    Calculate refund amount
    
    Args:
        payment: Payment instance
        refund_percentage: Integer percentage to refund (default: 100)
        
    Returns:
        Decimal refund amount
    """
    if refund_percentage < 0 or refund_percentage > 100:
        raise ValueError("Refund percentage must be between 0 and 100")
    
    refund_amount = payment.amount * Decimal(str(refund_percentage)) / Decimal('100')
    return refund_amount.quantize(Decimal('0.01'))


def format_amount(amount, currency='IRR'):
    """
    Format amount with currency symbol
    
    Args:
        amount: Decimal amount
        currency: String currency code
        
    Returns:
        String formatted amount
    """
    currency_symbols = {
        'IRR': 'ریال',
        'USD': '$',
        'EUR': '€',
    }
    
    symbol = currency_symbols.get(currency, currency)
    
    if currency == 'IRR':
        # Format with thousand separators
        amount_str = f"{amount:,.0f}"
        return f"{amount_str} {symbol}"
    else:
        return f"{symbol}{amount:,.2f}"


def is_payment_expired(payment, expiry_hours=24):
    """
    Check if payment has expired
    
    Args:
        payment: Payment instance
        expiry_hours: Integer hours until expiry
        
    Returns:
        Boolean expired status
    """
    if payment.status != 'PENDING':
        return False
    
    now = timezone.now()
    expiry_time = payment.created_at + timedelta(hours=expiry_hours)
    
    return now > expiry_time


def get_payment_summary(payment):
    """
    Get payment summary information
    
    Args:
        payment: Payment instance
        
    Returns:
        Dictionary with payment summary
    """
    return {
        'transaction_id': payment.transaction_id,
        'amount': payment.amount,
        'status': payment.get_status_display(),
        'gateway': payment.get_gateway_display(),
        'method': payment.get_method_display(),
        'created_at': payment.created_at,
    }


def process_payment_response(gateway_response):
    """
    Process payment gateway response
    
    Args:
        gateway_response: Dictionary from gateway
        
    Returns:
        Dictionary with processed response
    """
    # This is a placeholder - actual implementation depends on gateway
    return {
        'success': gateway_response.get('status') == 'success',
        'transaction_id': gateway_response.get('transaction_id'),
        'message': gateway_response.get('message', ''),
        'reference_code': gateway_response.get('reference_code'),
    }

