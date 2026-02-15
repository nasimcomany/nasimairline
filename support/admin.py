"""
Admin configuration for Support app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.db import models
from .models import (
    TicketCategory, Ticket, TicketMessage, TicketAttachment, ChatMessage
)


@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    """
    Admin for TicketCategory
    """
    list_display = ['uuid', 'name', 'slug', 'is_active', 'order', 'ticket_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    list_editable = ['is_active', 'order']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('uuid', 'name', 'slug', 'description')
        }),
        (_('تنظیمات'), {
            'fields': ('is_active', 'order')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def ticket_count(self, obj):
        """Count tickets in this category"""
        return obj.tickets.count()
    ticket_count.short_description = _('تعداد تیکت‌ها')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    """
    Admin for Ticket model
    """
    list_display = [
        'reference', 'title', 'user', 'category', 'status', 'priority',
        'assigned_to', 'created_at', 'is_overdue_display', 'message_count'
    ]
    list_filter = ['status', 'priority', 'category', 'created_at', 'assigned_to']
    search_fields = [
        'reference', 'title', 'description',
        'user__email', 'user__first_name', 'user__last_name',
        'user__phone_number', 'nira_ticket_id'
    ]
    list_editable = ['status', 'priority', 'assigned_to']
    readonly_fields = [
        'uuid', 'reference', 'ticket_ip', 'created_at', 'updated_at',
        'first_response_at', 'resolved_at', 'closed_at',
        'is_overdue_display', 'message_count', 'user_info_display',
        'nira_ticket_id', 'nira_data_display'
    ]
    autocomplete_fields = ['user', 'assigned_to', 'related_booking', 'related_flight']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': (
                'uuid', 'reference', 'user', 'title', 'description',
                'category', 'ticket_category', 'priority', 'status'
            )
        }),
        (_('ارجاع و پیگیری'), {
            'fields': ('assigned_to', 'related_booking', 'related_flight', 'nira_ticket_id', 'nira_data_display')
        }),
        (_('اطلاعات فنی'), {
            'fields': ('ticket_ip', 'metadata'),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at', 'first_response_at', 'resolved_at', 'closed_at')
        }),
        (_('اطلاعات کاربر'), {
            'fields': ('user_info_display',)
        }),
    )
    
    def user_info_display(self, obj):
        """Display user information"""
        if obj.user:
            return f"{obj.user.get_full_name()} - {obj.user.email} - {obj.user.phone_number}"
        return '-'
    user_info_display.short_description = _('اطلاعات کاربر')
    
    def is_overdue_display(self, obj):
        """Display overdue status"""
        if obj.is_overdue():
            return _('بله')
        return _('خیر')
    is_overdue_display.short_description = _('تأخیر')
    is_overdue_display.boolean = True
    
    def message_count(self, obj):
        """Count messages in ticket"""
        return obj.messages.count()
    message_count.short_description = _('تعداد پیام‌ها')
    
    def nira_data_display(self, obj):
        """Display Nira data"""
        if obj.nira_data:
            import json
            try:
                return json.dumps(obj.nira_data, indent=2, ensure_ascii=False)
            except:
                return str(obj.nira_data)
        return '-'
    nira_data_display.short_description = _('اطلاعات نیرا')


class TicketAttachmentInline(admin.TabularInline):
    """
    Inline admin for TicketAttachment
    """
    model = TicketAttachment
    extra = 0
    fields = ['file', 'file_name', 'file_type', 'file_size', 'description']
    readonly_fields = ['file_name', 'file_size', 'file_type']


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    """
    Admin for TicketMessage
    """
    list_display = [
        'uuid', 'ticket', 'user', 'message_preview', 'message_type',
        'is_read', 'is_internal', 'created_at'
    ]
    list_filter = ['message_type', 'is_read', 'is_internal', 'created_at']
    search_fields = [
        'ticket__reference', 'ticket__title', 'message',
        'user__email', 'user__first_name', 'user__last_name'
    ]
    list_editable = ['is_read', 'is_internal']
    readonly_fields = ['uuid', 'message_ip', 'created_at', 'updated_at']
    inlines = [TicketAttachmentInline]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('uuid', 'ticket', 'user', 'message', 'message_type')
        }),
        (_('تنظیمات'), {
            'fields': ('is_read', 'is_internal', 'message_ip')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def message_preview(self, obj):
        """Display message preview"""
        if len(obj.message) > 100:
            return obj.message[:100] + '...'
        return obj.message
    message_preview.short_description = _('پیش‌نمایش پیام')


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    """
    Admin for TicketAttachment
    """
    list_display = [
        'uuid', 'ticket', 'file_name', 'file_type', 'file_size', 'created_at'
    ]
    list_filter = ['file_type', 'created_at']
    search_fields = [
        'ticket__reference', 'file_name', 'description'
    ]
    readonly_fields = [
        'uuid', 'file_name', 'file_size', 'file_type', 
        'mime_type', 'created_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('uuid', 'ticket', 'message', 'file')
        }),
        (_('اطلاعات فایل'), {
            'fields': (
                'file_name', 'file_type', 'file_size', 'mime_type', 'description'
            )
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at',)
        }),
    )


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """
    Admin for ChatMessage - Simple and secure
    """
    list_display = ['uuid', 'sender_display', 'request_type_display', 'message_preview', 'is_staff', 'is_read', 'session_id', 'created_at']
    list_filter = ['is_staff', 'is_read', 'created_at']
    search_fields = ['message', 'guest_name', 'guest_email', 'session_id']
    list_editable = ['is_read']
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'message_ip', 'is_staff']
    change_form_template = 'admin/support/chatmessage/change_form.html'
    
    fieldsets = (
        (_('اطلاعات پیام'), {
            'fields': ('uuid', 'user', 'guest_name', 'guest_email', 'message', 'is_staff', 'is_read', 'session_id')
        }),
        (_('اطلاعات فنی'), {
            'fields': ('message_ip', 'metadata', 'expires_at'),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def sender_display(self, obj):
        """Display sender information"""
        if obj.user:
            return f"{obj.user.get_full_name() or obj.user.email} (کاربر)"
        return f"{obj.guest_name or 'مهمان'} (مهمان)"
    sender_display.short_description = _('فرستنده')
    
    def request_type_display(self, obj):
        """Display request type (پیگیری چمدان or normal chat)"""
        metadata = getattr(obj, 'metadata', None) or {}
        if isinstance(metadata, dict) and metadata.get('request_type') == 'luggage_tracking':
            return _('پیگیری چمدان')
        return '-'
    request_type_display.short_description = _('نوع درخواست')
    
    def message_preview(self, obj):
        """Display message preview"""
        if len(obj.message) > 50:
            return obj.message[:50] + '...'
        return obj.message
    message_preview.short_description = _('پیش‌نمایش پیام')
    
    
    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        """Override to add chat history and reply form"""
        extra_context = extra_context or {}
        
        if object_id:
            from .models import ChatMessage
            from django.utils import timezone
            
            try:
                chat_message = ChatMessage.objects.get(pk=object_id)
                
                # دریافت تمام پیام‌های این session (فقط پیام‌های منقضی نشده)
                if chat_message.session_id:
                    messages = ChatMessage.objects.filter(
                        session_id=chat_message.session_id,
                        expires_at__isnull=True
                    ) | ChatMessage.objects.filter(
                        session_id=chat_message.session_id,
                        expires_at__gt=timezone.now()
                    )
                    messages = messages.order_by('created_at')
                elif chat_message.user:
                    # اگر session_id نداشته باشد، فقط پیام‌های این کاربر
                    messages = ChatMessage.objects.filter(
                        user=chat_message.user,
                        expires_at__isnull=True
                    ) | ChatMessage.objects.filter(
                        user=chat_message.user,
                        expires_at__gt=timezone.now()
                    )
                    messages = messages.order_by('created_at')
                else:
                    messages = ChatMessage.objects.filter(pk=object_id)
                
                extra_context['chat_messages'] = messages
                extra_context['current_message'] = chat_message
            except ChatMessage.DoesNotExist:
                pass
        
        return super().changeform_view(request, object_id, form_url, extra_context)
    
    def response_change(self, request, obj):
        """Handle reply after saving"""
        if '_reply' in request.POST:
            reply_text = request.POST.get('reply_text', '').strip()
            if reply_text:
                from django.utils import timezone
                from datetime import timedelta
                
                # پیدا کردن session_id
                session_id = obj.session_id
                if not session_id and obj.user:
                    # ایجاد session_id برای کاربر
                    import uuid
                    session_id = f"user_{obj.user.id}_{uuid.uuid4().hex[:8]}"
                
                if session_id:
                    # تعیین expiry
                    if obj.user:
                        expires_at = timezone.now() + timedelta(hours=72)
                    else:
                        expires_at = timezone.now() + timedelta(hours=24)
                    
                    # ایجاد پیام پاسخ
                    ChatMessage.objects.create(
                        message=reply_text,
                        is_staff=True,
                        is_read=True,
                        user=None,
                        session_id=session_id,
                        message_ip=self._get_client_ip(request),
                        expires_at=expires_at,
                    )
                    
                    from django.contrib import messages
                    messages.success(request, _('پاسخ شما با موفقیت ارسال شد.'))
        
        return super().response_change(request, obj)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
