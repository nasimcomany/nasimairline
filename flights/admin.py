"""
Admin configuration for flights app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Airport, Aircraft, Flight


@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    """
    Admin configuration for Airport model
    """
    list_display = [
        'code', 'name', 'city', 'country', 
        'is_active', 'flight_count', 'created_at'
    ]
    list_filter = [
        'is_active', 'country', 'city', 'created_at'
    ]
    search_fields = [
        'code', 'name', 'city', 'country'
    ]
    list_editable = ['is_active']
    list_per_page = 25
    ordering = ['country', 'city', 'name']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('code', 'name', 'city', 'country')
        }),
        (_('موقعیت جغرافیایی'), {
            'fields': ('latitude', 'longitude', 'timezone'),
            'classes': ('collapse',)
        }),
        (_('وضعیت'), {
            'fields': ('is_active', 'flight_count')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'flight_count']


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    """
    Admin configuration for Aircraft model
    """
    list_display = [
        'registration_number', 'model', 'manufacturer',
        'aircraft_type', 'total_seats', 'is_active',
        'in_service_date', 'created_at'
    ]
    list_filter = [
        'is_active', 'aircraft_type', 'manufacturer',
        'in_service_date', 'created_at'
    ]
    search_fields = [
        'registration_number', 'model', 'manufacturer'
    ]
    list_editable = ['is_active']
    list_per_page = 25
    ordering = ['manufacturer', 'model', 'registration_number']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': (
                'registration_number', 'model', 'manufacturer', 
                'aircraft_type'
            )
        }),
        (_('پیکربندی صندلی‌ها'), {
            'fields': (
                'total_seats', 'economy_seats', 
                'business_seats', 'first_class_seats'
            )
        }),
        (_('وضعیت'), {
            'fields': ('is_active', 'in_service_date')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    """
    Admin configuration for Flight model
    """
    list_display = [
        'flight_number', 'origin', 'destination', 'aircraft',
        'departure_time', 'arrival_time', 'status',
        'economy_price', 'business_price', 'first_class_price',
        'economy_available', 'business_available', 'first_class_available',
        'created_at'
    ]
    list_filter = [
        'status', 'flight_type', 'origin', 'destination',
        'aircraft', 'departure_time', 'created_at'
    ]
    search_fields = [
        'flight_number', 'origin__code', 'origin__name',
        'destination__code', 'destination__name',
        'aircraft__registration_number', 'aircraft__model'
    ]
    list_editable = ['status']
    list_per_page = 25
    ordering = ['-departure_time']
    date_hierarchy = 'departure_time'
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('flight_number', 'flight_type', 'status')
        }),
        (_('مسیر'), {
            'fields': ('origin', 'destination')
        }),
        (_('هواپیما'), {
            'fields': ('aircraft',)
        }),
        (_('زمان‌بندی'), {
            'fields': ('departure_time', 'arrival_time', 'duration')
        }),
        (_('قیمت‌گذاری'), {
            'fields': (
                'economy_price', 'business_price', 'first_class_price'
            )
        }),
        (_('ظرفیت موجود'), {
            'fields': (
                'economy_available', 'business_available', 
                'first_class_available'
            )
        }),
        (_('اطلاعات اضافی'), {
            'fields': ('gate', 'terminal'),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    autocomplete_fields = ['origin', 'destination', 'aircraft']
