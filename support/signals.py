"""
Signals for support app
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Ticket, TicketMessage
from .constants import (
    TICKET_STATUS_IN_PROGRESS,
    TICKET_STATUS_WAITING_CUSTOMER,
    MESSAGE_TYPE_STAFF,
    MESSAGE_TYPE_CUSTOMER,
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
def sync_ticket_with_nira(sender, instance, created, **kwargs):
    """
    Sync ticket with Nira system when created or updated
    """
    # TODO: Implement Nira API integration
    # This will be called when Nira integration is ready
    pass

