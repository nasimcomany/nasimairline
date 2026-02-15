"""
Signals for support app
"""
import threading
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Ticket, TicketMessage, ChatMessage
from .constants import (
    TICKET_STATUS_IN_PROGRESS,
    TICKET_STATUS_WAITING_CUSTOMER,
    MESSAGE_TYPE_STAFF,
    MESSAGE_TYPE_CUSTOMER,
    TICKET_CATEGORY_SECURITY,  # حراست - فقط شماره تماس
)
from .utils import send_chat_notification_whatsapp, send_chat_notification_telegram


@receiver(pre_save, sender=Ticket)
def set_ticket_first_response(sender, instance, **kwargs):
    """
    Set first_response_at when staff responds for the first time
    """
    if instance.pk:
        try:
            old_instance = Ticket.objects.get(pk=instance.pk)
            # If status changed to IN_PROGRESS and first_response_at is not set
            if (old_instance.status != TICKET_STATUS_IN_PROGRESS and 
                instance.status == TICKET_STATUS_IN_PROGRESS and 
                not instance.first_response_at):
                instance.first_response_at = timezone.now()
        except Ticket.DoesNotExist:
            pass


@receiver(post_save, sender=TicketMessage)
def update_ticket_status_on_message(sender, instance, created, **kwargs):
    """
    Update ticket status based on message type
    """
    if created:
        ticket = instance.ticket
        
        # If customer sends a message, set status to WAITING_CUSTOMER
        if instance.message_type == MESSAGE_TYPE_CUSTOMER:
            if ticket.status != TICKET_STATUS_WAITING_CUSTOMER:
                ticket.status = TICKET_STATUS_WAITING_CUSTOMER
                ticket.save(update_fields=['status'])
        
        # If staff sends a message, set status to IN_PROGRESS
        elif instance.message_type == MESSAGE_TYPE_STAFF:
            if ticket.status == TICKET_STATUS_WAITING_CUSTOMER:
                ticket.status = TICKET_STATUS_IN_PROGRESS
                ticket.save(update_fields=['status'])


def _send_ticket_email_async(ticket_id, category, reference, title, user_full_name, user_email, user_phone, category_display, priority_display, source_display, description, admin_url):
    """
    Helper function to send email asynchronously
    """
    try:
        # دریافت آدرس ایمیل بر اساس دسته‌بندی
        email_mapping = getattr(settings, 'SUPPORT_EMAIL_MAPPING', {})
        recipient_email = email_mapping.get(category, email_mapping.get('DEFAULT', None))
        
        # Debug: چاپ اطلاعات برای بررسی (موقت - می‌توان بعداً حذف کرد)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Ticket email debug - Category: '{category}', Mapping: {email_mapping}, Recipient: {recipient_email}")
        
        # بررسی دقیق‌تر: اگر ایمیل پیدا نشد، از مقدار پیش‌فرض استفاده می‌کنیم
        if not recipient_email:
            # بررسی مجدد با strip برای حذف فاصله‌های اضافی
            recipient_email = email_mapping.get(category.strip() if category else '', None)
            if not recipient_email:
                # اگر باز هم پیدا نشد، لاگ می‌کنیم
                logger.warning(f"No email found for ticket category '{category}'. Available categories: {list(email_mapping.keys())}")
                return
        
        # آماده‌سازی محتوای ایمیل
        subject = f'تیکت جدید: {reference} - {title}'
        
        # محتوای ایمیل به فارسی
        message = f"""
تیکت جدیدی در سیستم پشتیبانی ایجاد شده است.

اطلاعات تیکت:
- شماره تیکت: {reference}
- عنوان: {title}
- کاربر: {user_full_name} ({user_email})
- شماره تماس کاربر: {user_phone or 'ثبت نشده'}
- دسته‌بندی: {category_display}
- اولویت: {priority_display}
- منبع: {source_display}

توضیحات:
{description}

برای مشاهده و پاسخ به تیکت به پنل ادمین مراجعه کنید:
{admin_url}
"""
        
        # ارسال ایمیل
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
    except Exception as e:
        # در صورت خطا، فقط لاگ می‌کنیم (در production می‌توان از logging استفاده کرد)
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send ticket notification email: {e}", exc_info=True)


@receiver(post_save, sender=Ticket)
def send_ticket_notification_email(sender, instance, created, **kwargs):
    """
    Send email notification when a new ticket is created
    Email goes to specific address based on ticket category
    Uses threading for async email sending to improve response time
    """
    if created:
        # اگر دسته‌بندی حراست باشد، ایمیل ارسال نمی‌کنیم (فقط شماره تماس)
        if instance.category == TICKET_CATEGORY_SECURITY:
            return
        
        # دریافت اطلاعات کاربر
        user_full_name = instance.user.get_full_name() if instance.user.get_full_name() else instance.user.email
        
        # آماده‌سازی URL پنل ادمین
        admin_url = f"http://127.0.0.1:8000/admin/support/ticket/{instance.id}/change/"
        
        # ارسال ایمیل به صورت async برای بهبود سرعت
        email_thread = threading.Thread(
            target=_send_ticket_email_async,
            args=(
                instance.id,
                instance.category,
                instance.reference,
                instance.title,
                user_full_name,
                instance.user.email,
                instance.user.phone_number,
                instance.get_category_display(),
                instance.get_priority_display(),
                instance.get_source_display(),
                instance.description,
                admin_url,
            ),
            daemon=True  # Thread به صورت daemon اجرا می‌شود
        )
        email_thread.start()


@receiver(post_save, sender=Ticket)
def sync_ticket_with_nira(sender, instance, created, **kwargs):
    """
    Sync ticket with Nira system when created or updated
    """
    # TODO: Implement Nira API integration
    # This will be called when Nira integration is ready
    pass


@receiver(post_save, sender=ChatMessage)
def send_whatsapp_notification_on_chat_message(sender, instance, created, **kwargs):
    """
    Send WhatsApp and Telegram notifications to admin when a new chat message is received from user/guest
    Uses threading for async notification to improve response time
    """
    if created and not instance.is_staff:
        # ارسال واتساپ به صورت async برای بهبود سرعت
        whatsapp_thread = threading.Thread(
            target=send_chat_notification_whatsapp,
            args=(instance,),
            daemon=True
        )
        whatsapp_thread.start()
        
        # ارسال تلگرام به صورت async
        telegram_thread = threading.Thread(
            target=send_chat_notification_telegram,
            args=(instance,),
            daemon=True
        )
        telegram_thread.start()


def cleanup_expired_chat_messages():
    """
    Cleanup expired chat messages
    This function should be called periodically (e.g., via cron job or Celery task)
    """
    from django.utils import timezone
    from .models import ChatMessage
    
    # حذف پیام‌های منقضی شده
    expired_count = ChatMessage.objects.filter(
        expires_at__isnull=False,
        expires_at__lt=timezone.now()
    ).delete()[0]
    
    if expired_count > 0:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Cleaned up {expired_count} expired chat messages")
    
    return expired_count

