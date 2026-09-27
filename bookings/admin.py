"""
Admin configuration for bookings app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Booking, Passenger, BookingExtra


class PassengerInline(admin.TabularInline):
    """
    Inline admin for Passenger model
    """
    model = Passenger
    extra = 0
    fields = [
        'first_name', 'last_name', 'date_of_birth', 
        'gender', 'passenger_type', 'seat_number',
        'passport_number', 'nationality'
    ]
    readonly_fields = ['created_at']


class BookingExtraInline(admin.TabularInline):
    """
    Inline admin for BookingExtra model
    """
    model = BookingExtra
    extra = 0
    fields = [
        'service_type', 'service_name', 
        'quantity', 'unit_price', 'total_price'
    ]
    readonly_fields = ['total_price', 'created_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Admin configuration for Booking model
    """
    list_display = [
        'uuid', 'booking_reference', 'nira_pnr', 'user', 'flight',
        'booking_type', 'cabin_class', 'status',
        'total_amount', 'ticket_issued_at', 'created_at'
    ]
    list_filter = [
        'status', 'booking_type', 'cabin_class',
        'booking_source', 'booking_ip', 'created_at', 'cancelled_at', 'ticket_issued_at'
    ]
    search_fields = [
        'uuid', 'booking_reference', 'nira_pnr', 'nira_session_id',
        'user__email', 'user__first_name', 'user__last_name',
        'flight__flight_number', 'booking_ip'
    ]
    list_editable = ['status']
    list_per_page = 25
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    inlines = [PassengerInline, BookingExtraInline]
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': (
                'booking_reference', 'user', 'flight',
                'booking_type', 'cabin_class', 'status'
            )
        }),
        (_('قیمت‌گذاری'), {
            'fields': (
                'base_price', 'extras_price', 'taxes', 'total_amount'
            )
        }),
        (_('بلیط نیرا / PNR'), {
            'fields': (
                'nira_pnr', 'nira_ticket_numbers', 'nira_session_id',
                'ticket_issued_at', 'hold_expires_at', 'idempotency_key',
            ),
        }),
        (_('اطلاعات اضافی'), {
            'fields': ('booking_source', 'special_requests'),
            'classes': ('collapse',)
        }),
        (_('لغو'), {
            'fields': ('cancellation_reason', 'cancelled_at'),
            'classes': ('collapse',)
        }),
        (_('اطلاعات فنی'), {
            'fields': ('uuid', 'booking_ip', 'metadata'),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'uuid', 'booking_reference', 'created_at', 'updated_at',
        'cancelled_at', 'ticket_issued_at', 'nira_pnr',
        'nira_ticket_numbers', 'nira_session_id', 'hold_expires_at',
    ]
    
    autocomplete_fields = ['user', 'flight']


@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    """
    Admin configuration for Passenger model
    """
    list_display = [
        'first_name', 'last_name', 'booking',
        'passenger_type', 'date_of_birth', 'gender',
        'seat_number', 'nationality', 'created_at'
    ]
    list_filter = [
        'passenger_type', 'gender', 'nationality',
        'special_meal', 'wheelchair_assistance', 'created_at'
    ]
    search_fields = [
        'first_name', 'last_name', 'passport_number',
        'national_id', 'booking__booking_reference'
    ]
    list_per_page = 25
    ordering = ['booking', 'passenger_type', 'last_name']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('booking',)
        }),
        (_('اطلاعات شخصی'), {
            'fields': (
                'first_name', 'last_name', 'date_of_birth',
                'gender', 'nationality', 'passenger_type'
            )
        }),
        (_('اسناد سفر'), {
            'fields': (
                'passport_number', 'passport_expiry', 'national_id'
            ),
            'classes': ('collapse',)
        }),
        (_('اطلاعات صندلی'), {
            'fields': ('seat_number',)
        }),
        (_('نیازهای ویژه'), {
            'fields': (
                'special_meal', 'wheelchair_assistance', 
                'special_assistance'
            ),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    autocomplete_fields = ['booking']


@admin.register(BookingExtra)
class BookingExtraAdmin(admin.ModelAdmin):
    """
    Admin configuration for BookingExtra model
    """
    list_display = [
        'booking', 'service_type', 'service_name',
        'quantity', 'unit_price', 'total_price', 'created_at'
    ]
    list_filter = [
        'service_type', 'created_at'
    ]
    search_fields = [
        'service_name', 'booking__booking_reference'
    ]
    list_per_page = 25
    ordering = ['-created_at']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('booking',)
        }),
        (_('اطلاعات سرویس'), {
            'fields': (
                'service_type', 'service_name',
                'quantity', 'unit_price', 'total_price'
            )
        }),
        (_('تاریخ'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['total_price', 'created_at']
    
    autocomplete_fields = ['booking']
