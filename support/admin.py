"""
Admin configuration for support app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from .models import Ticket, TicketMessage, TicketAttachment, TicketCategory


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
