"""
Serializers for payments app
"""
from rest_framework import serializers
from .models import Payment, Transaction, Refund
from bookings.serializers import BookingSerializer
from accounts.serializers import UserSerializer


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model
    """
    class Meta:
        model = Transaction
        fields = [
            'id', 'payment', 'transaction_type', 'transaction_id',
            'amount', 'status', 'gateway', 'gateway_transaction_id',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'created_at', 'updated_at'
        ]


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


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    booking_reference = serializers.CharField(
        source='booking.booking_reference',
        read_only=True,
        allow_null=True
    )
    is_successful = serializers.SerializerMethodField()
    can_refund = serializers.SerializerMethodField()
    is_refunded = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'user', 'user_email', 'booking',
            'booking_reference', 'amount', 'method', 'gateway', 'status',
            'gateway_transaction_id', 'gateway_response', 'error_message',
            'error_code', 'is_installment', 'installment_months',
            'monthly_payment', 'is_successful', 'can_refund', 'is_refunded',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'created_at', 'updated_at',
            'completed_at', 'is_successful', 'can_refund', 'is_refunded',
            'user_email', 'booking_reference'
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


class PaymentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Payment model with nested objects
    """
    user_detail = UserSerializer(source='user', read_only=True)
    booking_detail = BookingSerializer(source='booking', read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    refunds = RefundSerializer(many=True, read_only=True)
    is_successful = serializers.SerializerMethodField()
    can_refund = serializers.SerializerMethodField()
    is_refunded = serializers.SerializerMethodField()
    installment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'user', 'user_detail', 'booking',
            'booking_detail', 'amount', 'method', 'gateway', 'status',
            'gateway_transaction_id', 'gateway_response', 'error_message',
            'error_code', 'is_installment', 'installment_months',
            'monthly_payment', 'transactions', 'refunds',
            'is_successful', 'can_refund', 'is_refunded',
            'installment_details', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'created_at', 'updated_at',
            'completed_at', 'is_successful', 'can_refund', 'is_refunded',
            'installment_details', 'user_detail', 'booking_detail',
            'transactions', 'refunds'
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
