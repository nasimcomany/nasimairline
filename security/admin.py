"""
Admin configuration for security app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import SecurityInfo, SecurityAlert


@admin.register(SecurityInfo)
class SecurityInfoAdmin(admin.ModelAdmin):
    """
    Admin configuration for SecurityInfo model
    """
    list_display = [
        'flight', 'security_level',
        'passenger_screening', 'baggage_screening',
        'created_at', 'updated_at'
    ]
    list_filter = [
        'security_level', 'passenger_screening',
        'baggage_screening', 'created_at'
    ]
    search_fields = [
        'flight__flight_number', 'special_instructions', 'notes'
    ]
    list_editable = [
        'security_level', 'passenger_screening', 'baggage_screening'
    ]
    list_per_page = 25
    ordering = ['-created_at']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('flight', 'security_level')
        }),
        (_('بررسی‌های امنیتی'), {
            'fields': (
                'passenger_screening', 'baggage_screening',
                'special_instructions'
            )
        }),
        (_('مسافران محدود شده'), {
            'fields': ('restricted_passengers',),
            'classes': ('collapse',)
        }),
        (_('یادداشت‌ها'), {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    autocomplete_fields = ['flight']


@admin.register(SecurityAlert)
class SecurityAlertAdmin(admin.ModelAdmin):
    """
    Admin configuration for SecurityAlert model
    """
    list_display = [
        'title', 'flight', 'threat_type',
        'security_level', 'status',
        'resolved_by', 'resolved_at', 'created_at'
    ]
    list_filter = [
        'threat_type', 'security_level', 'status',
        'created_at', 'resolved_at'
    ]
    search_fields = [
        'title', 'description', 'flight__flight_number',
        'resolution_notes'
    ]
    list_editable = ['status']
    list_per_page = 25
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': (
                'flight', 'threat_type', 'security_level', 'status'
            )
        }),
        (_('جزئیات هشدار'), {
            'fields': ('title', 'description')
        }),
        (_('حل هشدار'), {
            'fields': (
                'resolved_by', 'resolved_at', 'resolution_notes'
            ),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'created_at', 'updated_at', 'resolved_at'
    ]
    
    autocomplete_fields = ['flight', 'resolved_by']
    
    actions = ['resolve_alerts', 'activate_alerts']
    
    def resolve_alerts(self, request, queryset):
        """Resolve selected security alerts"""
        from django.utils import timezone
        updated = queryset.update(
            status='RESOLVED',
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(
            request,
            f'{updated} هشدار امنیتی حل شد.'
        )
    resolve_alerts.short_description = _('حل هشدارهای انتخاب شده')
    
    def activate_alerts(self, request, queryset):
        """Activate selected security alerts"""
        updated = queryset.update(status='ACTIVE', resolved_by=None, resolved_at=None)
        self.message_user(
            request,
            f'{updated} هشدار امنیتی فعال شد.'
        )
    activate_alerts.short_description = _('فعال کردن هشدارهای انتخاب شده')
