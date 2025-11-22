"""
Admin configuration for payments app
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Payment, Transaction, Refund


class TransactionInline(admin.TabularInline):
    """
    Inline admin for Transaction model
    """
    model = Transaction
    extra = 0
    fields = [
        'transaction_type', 'transaction_id', 'amount',
        'status', 'gateway', 'created_at'
    ]
    readonly_fields = ['created_at']


class RefundInline(admin.TabularInline):
    """
    Inline admin for Refund model
    """
    model = Refund
    extra = 0
    fields = [
        'refund_amount', 'refund_percentage', 'status',
        'reason', 'created_at', 'processed_at'
    ]
    readonly_fields = ['created_at', 'processed_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Payment model
    """
    list_display = [
        'uuid', 'transaction_id', 'user', 'booking',
        'amount', 'method', 'gateway', 'status',
        'is_installment', 'payment_ip', 'created_at', 'completed_at'
    ]
    list_filter = [
        'status', 'method', 'gateway',
        'is_installment', 'payment_ip', 'created_at', 'completed_at'
    ]
    search_fields = [
        'uuid', 'transaction_id', 'gateway_transaction_id',
        'user__email', 'booking__booking_reference', 'payment_ip'
    ]
    list_editable = ['status']
    list_per_page = 25
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    inlines = [TransactionInline, RefundInline]
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': (
                'transaction_id', 'user', 'booking',
                'amount', 'status'
            )
        }),
        (_('اطلاعات پرداخت'), {
            'fields': ('method', 'gateway')
        }),
        (_('اطلاعات درگاه'), {
            'fields': (
                'gateway_transaction_id', 'gateway_response'
            ),
            'classes': ('collapse',)
        }),
        (_('اطلاعات خطا'), {
            'fields': ('error_message', 'error_code'),
            'classes': ('collapse',)
        }),
        (_('اطلاعات اقساط'), {
            'fields': (
                'is_installment', 'installment_months', 
                'monthly_payment'
            ),
            'classes': ('collapse',)
        }),
        (_('اطلاعات فنی'), {
            'fields': ('uuid', 'payment_ip', 'metadata'),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'uuid', 'transaction_id', 'created_at', 'updated_at', 'completed_at'
    ]
    
    autocomplete_fields = ['user', 'booking']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """
    Admin configuration for Transaction model
    """
    list_display = [
        'uuid', 'transaction_id', 'payment', 'transaction_type',
        'amount', 'status', 'gateway', 'created_at'
    ]
    list_filter = [
        'transaction_type', 'status', 'gateway', 'created_at'
    ]
    search_fields = [
        'uuid', 'transaction_id', 'gateway_transaction_id',
        'payment__transaction_id'
    ]
    list_per_page = 25
    ordering = ['-created_at']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('payment', 'transaction_type', 'transaction_id')
        }),
        (_('اطلاعات تراکنش'), {
            'fields': ('amount', 'status', 'gateway')
        }),
        (_('اطلاعات درگاه'), {
            'fields': ('gateway_transaction_id',),
            'classes': ('collapse',)
        }),
        (_('توضیحات'), {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        (_('اطلاعات فنی'), {
            'fields': ('uuid',),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['uuid', 'transaction_id', 'created_at', 'updated_at']
    
    autocomplete_fields = ['payment']


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    """
    Admin configuration for Refund model
    """
    list_display = [
        'payment', 'refund_amount', 'refund_percentage',
        'status', 'created_at', 'processed_at'
    ]
    list_filter = [
        'status', 'created_at', 'processed_at'
    ]
    search_fields = [
        'payment__transaction_id', 'gateway_refund_id', 'reason'
    ]
    list_per_page = 25
    ordering = ['-created_at']
    
    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('payment', 'transaction')
        }),
        (_('اطلاعات بازپرداخت'), {
            'fields': (
                'refund_amount', 'refund_percentage', 'status'
            )
        }),
        (_('اطلاعات درگاه'), {
            'fields': ('gateway_refund_id',),
            'classes': ('collapse',)
        }),
        (_('دلیل'), {
            'fields': ('reason',),
            'classes': ('collapse',)
        }),
        (_('تاریخ‌ها'), {
            'fields': ('created_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'processed_at']
    
    autocomplete_fields = ['payment', 'transaction']
