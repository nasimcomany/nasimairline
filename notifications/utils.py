"""
Utility functions for notifications app
"""
from .constants import (
    NOTIFICATION_FLIGHT,
    NOTIFICATION_BOOKING,
    NOTIFICATION_PAYMENT,
    CHANNEL_EMAIL,
    CHANNEL_SMS,
    CHANNEL_PUSH,
)


def send_notification(user, notification_type, message, channel=CHANNEL_EMAIL, **kwargs):
    """
    Send notification to user
    
    Args:
        user: User instance
        notification_type: String notification type
        message: String message
        channel: String notification channel
        **kwargs: Additional parameters
        
    Returns:
        Notification instance
    """
    from .models import Notification
    
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        message=message,
        channel=channel,
        **kwargs
    )
    
    # Here you would integrate with actual notification services
    # (SMS gateway, Email service, Push notification service)
    
    return notification


def create_flight_notification(user, flight, message_type='REMINDER'):
    """
    Create flight-related notification
    
    Args:
        user: User instance
        flight: Flight instance
        message_type: String message type
        
    Returns:
        Notification instance
    """
    messages = {
        'REMINDER': f'یادآوری: پرواز شما {flight.flight_number} در {flight.departure_time} است',
        'DELAYED': f'پرواز شما {flight.flight_number} تأخیر دارد',
        'CANCELLED': f'پرواز شما {flight.flight_number} لغو شده است',
    }
    
    message = messages.get(message_type, messages['REMINDER'])
    
    return send_notification(
        user=user,
        notification_type=NOTIFICATION_FLIGHT,
        message=message,
        channel=CHANNEL_SMS,
    )


def create_booking_notification(user, booking, message_type='CONFIRMED'):
    """
    Create booking-related notification
    
    Args:
        user: User instance
        booking: Booking instance
        message_type: String message type
        
    Returns:
        Notification instance
    """
    messages = {
        'CONFIRMED': f'رزرو شما با کد {booking.booking_reference} تأیید شد',
        'CANCELLED': f'رزرو شما با کد {booking.booking_reference} لغو شد',
    }
    
    message = messages.get(message_type, messages['CONFIRMED'])
    
    return send_notification(
        user=user,
        notification_type=NOTIFICATION_BOOKING,
        message=message,
        channel=CHANNEL_EMAIL,
    )

