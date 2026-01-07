"""
Admin configuration for customer_service app
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CustomerTierSettings,
    ChatSession,
    ChatMessage,
)


@admin.register(CustomerTierSettings)
class CustomerTierSettingsAdmin(admin.ModelAdmin):
    """Admin for CustomerTierSettings"""
    
    list_display = [
        'uuid', 'tier', 'criteria_type', 'operator', 'value',
        'priority', 'is_active', 'created_at',
    ]
    list_filter = ['tier', 'criteria_type', 'is_active', 'created_at']
    search_fields = ['description']
    ordering = ['-priority', 'tier']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('uuid', 'tier', 'description')
        }),
        ('معیارهای تقسیم‌بندی', {
            'fields': ('criteria_type', 'operator', 'value', 'priority', 'is_active')
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related()


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    """Admin for ChatSession"""
    
    list_display = [
        'uuid', 'get_customer_info', 'customer_tier', 'status',
        'assigned_to', 'message_count', 'unread_count', 'created_at',
    ]
    list_filter = ['status', 'customer_tier', 'assigned_to', 'created_at']
    search_fields = ['session_id', 'guest_name', 'guest_email']
    ordering = ['-created_at']
    readonly_fields = ['uuid', 'session_id', 'created_at', 'updated_at', 'closed_at']
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('uuid', 'session_id', 'user', 'guest_name', 'guest_email')
        }),
        ('وضعیت', {
            'fields': ('status', 'customer_tier', 'assigned_to')
        }),
        ('یکپارچه‌سازی نیرا', {
            'fields': ('nira_session_id', 'nira_data'),
            'classes': ('collapse',)
        }),
        ('اطلاعات اضافی', {
            'fields': ('client_ip', 'metadata'),
            'classes': ('collapse',)
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at', 'closed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_customer_info(self, obj):
        """Display customer information"""
        if obj.user:
            return format_html(
                '<strong>{}</strong><br><small>{}</small>',
                obj.user.get_full_name() or obj.user.email,
                obj.user.email
            )
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.guest_name or 'مهمان',
            obj.guest_email or 'بدون ایمیل'
        )
    get_customer_info.short_description = 'مشتری'
    
    def message_count(self, obj):
        """Display message count"""
        return obj.messages.count()
    message_count.short_description = 'تعداد پیام‌ها'
    
    def unread_count(self, obj):
        """Display unread message count"""
        count = obj.messages.filter(
            message_type='STAFF',
            is_read=False
        ).count()
        if count > 0:
            return format_html('<span style="color: red; font-weight: bold;">{}</span>', count)
        return count
    unread_count.short_description = 'پیام‌های خوانده نشده'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related('user', 'assigned_to').prefetch_related('messages')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin for ChatMessage"""
    
    list_display = [
        'uuid', 'get_session_info', 'get_sender_info',
        'message_type', 'is_read', 'created_at',
    ]
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['message', 'session__session_id']
    ordering = ['-created_at']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('uuid', 'session', 'user', 'message')
        }),
        ('نوع و وضعیت', {
            'fields': ('message_type', 'is_read')
        }),
        ('یکپارچه‌سازی نیرا', {
            'fields': ('nira_message_id',),
            'classes': ('collapse',)
        }),
        ('اطلاعات اضافی', {
            'fields': ('message_ip', 'metadata'),
            'classes': ('collapse',)
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_session_info(self, obj):
        """Display session information"""
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.session.session_id[:20] + '...',
            obj.session.get_customer_name()
        )
    get_session_info.short_description = 'نشست'
    
    def get_sender_info(self, obj):
        """Display sender information"""
        if obj.user:
            return format_html(
                '<strong>{}</strong>',
                obj.user.get_full_name() or obj.user.email
            )
        return obj.session.get_customer_name()
    get_sender_info.short_description = 'ارسال‌کننده'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related('session', 'user')
