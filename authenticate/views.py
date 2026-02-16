"""
Views for authentication app
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from .models import PasswordResetCode
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    TokenObtainPairResponseSerializer,
)
from accounts.serializers import UserSerializer

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create user and return JWT tokens"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login IP
        user.last_login_ip = self._get_client_ip(request)
        user.last_login = timezone.now()
        user.save(update_fields=['last_login_ip', 'last_login'])
        
        # Prepare response data
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint
    """
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Login user and return JWT tokens"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login IP and time
        user.last_login_ip = self._get_client_ip(request)
        user.last_login = timezone.now()
        user.save(update_fields=['last_login_ip', 'last_login'])
        
        # Prepare response data
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_captcha(request):
    """
    Verify captcha for dashboard access
    """
    captcha_answer = request.data.get('captcha_answer')
    captcha_num1 = request.data.get('captcha_num1')
    captcha_num2 = request.data.get('captcha_num2')
    captcha_operator = request.data.get('captcha_operator')
    
    if not all([captcha_answer, captcha_num1, captcha_num2, captcha_operator]):
        return Response(
            {'error': 'تمام فیلدهای کپچا الزامی است.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate correct answer
    if captcha_operator == '+':
        correct_answer = captcha_num1 + captcha_num2
    elif captcha_operator == '-':
        correct_answer = captcha_num1 - captcha_num2
    else:
        return Response(
            {'error': 'عملگر نامعتبر است.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify answer
    try:
        user_answer = int(captcha_answer)
        if user_answer != correct_answer:
            return Response(
                {'error': 'کد امنیتی اشتباه است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (ValueError, TypeError):
        return Response(
            {'error': 'پاسخ کپچا باید عدد باشد.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'message': 'کد امنیتی تأیید شد.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    Note: Captcha verification is handled on frontend before accessing this endpoint
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """
    درخواست بازیابی رمز: ایمیل را دریافت می‌کند و کد ۶ رقمی به ایمیل ارسال می‌کند.
    """
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response(
            {'error': 'ایمیل الزامی است.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.filter(email=email).first()
    if not user:
        return Response(
            {'error': 'کاربری با این ایمیل یافت نشد.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    code = PasswordResetCode.objects.create(
        email=email,
        expires_at=timezone.now() + timedelta(minutes=15)
    )
    
    subject = 'کد بازیابی رمز عبور - نسیم ایر'
    message = f'''سلام،

کد بازیابی رمز عبور شما: {code.code}

این کد تا ۱۵ دقیقه معتبر است.

اگر این درخواست را نزده‌اید، این ایمیل را نادیده بگیرید.

نسیم ایر'''
    
    try:
        send_mail(
            subject,
            message,
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nasimair.com'),
            [email],
            fail_silently=False,
        )
    except Exception as e:
        code.delete()
        return Response(
            {'error': 'خطا در ارسال ایمیل. لطفاً بعداً تلاش کنید.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response({
        'message': 'کد تأیید به ایمیل شما ارسال شد.',
        'email': email,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_code_and_set_password(request):
    """
    تأیید کد و تنظیم رمز جدید.
    """
    email = request.data.get('email', '').strip().lower()
    code_str = request.data.get('code', '').strip()
    new_password = request.data.get('new_password', '')
    
    if not all([email, code_str, new_password]):
        return Response(
            {'error': 'ایمیل، کد تأیید و رمز عبور جدید الزامی است.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError
    try:
        validate_password(new_password)
    except ValidationError as ve:
        err_msg = ve.messages[0] if ve.messages else 'رمز عبور نامعتبر است.'
        return Response(
            {'error': err_msg},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reset_code = PasswordResetCode.objects.filter(
        email=email,
        code=code_str
    ).order_by('-created_at').first()
    
    if not reset_code:
        return Response(
            {'error': 'کد تأیید نامعتبر است.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not reset_code.is_valid():
        return Response(
            {'error': 'کد منقضی شده یا قبلاً استفاده شده است.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.get(email=email)
    user.set_password(new_password)
    user.save()
    
    reset_code.is_used = True
    reset_code.save(update_fields=['is_used'])
    
    return Response({
        'message': 'رمز عبور با موفقیت تغییر کرد.'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout(request):
    """
    Logout user (blacklist refresh token)
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as token_error:
            # اگر token معتبر نباشه یا قبلاً blacklist شده باشه، باز هم موفقیت برمی‌گردونیم
            # چون هدف logout کردن کاربره و اگه token معتبر نباشه، یعنی قبلاً logout کرده
            pass
        
        return Response(
            {'message': 'با موفقیت خارج شدید.'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': f'خطا در خروج از سیستم: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
