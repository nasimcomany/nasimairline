"""
Admin configuration for accounts app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Wallet, WalletTransaction


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin with extended fields
    """
    list_display = [
        'uuid', 'email', 'username', 'first_name', 'last_name', 
        'phone_number', 'membership_level', 'loyalty_points',
        'account_status', 'is_active', 'is_staff', 'is_superuser',
        'registration_ip', 'last_login_ip', 'date_joined', 'last_login'
    ]
    list_filter = [
        'is_active', 'is_staff', 'is_superuser', 
        'account_status', 'membership_level', 'gender',
        'two_factor_enabled', 'date_joined', 'registration_ip', 'last_login_ip'
    ]
    search_fields = [
        'uuid', 'email', 'username', 'first_name', 'last_name',
        'phone_number', 'national_id', 'passport_number',
        'registration_ip', 'last_login_ip'
    ]
    ordering = ['-date_joined']
    list_per_page = 25
    list_max_show_all = 100
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('اطلاعات شخصی'), {
            'fields': (
                'first_name', 'last_name', 'date_of_birth', 
                'gender', 'nationality'
            )
        }),
        (_('اطلاعات تماس'), {
            'fields': ('phone_number',)
        }),
        (_('اطلاعات گذرنامه'), {
            'fields': (
                'passport_number', 'passport_expiry', 'national_id'
            ),
            'classes': ('collapse',)
        }),
        (_('سیستم وفاداری'), {
            'fields': ('loyalty_points', 'membership_level')
        }),
        (_('ترجیحات سفر'), {
            'fields': ('preferred_seat', 'preferred_meal'),
            'classes': ('collapse',)
        }),
        (_('احراز هویت دو مرحله‌ای'), {
            'fields': (
                'two_factor_enabled', 'two_factor_method', 
                'two_factor_secret'
            ),
            'classes': ('collapse',)
        }),
        (_('وضعیت حساب'), {
            'fields': ('account_status', 'is_active', 'is_staff', 'is_superuser')
        }),
        (_('اطلاعات فنی'), {
            'fields': ('uuid', 'registration_ip', 'last_login_ip', 'preferences'),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('date_joined', 'last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        (_('دسترسی‌ها'), {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'password1', 'password2',
                'first_name', 'last_name', 'phone_number'
            ),
        }),
    )
    
    readonly_fields = ['uuid', 'date_joined', 'last_login', 'created_at', 'updated_at']
    
    filter_horizontal = ['groups', 'user_permissions']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """
    Admin for Wallet model
    """
    list_display = ['user', 'balance', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    """
    Admin for WalletTransaction model
    """
    list_display = [
        'id', 'wallet', 'transaction_type', 'amount', 
        'status', 'gateway', 'created_at'
    ]
    list_filter = ['transaction_type', 'status', 'gateway', 'created_at']
    search_fields = [
        'wallet__user__email', 'gateway_transaction_id', 
        'description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
