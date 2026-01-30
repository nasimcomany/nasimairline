"""
Views for accounts app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import User
from .serializers import (
    UserSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer
)

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
