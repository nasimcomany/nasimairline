"""
Views for payments app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Payment, Transaction, Refund
from .serializers import (
    PaymentSerializer,
    PaymentDetailSerializer,
    PaymentCreateSerializer,
    TransactionSerializer,
    RefundSerializer
)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment model with full CRUD operations
    """
    queryset = Payment.objects.select_related('user', 'booking').prefetch_related(
        'transactions', 'refunds'
    ).all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'method', 'gateway', 'is_installment', 'user', 'booking',
        'uuid', 'payment_ip'
    ]
    search_fields = [
        'uuid', 'transaction_id', 'gateway_transaction_id',
        'user__email', 'booking__booking_reference', 'payment_ip'
    ]
    ordering_fields = ['uuid', 'created_at', 'updated_at', 'amount', 'completed_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return PaymentDetailSerializer
        elif self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """Filter payments by current user unless admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Set user to current user when creating payment"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def process_payment(self, request, pk=None):
        """Process a payment"""
        payment = self.get_object()
        
        # Check if user owns the payment or is staff
        if payment.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to process this payment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if payment.status != 'PENDING':
            return Response(
                {'error': f'Payment is already {payment.status.lower()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process payment (this should call payment gateway)
        # For now, just update status
        payment.status = 'COMPLETED'
        from django.utils import timezone
        payment.completed_at = timezone.now()
        payment.save()
        
        serializer = PaymentDetailSerializer(payment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def refund(self, request, pk=None):
        """Create a refund for a payment"""
        payment = self.get_object()
        
        if not payment.can_refund():
            return Response(
                {'error': 'Payment cannot be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        refund_amount = request.data.get('refund_amount', payment.amount)
        reason = request.data.get('reason', '')
        
        refund = Refund.objects.create(
            payment=payment,
            refund_amount=refund_amount,
            refund_percentage=(refund_amount / payment.amount) * 100,
            reason=reason,
            status='PENDING'
        )
        
        serializer = RefundSerializer(refund)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Transaction model
    """
    queryset = Transaction.objects.select_related('payment').all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'transaction_type', 'status', 'gateway', 'payment', 'uuid'
    ]
    search_fields = [
        'uuid', 'transaction_id', 'gateway_transaction_id',
        'payment__transaction_id'
    ]
    ordering_fields = ['uuid', 'created_at', 'updated_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter transactions by payment ownership"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(payment__user=self.request.user)
        return queryset


class RefundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Refund model
    """
    queryset = Refund.objects.select_related('payment', 'transaction').all()
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment']
    search_fields = [
        'payment__transaction_id', 'gateway_refund_id', 'reason'
    ]
    ordering_fields = ['created_at', 'processed_at', 'refund_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter refunds by payment ownership"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(payment__user=self.request.user)
        return queryset
