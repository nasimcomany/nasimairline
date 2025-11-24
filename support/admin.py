"""
Admin configuration for support app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.db import models
from .models import Ticket, TicketMessage, TicketAttachment, TicketCategory, ChatMessage


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
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def ticket_count(self, obj):
        """Get ticket count for this category"""
        return obj.tickets.count()
    ticket_count.short_description = _('تعداد تیکت‌ها')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    """
    Admin for Ticket model
    """
    list_display = [
        'reference', 'title', 'user_link', 'category', 'priority', 
        'status', 'assigned_to', 'source', 'is_overdue_display',
        'message_count', 'created_at', 'sla_deadline'
    ]
    list_filter = [
        'status', 'priority', 'category', 'source', 
        'assigned_to', 'created_at', 'sla_deadline'
    ]
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
        (_('اختصاص و منبع'), {
            'fields': ('assigned_to', 'source', 'ticket_ip')
        }),
        (_('ارتباطات'), {
            'fields': ('related_booking', 'related_flight'),
            'classes': ('collapse',)
        }),
        (_('اطلاعات نیرا'), {
            'fields': ('nira_ticket_id', 'nira_data_display'),
            'classes': ('collapse',)
        }),
        (_('SLA و زمان‌ها'), {
            'fields': (
                'sla_deadline', 'first_response_at', 
                'resolved_at', 'closed_at', 'is_overdue_display'
            )
        }),
        (_('اطلاعات کاربر'), {
            'fields': ('user_info_display',),
            'classes': ('collapse',)
        }),
        (_('آمار'), {
            'fields': ('message_count',),
            'classes': ('collapse',)
        }),
        (_('اطلاعات اضافی'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_link(self, obj):
        """Display user as link"""
        url = reverse('admin:accounts_user_change', args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name())
    user_link.short_description = _('کاربر')
    
    def is_overdue_display(self, obj):
        """Display overdue status"""
        if obj.is_overdue():
            return format_html(
                '<span style="color: red; font-weight: bold;">✓ بله</span>'
            )
        return format_html('<span style="color: green;">✗ خیر</span>')
    is_overdue_display.short_description = _('تأخیر')
    
    def message_count(self, obj):
        """Get message count"""
        return obj.get_message_count()
    message_count.short_description = _('تعداد پیام‌ها')
    
    def user_info_display(self, obj):
        """Display user information"""
        info = obj.get_user_info()
        return format_html(
            '<strong>نام:</strong> {}<br>'
            '<strong>ایمیل:</strong> {}<br>'
            '<strong>تلفن:</strong> {}<br>'
            '<strong>سطح عضویت:</strong> {}<br>'
            '<strong>امتیاز وفاداری:</strong> {}',
            info['full_name'],
            info['email'],
            info['phone'] or '-',
            info['membership_level'],
            info['loyalty_points']
        )
    user_info_display.short_description = _('اطلاعات کاربر')
    
    def nira_data_display(self, obj):
        """Display Nira data"""
        if obj.nira_data:
            import json
            return format_html(
                '<pre>{}</pre>',
                json.dumps(obj.nira_data, indent=2, ensure_ascii=False)
            )
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
        'uuid', 'ticket_link', 'user_link', 'message_type', 
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
        (_('اطلاعات اضافی'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def ticket_link(self, obj):
        """Display ticket as link"""
        url = reverse('admin:support_ticket_change', args=[obj.ticket.pk])
        return format_html('<a href="{}">{}</a>', url, obj.ticket.reference)
    ticket_link.short_description = _('تیکت')
    
    def user_link(self, obj):
        """Display user as link"""
        url = reverse('admin:accounts_user_change', args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name())
    user_link.short_description = _('کاربر')


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    """
    Admin for TicketAttachment
    """
    list_display = [
        'uuid', 'ticket_link', 'file_name', 'file_type', 
        'file_size_display', 'created_at'
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
                'file_name', 'file_size', 'file_type', 
                'mime_type', 'description'
            )
        }),
        (_('تاریخ'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def ticket_link(self, obj):
        """Display ticket as link"""
        url = reverse('admin:support_ticket_change', args=[obj.ticket.pk])
        return format_html('<a href="{}">{}</a>', url, obj.ticket.reference)
    ticket_link.short_description = _('تیکت')
    
    def file_size_display(self, obj):
        """Display file size in human readable format"""
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    file_size_display.short_description = _('حجم فایل')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """
    Admin for ChatMessage with reply functionality
    """
    list_display = ['uuid', 'sender_display', 'message_preview', 'is_staff', 'is_read', 'session_id', 'created_at']
    list_filter = ['is_staff', 'is_read', 'created_at']
    search_fields = ['message', 'guest_name', 'guest_email', 'session_id']
    list_editable = ['is_read']
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'message_ip', 'chat_history', 'is_staff']
    change_form_template = 'admin/support/chatmessage/change_form.html'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('uuid', 'user', 'guest_name', 'guest_email', 'session_id')
        }),
        (_('پیام'), {
            'fields': ('message', 'is_read')
        }),
        (_('اطلاعات پیام'), {
            'fields': ('is_staff',),
            'description': _('این فیلد فقط برای نمایش است و قابل ویرایش نیست. برای ارسال پاسخ از فرم زیر استفاده کنید.')
        }),
        (_('تاریخچه چت'), {
            'fields': ('chat_history',),
            'description': _('تمام پیام‌های این چت در زیر نمایش داده می‌شود. می‌توانید از فرم زیر پاسخ دهید.')
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
    
    def message_preview(self, obj):
        """Display message preview"""
        if len(obj.message) > 50:
            return obj.message[:50] + '...'
        return obj.message
    message_preview.short_description = _('پیش‌نمایش پیام')
    
    def chat_history(self, obj):
        """Display chat history for this session"""
        if not obj.pk:
            return _('ابتدا پیام را ذخیره کنید')
        
        # دریافت تمام پیام‌های این session
        from .models import ChatMessage
        
        if obj.user:
            # اگر کاربر لاگین باشد
            messages = ChatMessage.objects.filter(
                models.Q(user=obj.user) | models.Q(is_staff=True, session_id=obj.session_id)
            ).order_by('created_at')
        else:
            # اگر مهمان باشد
            messages = ChatMessage.objects.filter(
                session_id=obj.session_id
            ).order_by('created_at')
        
        # نمایش تاریخچه در template
        return None  # این فیلد فقط برای نمایش در template استفاده می‌شود
    
    chat_history.short_description = _('تاریخچه چت')
    
    def get_urls(self):
        """Add custom URL for reply action"""
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<path:object_id>/reply/',
                self.admin_site.admin_view(self.reply_view),
                name='support_chatmessage_reply',
            ),
        ]
        return custom_urls + urls
    
    def reply_view(self, request, object_id):
        """Handle reply to chat message"""
        from django.shortcuts import get_object_or_404, redirect
        from django.contrib import messages
        from .models import ChatMessage
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info(f"Reply view called for object_id={object_id}, method={request.method}")
        
        chat_message = get_object_or_404(ChatMessage, pk=object_id)
        logger.info(f"Chat message found: session_id={chat_message.session_id}, user={chat_message.user}")
        
        if request.method == 'POST':
            logger.info("POST request received")
            reply_text = request.POST.get('reply_message', '').strip()
            is_staff_reply = request.POST.get('is_staff_reply') == 'on'  # checkbox value
            
            if not reply_text:
                messages.error(request, _('لطفاً متن پاسخ را وارد کنید.'))
                from django.http import HttpResponseRedirect
                from django.urls import reverse
                return HttpResponseRedirect(
                    reverse('admin:support_chatmessage_change', args=[object_id])
                )
            
            if not is_staff_reply:
                messages.error(request, _('لطفاً تیک "پیام از پرسنل" را فعال کنید.'))
                from django.http import HttpResponseRedirect
                from django.urls import reverse
                return HttpResponseRedirect(
                    reverse('admin:support_chatmessage_change', args=[object_id])
                )
            
            # ایجاد پیام پاسخ
            # پیدا کردن session_id صحیح برای پاسخ
            reply_session_id = None
            
            # اول: استفاده از session_id پیام اصلی (اگر وجود داشته باشد)
            if chat_message.session_id:
                reply_session_id = chat_message.session_id
            else:
                # اگر session_id وجود نداشته باشد، از پیام‌های دیگر این session استفاده می‌کنیم
                if chat_message.user:
                    # برای کاربران لاگین: پیدا کردن session_id از پیام‌های قبلی این کاربر
                    user_messages = ChatMessage.objects.filter(
                        user=chat_message.user
                    ).exclude(session_id__isnull=True).exclude(session_id='').order_by('-created_at')
                    
                    if user_messages.exists():
                        # استفاده از session_id پیام‌های قبلی
                        reply_session_id = user_messages.first().session_id
                    else:
                        # اگر هیچ session_id وجود نداشته باشد، یک session_id بر اساس user_id ایجاد می‌کنیم
                        import uuid
                        reply_session_id = f"user_{chat_message.user.id}_{uuid.uuid4().hex[:8]}"
                else:
                    # برای مهمانان: اگر session_id وجود نداشته باشد، نمی‌توانیم پاسخ دهیم
                    # (اما این حالت نباید اتفاق بیفتد چون مهمانان همیشه session_id دارند)
                    messages.error(request, _('خطا: session_id برای این پیام یافت نشد.'))
                    from django.http import HttpResponseRedirect
                    from django.urls import reverse
                    return HttpResponseRedirect(
                        reverse('admin:support_chatmessage_change', args=[object_id])
                    )
            
            # اطمینان از اینکه session_id تنظیم شده است
            if not reply_session_id:
                messages.error(request, _('خطا: نتوانستیم session_id را تعیین کنیم.'))
                from django.http import HttpResponseRedirect
                from django.urls import reverse
                return HttpResponseRedirect(
                    reverse('admin:support_chatmessage_change', args=[object_id])
                )
            
            # تعیین expiry time برای پاسخ ادمین (مطابق با پیام کاربر)
            from django.utils import timezone
            from datetime import timedelta
            
            # اگر پیام کاربر expiry دارد، از همان استفاده می‌کنیم
            # در غیر این صورت، 72 ساعت برای کاربران عضو و 24 ساعت برای مهمانان
            if chat_message.user:
                expires_at = timezone.now() + timedelta(hours=72)
            else:
                expires_at = timezone.now() + timedelta(hours=24)
            
            try:
                logger.info(f"Creating reply with session_id={reply_session_id}, expires_at={expires_at}")
                reply = ChatMessage.objects.create(
                    message=reply_text,
                    is_staff=True,  # حتماً باید True باشد
                    is_read=True,
                    user=None,  # پیام از پرسنل است
                    session_id=reply_session_id,
                    message_ip=self._get_client_ip(request),
                    expires_at=expires_at,
                )
                
                logger.info(f"Admin reply created successfully: uuid={reply.uuid}, session_id={reply.session_id}, is_staff={reply.is_staff}")
                
                # بررسی اینکه پیام واقعاً ایجاد شد
                created_reply = ChatMessage.objects.get(uuid=reply.uuid)
                logger.info(f"Verified reply exists: uuid={created_reply.uuid}, message={created_reply.message[:50]}")
                
                messages.success(request, _('پاسخ شما با موفقیت ارسال شد.'))
            except Exception as e:
                logger.error(f"Error creating admin reply: {e}", exc_info=True)
                messages.error(request, _('خطا در ارسال پاسخ: {}').format(str(e)))
            
            # استفاده از HttpResponseRedirect برای اطمینان از redirect
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(
                reverse('admin:support_chatmessage_change', args=[object_id])
            )
        
        # اگر GET request باشد، به صفحه تغییر redirect می‌کنیم
        from django.http import HttpResponseRedirect
        from django.urls import reverse
        return HttpResponseRedirect(
            reverse('admin:support_chatmessage_change', args=[object_id])
        )
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        """Override to add chat history to context"""
        extra_context = extra_context or {}
        
        if object_id:
            from .models import ChatMessage
            
            try:
                chat_message = ChatMessage.objects.get(pk=object_id)
                
                # دریافت تمام پیام‌های این session (فقط پیام‌های منقضی نشده)
                from django.utils import timezone
                
                if chat_message.user:
                    # اگر کاربر لاگین باشد: پیام‌های کاربر + پیام‌های پرسنل
                    # اگر session_id وجود داشته باشد، از آن استفاده می‌کنیم
                    if chat_message.session_id:
                        messages = ChatMessage.objects.filter(
                            (models.Q(user=chat_message.user) | 
                             (models.Q(is_staff=True) & models.Q(session_id=chat_message.session_id))) &
                            (models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=timezone.now()))
                        ).order_by('created_at')
                    else:
                        # اگر session_id نداشته باشد، فقط پیام‌های کاربر را نشان می‌دهیم
                        messages = ChatMessage.objects.filter(
                            user=chat_message.user,
                            expires_at__isnull=True
                        ) | ChatMessage.objects.filter(
                            user=chat_message.user,
                            expires_at__gt=timezone.now()
                        )
                        messages = messages.order_by('created_at')
                else:
                    # اگر مهمان باشد: بر اساس session_id
                    if chat_message.session_id:
                        messages = ChatMessage.objects.filter(
                            session_id=chat_message.session_id,
                            expires_at__isnull=True
                        ) | ChatMessage.objects.filter(
                            session_id=chat_message.session_id,
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
