"""
Admin configuration for customer_service app
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CustomerTierSettings,
    ChatSession,
    ChatMessage,
    FlightMealFeedback,
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


@admin.register(FlightMealFeedback)
class FlightMealFeedbackAdmin(admin.ModelAdmin):
    """Admin for flight meal feedback"""
    list_display = [
        'uuid',
        'flight_number',
        'get_passenger_display',
        'get_route_display',
        'get_average_rating_display',
        'is_reviewed',
        'submitted_at'
    ]
    list_filter = [
        'is_reviewed',
        'submitted_at',
        'food_quality',
        'service_quality',
    ]
    search_fields = [
        'flight_number',
        'first_name',
        'last_name',
        'origin_city',
        'destination_city',
        'comments',
    ]
    readonly_fields = [
        'uuid',
        'submitted_at',
        'updated_at',
        'ip_address',
        'user_agent',
        'get_average_rating_display',
        # User-submitted data - should not be editable by admin
        'flight_number',
        'origin_city',
        'destination_city',
        'first_name',
        'last_name',
        'food_quality',
        'food_temperature',
        'food_taste',
        'food_presentation',
        'portion_size',
        'variety',
        'packaging',
        'service_quality',
        'comments',
    ]
    ordering = ['-submitted_at']
    date_hierarchy = 'submitted_at'
    
    fieldsets = (
        ('اطلاعات پرواز', {
            'fields': ('uuid', 'flight_number', 'origin_city', 'destination_city')
        }),
        ('اطلاعات مسافر', {
            'fields': ('first_name', 'last_name')
        }),
        ('ارزیابی کیفیت غذا', {
            'fields': (
                'food_quality',
                'food_temperature',
                'food_taste',
                'food_presentation',
                'portion_size',
                'variety',
                'packaging',
                'service_quality',
                'get_average_rating_display',
            )
        }),
        ('نظرات و پیشنهادات', {
            'fields': ('comments',)
        }),
        ('بررسی ادمین', {
            'fields': (
                'is_reviewed',
                'reviewed_by',
                'reviewed_at',
                'admin_notes',
            )
        }),
        ('اطلاعات فنی', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('زمان‌ها', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_reviewed', 'export_to_csv']
    
    def get_passenger_display(self, obj):
        """Display passenger name"""
        name = obj.get_passenger_name()
        if name == 'ناشناس':
            return format_html('<em style="color: gray;">{}</em>', name)
        return format_html('<strong>{}</strong>', name)
    get_passenger_display.short_description = 'نام مسافر'
    
    def get_route_display(self, obj):
        """Display flight route"""
        if obj.origin_city and obj.destination_city:
            return format_html(
                '{} <span style="color: #3b82f6;">→</span> {}',
                obj.origin_city,
                obj.destination_city
            )
        elif obj.origin_city:
            return obj.origin_city
        elif obj.destination_city:
            return f'→ {obj.destination_city}'
        return '-'
    get_route_display.short_description = 'مسیر'
    
    def get_average_rating_display(self, obj):
        """Display average rating with stars"""
        avg = obj.get_average_rating()
        if avg is None:
            return '-'
        
        # Color based on rating
        if avg >= 4:
            color = '#22c55e'  # green
        elif avg >= 3:
            color = '#eab308'  # yellow
        else:
            color = '#ef4444'  # red
        
        stars = '⭐' * int(round(avg))
        avg_formatted = f'{avg:.2f}'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span> {}',
            color,
            avg_formatted,
            stars
        )
    get_average_rating_display.short_description = 'میانگین امتیاز'
    
    def mark_as_reviewed(self, request, queryset):
        """Mark selected feedbacks as reviewed"""
        from django.utils import timezone
        updated = queryset.update(
            is_reviewed=True,
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(
            request,
            f'{updated} بازخورد به عنوان بررسی شده علامت‌گذاری شد.'
        )
    mark_as_reviewed.short_description = 'علامت‌گذاری به عنوان بررسی شده'
    
    def export_to_csv(self, request, queryset):
        """Export selected feedbacks to CSV"""
        import csv
        from django.http import HttpResponse
        from django.utils import timezone
        
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="meal-feedback-{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'UUID',
            'تاریخ ثبت',
            'شماره پرواز',
            'مبدا',
            'مقصد',
            'نام',
            'نام خانوادگی',
            'کیفیت غذا',
            'دمای غذا',
            'طعم',
            'ارائه',
            'اندازه',
            'تنوع',
            'بسته‌بندی',
            'سرویس',
            'میانگین',
            'نظرات',
            'بررسی شده',
        ])
        
        for obj in queryset:
            writer.writerow([
                str(obj.uuid),
                obj.submitted_at.strftime('%Y-%m-%d %H:%M'),
                obj.flight_number or '',
                obj.origin_city or '',
                obj.destination_city or '',
                obj.first_name or '',
                obj.last_name or '',
                obj.food_quality or '',
                obj.food_temperature or '',
                obj.food_taste or '',
                obj.food_presentation or '',
                obj.portion_size or '',
                obj.variety or '',
                obj.packaging or '',
                obj.service_quality or '',
                obj.get_average_rating() or '',
                obj.comments or '',
                'بله' if obj.is_reviewed else 'خیر',
            ])
        
        return response
    export_to_csv.short_description = 'خروجی CSV'
