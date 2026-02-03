"""
Views for accounts app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import User, Wallet, WalletTransaction
from .serializers import (
    UserSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer,
    WalletSerializer,
    WalletTransactionSerializer
)
from django.db import transaction as db_transaction
from decimal import Decimal

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model with full CRUD operations
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'account_status', 'membership_level', 'gender',
        'is_active', 'two_factor_enabled', 'uuid',
        'registration_ip', 'last_login_ip'
    ]
    search_fields = [
        'uuid', 'email', 'username', 'first_name', 'last_name',
        'phone_number', 'national_id', 'passport_number',
        'registration_ip', 'last_login_ip'
    ]
    ordering_fields = [
        'uuid', 'created_at', 'updated_at', 'date_joined', 'last_login',
        'loyalty_points', 'membership_level'
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return UserDetailSerializer
        elif self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions for this view.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user's profile"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        """Update current user's profile - Only phone_number can be updated and only once"""
        user = request.user
        
        # فقط شماره تلفن قابل ویرایش است
        if 'phone_number' in request.data:
            # اگر شماره تلفن قبلاً وجود داشته باشد، اجازه تغییر نمی‌دهیم
            if user.phone_number and user.phone_number.strip():
                return Response(
                    {'error': 'شماره تلفن قبلاً ثبت شده و قابل تغییر نیست.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # فقط شماره تلفن را به‌روزرسانی می‌کنیم
            user.phone_number = request.data.get('phone_number')
            user.save(update_fields=['phone_number'])
        else:
            # اگر فیلد دیگری غیر از phone_number ارسال شده باشد، خطا می‌دهیم
            allowed_fields = {'phone_number'}
            provided_fields = set(request.data.keys())
            if provided_fields - allowed_fields:
                return Response(
                    {'error': 'فقط شماره تلفن قابل ویرایش است.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(UserDetailSerializer(user).data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_loyalty_points(self, request, pk=None):
        """Update user's loyalty points"""
        user = self.get_object()
        points = request.data.get('points', 0)
        if not isinstance(points, int):
            return Response(
                {'error': 'Points must be an integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.loyalty_points += points
        user.save()
        return Response(UserDetailSerializer(user).data)


class WalletViewSet(viewsets.ViewSet):
    """
    ViewSet for Wallet operations
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_wallet(self, user):
        """Get or create wallet for user"""
        wallet, created = Wallet.objects.get_or_create(user=user)
        return wallet
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """Get wallet balance"""
        wallet = self.get_wallet(request.user)
        return Response({
            'balance': float(wallet.balance),
            'user_id': request.user.id
        })
    
    @action(detail=False, methods=['get'])
    def transactions(self, request):
        """Get wallet transactions"""
        wallet = self.get_wallet(request.user)
        transactions = wallet.transactions.all()[:50]  # Last 50 transactions
        serializer = WalletTransactionSerializer(transactions, many=True)
        return Response({
            'results': serializer.data,
            'count': transactions.count()
        })
    
    @action(detail=False, methods=['post'])
    def charge(self, request):
        """
        Create charge request and redirect to payment gateway
        This is a placeholder - actual payment gateway integration should be implemented
        """
        amount = request.data.get('amount')
        gateway = request.data.get('gateway')
        
        if not amount or not gateway:
            return Response(
                {'error': 'مبلغ و درگاه پرداخت الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                return Response(
                    {'error': 'مبلغ باید بیشتر از صفر باشد'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'مبلغ نامعتبر است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        wallet = self.get_wallet(request.user)
        
        # Create pending transaction
        transaction = WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='charge',
            amount=amount,
            status='pending',
            gateway=gateway,
            description=f'شارژ کیف پول از طریق {gateway}'
        )
        
        # TODO: Integrate with actual payment gateway
        # For now, return a placeholder response
        # When ready, implement actual gateway integration:
        # - Zarinpal: Use zarinpal library
        # - PEP: Use PEP API
        # - Saman: Use Saman gateway
        # - Mellat: Use Mellat gateway
        # - Parsian: Use Parsian gateway
        
        # Example structure for future implementation:
        # payment_url = get_payment_gateway_url(gateway, amount, transaction.id)
        # return Response({
        #     'payment_url': payment_url,
        #     'transaction_id': transaction.id
        # })
        
        return Response({
            'message': 'در حال حاضر امکان شارژ کیف پول وجود ندارد',
            'transaction_id': transaction.id,
            'status': 'pending'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """
        Verify payment after returning from gateway
        This should be called by the payment gateway callback
        """
        transaction_id = request.data.get('transaction_id')
        gateway_transaction_id = request.data.get('gateway_transaction_id')
        status_code = request.data.get('status')
        
        if not transaction_id:
            return Response(
                {'error': 'شناسه تراکنش الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transaction = WalletTransaction.objects.get(
                id=transaction_id,
                wallet__user=request.user
            )
        except WalletTransaction.DoesNotExist:
            return Response(
                {'error': 'تراکنش یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # TODO: Verify with actual payment gateway
        # For now, just update transaction status
        
        if status_code == 'success':
            with db_transaction.atomic():
                transaction.status = 'success'
                transaction.gateway_transaction_id = gateway_transaction_id
                transaction.save()
                
                # Update wallet balance
                wallet = transaction.wallet
                wallet.balance += transaction.amount
                wallet.save()
            
            return Response({
                'message': 'شارژ با موفقیت انجام شد',
                'new_balance': float(wallet.balance)
            })
        else:
            transaction.status = 'failed'
            transaction.gateway_transaction_id = gateway_transaction_id
            transaction.save()
            
            return Response({
                'message': 'شارژ ناموفق بود',
                'status': 'failed'
            }, status=status.HTTP_400_BAD_REQUEST)
