"""
Admin configuration for notifications app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin configuration for Notification model
    """
    list_display = [
        'title', 'user', 'notification_type',
        'channel', 'status', 'priority',
        'is_read', 'created_at', 'sent_at'
    ]
    list_filter = [
        'notification_type', 'channel', 'status',
        'priority', 'is_read', 'created_at', 'sent_at'
    ]
    search_fields = [
        'title', 'message', 'user__email',
        'user__first_name', 'user__last_name'
    ]
    list_editable = ['status', 'is_read']
    list_per_page = 25
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': (
                'user', 'notification_type', 'channel',
                'status', 'priority'
            )
        }),
        (_('محتوای اعلان'), {
            'fields': ('title', 'message')
        }),
        (_('وضعیت خواندن'), {
            'fields': ('is_read', 'read_at')
        }),
        (_('اطلاعات اضافی'), {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'sent_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'sent_at', 'read_at']
    
    autocomplete_fields = ['user']
    
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_sent']
    
    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read"""
        from django.utils import timezone
        updated = queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(
            request,
            f'{updated} اعلان به عنوان خوانده شده علامت‌گذاری شد.'
        )
    mark_as_read.short_description = _('علامت‌گذاری به عنوان خوانده شده')
    
    def mark_as_unread(self, request, queryset):
        """Mark selected notifications as unread"""
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(
            request,
            f'{updated} اعلان به عنوان خوانده نشده علامت‌گذاری شد.'
        )
    mark_as_unread.short_description = _('علامت‌گذاری به عنوان خوانده نشده')
    
    def mark_as_sent(self, request, queryset):
        """Mark selected notifications as sent"""
        from django.utils import timezone
        updated = queryset.update(status='SENT', sent_at=timezone.now())
        self.message_user(
            request,
            f'{updated} اعلان به عنوان ارسال شده علامت‌گذاری شد.'
        )
    mark_as_sent.short_description = _('علامت‌گذاری به عنوان ارسال شده')
