from rest_framework import serializers
from payments.modles import Payment, Transaction, Refund

class PaymentSerializer(serializer.ModelSerializers):
    class Meta:
        model = Payment
        fields = ['id', 'transaction_id', 'user', 'booking', 'amount', 'method', 'gateway', 'status', 'gateway_transaction_id', 'gateway_response', 'error_message', 'error_code', 'is_installment', 'installment_months', 'monthly_payment', 'created_at', 'updated_at', 'completed_at']
        extra_kwargs = {
            'transaction_id': {'required': True, 'validators': [validate_transaction_id]},
            'user': {'required': True, 'validators': [validate_user]},
            'booking': {'required': True, 'validators': [validate_booking]},
            'amount': {'required': True, 'validators': [validate_amount]},
            'method': {'required': True, 'validators': [validate_method]},
            'gateway': {'required': True, 'validators': [validate_gateway]},
            'status': {'required': True, 'validators': [validate_status]},
            'gateway_transaction_id': {'required': True, 'validators': [validate_gateway_transaction_id]},
        }

class TransactionSerializer(serializer.ModelSerializers):
    class Meta:
        fields = ['id', 'payment', 'transaction_type', 'transaction_id', 'amount', 'status', 'gateway', 'gateway_transaction_id', 'description', 'created_at', 'updated_at']
        extra_kwargs = {
            'payment': {'required': True, 'validators': [validate_payment]},
            'transaction_type': {'required': True, 'validators': [validate_transaction_type]},
            'transaction_id': {'required': True, 'validators': [validate_transaction_id]},
            'amount': {'required': True, 'validators': [validate_amount]},
            'status': {'required': True, 'validators': [validate_status]},
            'gateway': {'required': True, 'validators': [validate_gateway]},
            'gateway_transaction_id': {'required': True, 'validators': [validate_gateway_transaction_id]},
        }
        

class RefundSerializer(serializer.ModelSerializers):
    class Meta:
        model = Refund
        fields = ['id', 'payment', 'transaction', 'refund_amount', 'refund_percentage', 'reason', 'status', 'gateway_refund_id', 'created_at', 'processed_at']
        extra_kwargs = {
            'payment': {'required': True, 'validators': [validate_payment]},
            'transaction': {'required': True, 'validators': [validate_transaction]},
            'refund_amount': {'required': True, 'validators': [validate_refund_amount]},
            'refund_percentage': {'required': True, 'validators': [validate_refund_percentage]},
            'reason': {'required': True, 'validators': [validate_reason]},
            'status': {'required': True, 'validators': [validate_status]},
            'gateway_refund_id': {'required': True, 'validators': [validate_gateway_refund_id]},
        }
        