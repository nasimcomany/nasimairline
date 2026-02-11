"""
Admin configuration for accounts app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import User, Wallet, WalletTransaction
from .membership_models import (
    MembershipTierConfig,
    UserMembershipActivity,
    MembershipUpgradeLog
)
from .membership_service import MembershipTierService


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


@admin.register(MembershipTierConfig)
class MembershipTierConfigAdmin(admin.ModelAdmin):
    """
    Admin for MembershipTierConfig model
    ادمین می‌تونه معیارها و اولویت‌های tier رو تنظیم کنه
    """
    list_display = [
        'tier', 'name_fa', 'name_en', 
        'min_bookings_total', 'min_bookings_per_month',
        'min_membership_days', 'is_active', 'auto_upgrade'
    ]
    list_filter = ['tier', 'is_active', 'auto_upgrade']
    search_fields = ['name_fa', 'name_en']
    ordering = ['tier']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('tier', 'name_fa', 'name_en')
        }),
        (_('معیارهای تعداد رزرو'), {
            'fields': (
                'min_bookings_total',
                'min_bookings_per_month',
                'min_bookings_per_week'
            ),
            'description': 'حداقل تعداد رزروها (0 = غیرفعال)'
        }),
        (_('معیارهای زمانی'), {
            'fields': (
                'min_membership_days',
                'min_active_months'
            ),
            'description': 'حداقل مدت زمان عضویت و فعالیت (0 = غیرفعال)'
        }),
        (_('معیارهای دیگر'), {
            'fields': ('min_completed_flights',),
            'description': 'سایر معیارها (0 = غیرفعال)'
        }),
        (_('اولویت معیارها'), {
            'fields': (
                'criteria_priority_1',
                'criteria_priority_2',
                'criteria_priority_3'
            ),
            'description': 'تعیین اولویت معیارها برای ارتقا'
        }),
        (_('تنظیمات'), {
            'fields': ('is_active', 'auto_upgrade')
        }),
    )
    
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    def has_delete_permission(self, request, obj=None):
        """جلوگیری از حذف tier های پیش‌فرض"""
        if obj and obj.tier in ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']:
            return False
        return super().has_delete_permission(request, obj)


@admin.register(UserMembershipActivity)
class UserMembershipActivityAdmin(admin.ModelAdmin):
    """
    Admin for UserMembershipActivity model
    نمایش آمار فعالیت‌های کاربران
    """
    list_display = [
        'user', 'total_bookings', 'bookings_last_30_days',
        'active_months_count', 'first_booking_date', 
        'last_booking_date', 'last_calculated_at'
    ]
    list_filter = ['last_calculated_at', 'first_booking_date']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering = ['-total_bookings']
    readonly_fields = [
        'uuid', 'user', 'total_bookings', 'total_completed_flights',
        'first_booking_date', 'last_booking_date',
        'bookings_last_7_days', 'bookings_last_30_days', 
        'bookings_last_90_days', 'active_months_count',
        'average_bookings_per_month', 'last_calculated_at',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        (_('کاربر'), {
            'fields': ('user',)
        }),
        (_('آمار رزرو'), {
            'fields': (
                'total_bookings',
                'total_completed_flights',
                'first_booking_date',
                'last_booking_date'
            )
        }),
        (_('فرکانس استفاده'), {
            'fields': (
                'bookings_last_7_days',
                'bookings_last_30_days',
                'bookings_last_90_days',
                'active_months_count',
                'average_bookings_per_month'
            )
        }),
        (_('تاریخ‌ها'), {
            'fields': ('last_calculated_at', 'created_at', 'updated_at')
        }),
    )
    
    actions = ['update_statistics_action', 'check_tier_upgrade_action']
    
    def update_statistics_action(self, request, queryset):
        """بروزرسانی آمار برای کاربران انتخاب شده"""
        count = 0
        for activity in queryset:
            activity.update_statistics()
            count += 1
        self.message_user(request, f"آمار {count} کاربر بروزرسانی شد.")
    update_statistics_action.short_description = "🔄 بروزرسانی آمار"
    
    def check_tier_upgrade_action(self, request, queryset):
        """بررسی و ارتقا tier برای کاربران انتخاب شده"""
        upgraded_count = 0
        for activity in queryset:
            upgraded, new_tier, old_tier = MembershipTierService.check_and_upgrade_user_tier(
                activity.user, force=True
            )
            if upgraded:
                upgraded_count += 1
        self.message_user(
            request, 
            f"از {queryset.count()} کاربر، {upgraded_count} نفر ارتقا یافتند."
        )
    check_tier_upgrade_action.short_description = "✨ بررسی و ارتقا Tier"
    
    def has_add_permission(self, request):
        """فقط سیستم می‌تونه activity بسازه"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """جلوگیری از حذف activity ها"""
        return False


@admin.register(MembershipUpgradeLog)
class MembershipUpgradeLogAdmin(admin.ModelAdmin):
    """
    Admin for MembershipUpgradeLog model
    نمایش لاگ ارتقا tier کاربران
    """
    list_display = [
        'user', 'get_tier_change_display', 'is_automatic',
        'total_bookings_at_upgrade', 'membership_days_at_upgrade',
        'created_at'
    ]
    list_filter = ['old_tier', 'new_tier', 'is_automatic', 'created_at']
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'reason'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'uuid', 'user', 'old_tier', 'new_tier', 'reason',
        'total_bookings_at_upgrade', 'membership_days_at_upgrade',
        'is_automatic', 'upgraded_by', 'created_at'
    ]
    
    fieldsets = (
        (_('اطلاعات ارتقا'), {
            'fields': ('user', 'old_tier', 'new_tier', 'is_automatic', 'upgraded_by')
        }),
        (_('دلیل ارتقا'), {
            'fields': ('reason',),
            'description': 'معیارهایی که باعث ارتقا شدند'
        }),
        (_('آمار در زمان ارتقا'), {
            'fields': (
                'total_bookings_at_upgrade',
                'membership_days_at_upgrade'
            )
        }),
        (_('تاریخ'), {
            'fields': ('created_at',)
        }),
    )
    
    def get_tier_change_display(self, obj):
        """نمایش تغییر tier با رنگ"""
        tier_colors = {
            'BRONZE': '#CD7F32',
            'SILVER': '#C0C0C0',
            'GOLD': '#FFD700',
            'PLATINUM': '#E5E4E2'
        }
        old_color = tier_colors.get(obj.old_tier, '#999')
        new_color = tier_colors.get(obj.new_tier, '#999')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span> → '
            '<span style="color: {}; font-weight: bold;">{}</span>',
            old_color, obj.get_old_tier_display(),
            new_color, obj.get_new_tier_display()
        )
    get_tier_change_display.short_description = 'تغییر Tier'
    
    def has_add_permission(self, request):
        """فقط سیستم می‌تونه لاگ بسازه"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """جلوگیری از حذف لاگ‌ها"""
        return False
