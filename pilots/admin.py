"""
Admin configuration for pilots app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Pilot, PilotRequest


@admin.register(Pilot)
class PilotAdmin(admin.ModelAdmin):
    """
    Admin configuration for Pilot model
    """
    list_display = [
        'user', 'license_number', 'license_type',
        'license_expiry', 'total_flight_hours',
        'status', 'created_at'
    ]
    list_filter = [
        'status', 'license_type', 'license_expiry',
        'created_at'
    ]
    search_fields = [
        'license_number', 'user__email', 'user__first_name',
        'user__last_name'
    ]
    list_editable = ['status']
    list_per_page = 25
    ordering = ['user__last_name', 'user__first_name']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('user',)
        }),
        (_('اطلاعات مجوز'), {
            'fields': (
                'license_number', 'license_type', 'license_expiry'
            )
        }),
        (_('اطلاعات پرواز'), {
            'fields': ('total_flight_hours',)
        }),
        (_('انواع هواپیماهای مجاز'), {
            'fields': ('aircraft_types_certified',),
            'classes': ('collapse',)
        }),
        (_('وضعیت'), {
            'fields': ('status',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    autocomplete_fields = ['user']


@admin.register(PilotRequest)
class PilotRequestAdmin(admin.ModelAdmin):
    """
    Admin configuration for PilotRequest model
    """
    list_display = [
        'pilot', 'request_type', 'title',
        'status', 'requested_date', 'created_at',
        'responded_at', 'responded_by'
    ]
    list_filter = [
        'request_type', 'status', 'created_at',
        'responded_at', 'requested_date'
    ]
    search_fields = [
        'title', 'description', 'pilot__user__email',
        'pilot__user__first_name', 'pilot__user__last_name',
        'flight__flight_number'
    ]
    list_editable = ['status']
    list_per_page = 25
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('pilot', 'request_type', 'status')
        }),
        (_('جزئیات درخواست'), {
            'fields': ('title', 'description', 'requested_date', 'flight')
        }),
        (_('پاسخ'), {
            'fields': (
                'response', 'responded_by', 'responded_at'
            ),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'created_at', 'updated_at', 'responded_at'
    ]
    
    autocomplete_fields = ['pilot', 'flight', 'responded_by']
    
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        """Approve selected pilot requests"""
        from django.utils import timezone
        updated = queryset.update(
            status='APPROVED',
            responded_by=request.user,
            responded_at=timezone.now()
        )
        self.message_user(
            request,
            f'{updated} درخواست تأیید شد.'
        )
    approve_requests.short_description = _('تأیید درخواست‌های انتخاب شده')
    
    def reject_requests(self, request, queryset):
        """Reject selected pilot requests"""
        from django.utils import timezone
        updated = queryset.update(
            status='REJECTED',
            responded_by=request.user,
            responded_at=timezone.now()
        )
        self.message_user(
            request,
            f'{updated} درخواست رد شد.'
        )
    reject_requests.short_description = _('رد درخواست‌های انتخاب شده')
