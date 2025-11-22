"""
Serializers for payments app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ValidationError
from django.db import models
from .models import Payment, Transaction, Refund
from bookings.serializers import BookingSerializer
from accounts.serializers import UserSerializer


class BasePaymentSerializer(serializers.ModelSerializer):
    """
    Base serializer for Payment-related models with common fields
    """
    uuid = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        return data


class TransactionSerializer(BasePaymentSerializer):
    """
    Serializer for Transaction model with UUID
    """
    is_successful = SerializerMethodField()
    
    class Meta(BasePaymentSerializer.Meta):
        model = Transaction
        fields = [
            'id', 'uuid', 'payment', 'transaction_type', 'transaction_id',
            'amount', 'status', 'gateway', 'gateway_transaction_id',
            'description', 'is_successful', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'transaction_id', 'created_at', 'updated_at', 'is_successful'
        ]
    
    def get_is_successful(self, obj):
        """Check if transaction is successful"""
        return obj.status == 'COMPLETED'


class RefundSerializer(serializers.ModelSerializer):
    """
    Serializer for Refund model
    """
    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'transaction', 'refund_amount',
            'refund_percentage', 'reason', 'status',
            'gateway_refund_id', 'created_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'processed_at'
        ]


class PaymentSerializer(BasePaymentSerializer):
    """
    Serializer for Payment model with UUID and computed fields
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    booking_reference = serializers.CharField(
        source='booking.booking_reference',
        read_only=True,
        allow_null=True
    )
    is_successful = SerializerMethodField()
    can_refund = SerializerMethodField()
    is_refunded = SerializerMethodField()
    payment_ip = serializers.CharField(read_only=True, required=False, allow_null=True)
    gateway_response_summary = SerializerMethodField()
    
    class Meta(BasePaymentSerializer.Meta):
        model = Payment
        fields = [
            'id', 'uuid', 'transaction_id', 'user', 'user_email', 'booking',
            'booking_reference', 'amount', 'method', 'gateway', 'status',
            'gateway_transaction_id', 'gateway_response', 'gateway_response_summary',
            'error_message', 'error_code', 'is_installment', 'installment_months',
            'monthly_payment', 'is_successful', 'can_refund', 'is_refunded',
            'payment_ip', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'transaction_id', 'created_at', 'updated_at',
            'completed_at', 'is_successful', 'can_refund', 'is_refunded',
            'user_email', 'booking_reference', 'gateway_response_summary', 'payment_ip'
        ]
    
    def get_is_successful(self, obj):
        """Check if payment is successful"""
        return obj.is_successful()
    
    def get_can_refund(self, obj):
        """Check if payment can be refunded"""
        return obj.can_refund()
    
    def get_is_refunded(self, obj):
        """Check if payment is refunded"""
        return obj.is_refunded()


class PaymentDetailSerializer(BasePaymentSerializer):
    """
    Detailed serializer for Payment model with nested objects and statistics
    """
    user_detail = UserSerializer(source='user', read_only=True)
    booking_detail = BookingSerializer(source='booking', read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    refunds = RefundSerializer(many=True, read_only=True)
    is_successful = SerializerMethodField()
    can_refund = SerializerMethodField()
    is_refunded = SerializerMethodField()
    installment_details = SerializerMethodField()
    total_refunded = SerializerMethodField()
    payment_ip = serializers.CharField(read_only=True, required=False, allow_null=True)
    gateway_response_summary = SerializerMethodField()
    
    class Meta(BasePaymentSerializer.Meta):
        model = Payment
        fields = [
            'id', 'uuid', 'transaction_id', 'user', 'user_detail', 'booking',
            'booking_detail', 'amount', 'method', 'gateway', 'status',
            'gateway_transaction_id', 'gateway_response', 'gateway_response_summary',
            'error_message', 'error_code', 'is_installment', 'installment_months',
            'monthly_payment', 'transactions', 'refunds',
            'is_successful', 'can_refund', 'is_refunded',
            'installment_details', 'total_refunded', 'payment_ip',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'transaction_id', 'created_at', 'updated_at',
            'completed_at', 'is_successful', 'can_refund', 'is_refunded',
            'installment_details', 'total_refunded', 'gateway_response_summary',
            'user_detail', 'booking_detail', 'transactions', 'refunds', 'payment_ip'
        ]
    
    def get_is_successful(self, obj):
        """Check if payment is successful"""
        return obj.is_successful()
    
    def get_can_refund(self, obj):
        """Check if payment can be refunded"""
        return obj.can_refund()
    
    def get_is_refunded(self, obj):
        """Check if payment is refunded"""
        return obj.is_refunded()
    
    def get_installment_details(self, obj):
        """Get installment calculation details"""
        return obj.get_installment_details()
    
    def get_total_refunded(self, obj):
        """Get total refunded amount"""
        total = obj.refunds.filter(status='COMPLETED').aggregate(
            total=models.Sum('refund_amount')
        )['total']
        return float(total) if total else 0.0
    
    def get_gateway_response_summary(self, obj):
        """Get summary of gateway response"""
        if obj.gateway_response:
            return {
                'status': obj.gateway_response.get('status', 'unknown'),
                'code': obj.gateway_response.get('code', ''),
            }
        return None


class PaymentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating payments
    """
    class Meta:
        model = Payment
        fields = [
            'booking', 'amount', 'method', 'gateway',
            'is_installment', 'installment_months'
        ]
    
    def create(self, validated_data):
        """Create payment with transaction ID"""
        from .utils import generate_transaction_id
        validated_data['user'] = self.context['request'].user
        validated_data['transaction_id'] = generate_transaction_id()
        return super().create(validated_data)
