"""
Utility functions for support app
"""
import requests
import logging
from django.utils import timezone
from datetime import datetime
from django.conf import settings
from .constants import TICKET_SOURCE_NIRA

logger = logging.getLogger(__name__)


def generate_ticket_reference():
    """
    Generate unique ticket reference number
    Format: NAS-YYYYMMDD-XXXXXX
    """
    from .models import Ticket
    
    today = timezone.now().date()
    date_str = today.strftime('%Y%m%d')
    
    # Get last ticket number for today
    last_ticket = Ticket.objects.filter(
        reference__startswith=f'NAS-{date_str}'
    ).order_by('-reference').first()
    
    if last_ticket:
        # Extract last number and increment
        last_number = int(last_ticket.reference.split('-')[-1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    # Format with leading zeros
    number_str = str(new_number).zfill(6)
    
    return f'NAS-{date_str}-{number_str}'


def calculate_sla_deadline(priority, created_at=None):
    """
    Calculate SLA deadline based on priority
    """
    from datetime import timedelta
    from .constants import (
        TICKET_PRIORITY_CRITICAL,
        TICKET_PRIORITY_URGENT,
        TICKET_PRIORITY_HIGH,
        TICKET_PRIORITY_NORMAL,
        TICKET_PRIORITY_LOW,
    )
    
    if created_at is None:
        created_at = timezone.now()
    
    # SLA hours based on priority
    sla_hours = {
        TICKET_PRIORITY_CRITICAL: 1,   # 1 hour
        TICKET_PRIORITY_URGENT: 4,     # 4 hours
        TICKET_PRIORITY_HIGH: 24,      # 24 hours
        TICKET_PRIORITY_NORMAL: 72,    # 3 days
        TICKET_PRIORITY_LOW: 168,      # 7 days
    }
    
    hours = sla_hours.get(priority, 72)
    deadline = created_at + timedelta(hours=hours)
    
    return deadline


def sync_with_nira(ticket):
    """
    Sync ticket with Nira system
    This function will be implemented when Nira integration is ready
    """
    # TODO: Implement Nira API integration
    pass


def create_ticket_from_nira(nira_data):
    """
    Create ticket from Nira system data
    This function will be called when receiving data from Nira
    """
    from .models import Ticket
    from accounts.models import User
    
    # Extract user information from Nira data
    # This is a placeholder - actual implementation depends on Nira API structure
    user_email = nira_data.get('customer_email')
    user = User.objects.filter(email=user_email).first()
    
    if not user:
        # Create user if doesn't exist (based on Nira data)
        # This should be handled carefully in production
        pass
    
    ticket = Ticket.objects.create(
        user=user,
        title=nira_data.get('subject', 'تیکت از سیستم نیرا'),
        description=nira_data.get('description', ''),
        category=nira_data.get('category', 'OTHER'),
        priority=nira_data.get('priority', 'NORMAL'),
        source=TICKET_SOURCE_NIRA,
        nira_ticket_id=nira_data.get('ticket_id'),
        nira_data=nira_data,
    )
    
    return ticket


def send_whatsapp_message(phone_number, message):
    """
    Send WhatsApp message using configured API
    
    Args:
        phone_number: Phone number in international format (e.g., +989123456789)
        message: Message text to send
        
    Returns:
        bool: True if successful, False otherwise
    """
    whatsapp_api_url = getattr(settings, 'WHATSAPP_API_URL', None)
    whatsapp_api_key = getattr(settings, 'WHATSAPP_API_KEY', None)
    whatsapp_phone_id = getattr(settings, 'WHATSAPP_PHONE_ID', None)
    
    # اگر تنظیمات واتساپ وجود نداشته باشد، فقط لاگ می‌کنیم
    if not whatsapp_api_url or not whatsapp_api_key:
        logger.warning("WhatsApp API settings not configured. Skipping WhatsApp notification.")
        return False
    
    try:
        # این یک مثال کلی است - باید بر اساس API واقعی که استفاده می‌کنید تنظیم شود
        # برای مثال، می‌توانید از Twilio WhatsApp API استفاده کنید:
        # https://www.twilio.com/docs/whatsapp
        
        # یا از API های ایرانی مثل کاوه نگار، پیامک گستر، و غیره
        
        headers = {
            'Authorization': f'Bearer {whatsapp_api_key}',
            'Content-Type': 'application/json',
        }
        
        # فرمت پیام بر اساس API انتخابی
        payload = {
            'to': phone_number,
            'message': message,
        }
        
        # اگر از Twilio استفاده می‌کنید:
        # payload = {
        #     'To': f'whatsapp:{phone_number}',
        #     'From': f'whatsapp:{whatsapp_phone_id}',
        #     'Body': message,
        # }
        
        response = requests.post(
            whatsapp_api_url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            logger.info(f"WhatsApp message sent successfully to {phone_number}")
            return True
        else:
            logger.error(f"Failed to send WhatsApp message. Status: {response.status_code}, Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending WhatsApp message: {e}", exc_info=True)
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending WhatsApp message: {e}", exc_info=True)
        return False


def send_chat_notification_telegram(chat_message):
    """
    Send Telegram notification to admin when a new chat message is received from user/guest
    
    Args:
        chat_message: ChatMessage instance
        
    Returns:
        bool: True if successful, False otherwise
    """
    logger.info("send_chat_notification_telegram called for message id=%s", chat_message.id)
    telegram_bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None) or ''
    telegram_chat_id = str(getattr(settings, 'TELEGRAM_CHAT_ID', None) or '').strip()
    
    if not telegram_bot_token or not telegram_chat_id:
        logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured. Skipping Telegram notification.")
        return False
    
    if chat_message.is_staff:
        return False
    
    sender_name = chat_message.get_sender_name()
    message_preview = chat_message.message[:100] + '...' if len(chat_message.message) > 100 else chat_message.message
    admin_base_url = getattr(settings, 'ADMIN_BASE_URL', 'http://127.0.0.1:8000')
    admin_url = f"{admin_base_url}/admin/support/chatmessage/{chat_message.id}/change/"
    
    # تشخیص نوع درخواست (پیگیری چمدان یا چت عادی)
    metadata = getattr(chat_message, 'metadata', None) or {}
    request_type = metadata.get('request_type') if isinstance(metadata, dict) else None
    request_label = 'پیگیری چمدان' if request_type == 'luggage_tracking' else 'چت آنلاین'
    
    telegram_message = f"""🔔 پیام جدید ({request_label})

شما یک پیام جدید دریافت کردید

فرستنده: {sender_name}
پیام: {message_preview}

برای مشاهده و پاسخ به پیام به پنل ادمین مراجعه کنید:
{admin_url}"""
    
    try:
        url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
        payload = {
            'chat_id': str(telegram_chat_id),
            'text': telegram_message,
            'disable_web_page_preview': True,
        }
        proxies = None
        telegram_proxy = getattr(settings, 'TELEGRAM_PROXY', None) or ''
        if telegram_proxy:
            proxies = {'http': telegram_proxy, 'https': telegram_proxy}
        response = requests.post(url, json=payload, timeout=15, proxies=proxies)
        
        if response.status_code == 200:
            logger.info("Telegram notification sent successfully")
            return True
        else:
            logger.error(f"Failed to send Telegram notification. Status: {response.status_code}, Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending Telegram notification: {e}", exc_info=True)
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram notification: {e}", exc_info=True)
        return False


def send_chat_notification_whatsapp(chat_message):
    """
    Send WhatsApp notification to admin when a new chat message is received from user/guest
    
    Args:
        chat_message: ChatMessage instance
        
    Returns:
        bool: True if successful, False otherwise
    """
    # دریافت شماره تماس ادمین از تنظیمات
    admin_whatsapp_number = getattr(settings, 'ADMIN_WHATSAPP_NUMBER', None)
    
    if not admin_whatsapp_number:
        logger.warning("ADMIN_WHATSAPP_NUMBER not configured. Skipping WhatsApp notification.")
        return False
    
    # اگر پیام از پرسنل باشد، اعلان ارسال نمی‌کنیم
    if chat_message.is_staff:
        return False
    
    # آماده‌سازی پیام
    sender_name = chat_message.get_sender_name()
    message_preview = chat_message.message[:100] + '...' if len(chat_message.message) > 100 else chat_message.message
    
    whatsapp_message = f"""🔔 پیام جدید در چت آنلاین

فرستنده: {sender_name}
پیام: {message_preview}

برای مشاهده و پاسخ به پیام به پنل ادمین مراجعه کنید:
http://127.0.0.1:8000/admin/support/chatmessage/{chat_message.id}/change/"""
    
    return send_whatsapp_message(admin_whatsapp_number, whatsapp_message)

