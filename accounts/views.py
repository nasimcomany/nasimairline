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
from .membership_models import (
    MembershipTierConfig,
    UserMembershipActivity,
    MembershipUpgradeLog
)
from .serializers import (
    UserSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer,
    WalletSerializer,
    WalletTransactionSerializer,
    MembershipTierConfigSerializer,
    UserMembershipActivitySerializer,
    MembershipUpgradeLogSerializer,
    UserMembershipStatusSerializer
)
from .membership_service import MembershipTierService
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


class MembershipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Membership System
    نمایش وضعیت باشگاه مشتریان و tier های کاربر
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserMembershipStatusSerializer
    
    def get_queryset(self):
        """فقط کاربر لاگین شده می‌تونه اطلاعات خودش رو ببینه"""
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'], url_path='my-status')
    def my_status(self, request):
        """
        دریافت وضعیت کامل عضویت کاربر
        GET /api/accounts/membership/my-status/
        """
        user = request.user
        
        # دریافت یا ایجاد activity کاربر
        activity, _ = UserMembershipActivity.objects.get_or_create(user=user)
        activity.update_statistics()
        
        # گرفتن تنظیمات tier فعلی
        current_tier_config = MembershipTierConfig.objects.filter(
            tier=user.membership_level,
            is_active=True
        ).first()
        
        # محاسبه tier بعدی و پیشرفت
        next_tier_data = self._calculate_next_tier_progress(user, activity)
        
        # گرفتن آخرین لاگ ارتقا
        last_upgrade = MembershipUpgradeLog.objects.filter(
            user=user
        ).order_by('-created_at').first()
        
        # ساخت response
        data = {
            'user_uuid': str(user.uuid),
            'user_email': user.email,
            'user_name': user.get_full_name(),
            'current_tier': user.membership_level,
            'current_tier_display': user.get_membership_level_display(),
            'total_bookings': activity.total_bookings,
            'total_completed_flights': activity.total_completed_flights,
            'bookings_last_7_days': activity.bookings_last_7_days,
            'bookings_last_30_days': activity.bookings_last_30_days,
            'active_months_count': activity.active_months_count,
            'membership_duration_days': activity.calculate_membership_duration_days(),
            'next_tier': next_tier_data['tier'],
            'next_tier_display': next_tier_data['tier_display'],
            'progress_to_next_tier': next_tier_data['progress'],
            'current_tier_config': MembershipTierConfigSerializer(current_tier_config).data if current_tier_config else None,
            'last_upgrade': MembershipUpgradeLogSerializer(last_upgrade).data if last_upgrade else None
        }
        
        serializer = UserMembershipStatusSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='check-upgrade')
    def check_upgrade(self, request):
        """
        بررسی امکان ارتقا tier کاربر
        POST /api/accounts/membership/check-upgrade/
        """
        user = request.user
        
        # بروزرسانی آمار و بررسی ارتقا
        upgraded, new_tier, old_tier = MembershipTierService.check_and_upgrade_user_tier(user)
        
        if upgraded:
            return Response({
                'upgraded': True,
                'message': f'تبریک! شما به سطح {user.get_membership_level_display()} ارتقا یافتید',
                'old_tier': old_tier,
                'new_tier': new_tier,
                'new_tier_display': user.get_membership_level_display()
            })
        else:
            return Response({
                'upgraded': False,
                'message': 'شما در حال حاضر واجد شرایط ارتقا نیستید',
                'current_tier': user.membership_level,
                'current_tier_display': user.get_membership_level_display()
            })
    
    @action(detail=False, methods=['get'], url_path='tiers')
    def tiers(self, request):
        """
        دریافت لیست تمام tier ها و تنظیماتشون
        GET /api/accounts/membership/tiers/
        """
        tier_configs = MembershipTierConfig.objects.filter(is_active=True).order_by('tier')
        serializer = MembershipTierConfigSerializer(tier_configs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='upgrade-history')
    def upgrade_history(self, request):
        """
        دریافت تاریخچه ارتقا tier کاربر
        GET /api/accounts/membership/upgrade-history/
        """
        user = request.user
        logs = MembershipUpgradeLog.objects.filter(user=user).order_by('-created_at')
        serializer = MembershipUpgradeLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    def _calculate_next_tier_progress(self, user, activity):
        """
        محاسبه tier بعدی و پیشرفت به سمت اون
        """
        # ترتیب tier ها
        tier_order = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
        current_index = tier_order.index(user.membership_level) if user.membership_level in tier_order else 0
        
        # اگر پلاتینیوم هست، tier بعدی نداریم
        if current_index >= len(tier_order) - 1:
            return {
                'tier': None,
                'tier_display': None,
                'progress': None
            }
        
        # گرفتن tier بعدی
        next_tier = tier_order[current_index + 1]
        next_config = MembershipTierConfig.objects.filter(
            tier=next_tier,
            is_active=True
        ).first()
        
        if not next_config:
            return {
                'tier': None,
                'tier_display': None,
                'progress': None
            }
        
        # محاسبه پیشرفت
        progress = {}
        
        if next_config.min_bookings_total > 0:
            progress['total_bookings'] = {
                'current': activity.total_bookings,
                'required': next_config.min_bookings_total,
                'percentage': min(100, int((activity.total_bookings / next_config.min_bookings_total) * 100))
            }
        
        if next_config.min_bookings_per_month > 0:
            progress['monthly_bookings'] = {
                'current': activity.bookings_last_30_days,
                'required': next_config.min_bookings_per_month,
                'percentage': min(100, int((activity.bookings_last_30_days / next_config.min_bookings_per_month) * 100))
            }
        
        if next_config.min_membership_days > 0:
            membership_days = activity.calculate_membership_duration_days()
            progress['membership_days'] = {
                'current': membership_days,
                'required': next_config.min_membership_days,
                'percentage': min(100, int((membership_days / next_config.min_membership_days) * 100))
            }
        
        if next_config.min_active_months > 0:
            progress['active_months'] = {
                'current': activity.active_months_count,
                'required': next_config.min_active_months,
                'percentage': min(100, int((activity.active_months_count / next_config.min_active_months) * 100))
            }
        
        return {
            'tier': next_tier,
            'tier_display': next_config.get_tier_display(),
            'progress': progress
        }
