"""
Signals for support app
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Ticket, TicketMessage
from .constants import (
    TICKET_STATUS_IN_PROGRESS,
    TICKET_STATUS_WAITING_CUSTOMER,
    MESSAGE_TYPE_STAFF,
    MESSAGE_TYPE_CUSTOMER,
    TICKET_CATEGORY_SECURITY,  # حراست - فقط شماره تماس
)


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


@receiver(post_save, sender=Ticket)
def send_ticket_notification_email(sender, instance, created, **kwargs):
    """
    Send email notification when a new ticket is created
    Email goes to specific address based on ticket category
    """
    if created:
        # اگر دسته‌بندی حراست باشد، ایمیل ارسال نمی‌کنیم (فقط شماره تماس)
        if instance.category == TICKET_CATEGORY_SECURITY:
            return
        
        # دریافت آدرس ایمیل بر اساس دسته‌بندی
        email_mapping = getattr(settings, 'SUPPORT_EMAIL_MAPPING', {})
        recipient_email = email_mapping.get(instance.category, email_mapping.get('DEFAULT', None))
        
        if not recipient_email:
            # اگر ایمیل پیدا نشد، ایمیل ارسال نمی‌کنیم
            return
        
        # آماده‌سازی محتوای ایمیل
        subject = f'تیکت جدید: {instance.reference} - {instance.title}'
        
        # محتوای ایمیل به فارسی
        message = f"""
        تیکت جدیدی در سیستم پشتیبانی ایجاد شده است.
        
        اطلاعات تیکت:
        - شماره تیکت: {instance.reference}
        - عنوان: {instance.title}
        - کاربر: {instance.user.get_full_name()} ({instance.user.email})
        - شماره تماس کاربر: {instance.user.phone_number or 'ثبت نشده'}
        - دسته‌بندی: {instance.get_category_display()}
        - اولویت: {instance.get_priority_display()}
        - منبع: {instance.get_source_display()}
        
        توضیحات:
        {instance.description}
        
        برای مشاهده و پاسخ به تیکت به پنل ادمین مراجعه کنید:
        http://127.0.0.1:8000/admin/support/ticket/{instance.id}/change/
        """
        
        # ارسال ایمیل
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
        except Exception as e:
            # در صورت خطا، فقط لاگ می‌کنیم و تیکت را ایجاد می‌کنیم
            print(f"Error sending ticket notification email: {e}")


@receiver(post_save, sender=Ticket)
def sync_ticket_with_nira(sender, instance, created, **kwargs):
    """
    Sync ticket with Nira system when created or updated
    """
    # TODO: Implement Nira API integration
    # This will be called when Nira integration is ready
    pass

