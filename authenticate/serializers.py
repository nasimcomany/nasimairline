"""
Serializers for authentication app
"""
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from accounts.models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with all required fields for airline
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'gender', 'nationality',
            'passport_number', 'passport_expiry', 'national_id',
            'preferred_seat', 'preferred_meal',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone_number': {'required': False},
        }
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': 'رمزهای عبور مطابقت ندارند.'
            })
        return attrs
    
    def create(self, validated_data):
        """Create user and generate JWT tokens"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Get IP address from request
        request = self.context.get('request')
        if request:
            validated_data['registration_ip'] = self._get_client_ip(request)
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLoginSerializer(serializers.Serializer):
    """
    ورود با کد ملی یا شماره پاسپورت - ایمیل اصلاً دخیل نیست.
    """
    email = serializers.CharField(required=True)  # در API به‌خاطر سازگاری؛ مقدار واقعی = کد ملی یا پاسپورت
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def _find_user_by_login_input(self, login_input, password_val):
        """جستجوی کاربر با کد ملی، پاسپورت، یا ایمیل (اختیاری) - بدون وابستگی به ایمیل"""
        from django.db.models import Q
        
        login_input = str(login_input).strip()
        if not login_input or not password_val:
            return None
        
        candidates = []
        
        # کد ملی (۱۰ رقم)
        if login_input.isdigit() and len(login_input) == 10:
            candidates = list(User.objects.filter(
                Q(national_id=login_input) |
                Q(email=f'{login_input}@nasimair.com') |
                Q(first_name=login_input) |
                Q(username=login_input)
            ).distinct())
        # شماره پاسپورت (۶–۲۰ کاراکتر)
        elif 6 <= len(login_input) <= 20 and login_input.replace(' ', '').replace('-', '').isalnum():
            passport_clean = login_input.upper().replace(' ', '').replace('-', '')
            candidates = list(User.objects.filter(
                Q(passport_number=passport_clean) |
                Q(passport_number=login_input) |
                Q(email=f'{passport_clean}@nasimair.com') |
                Q(first_name=passport_clean)
            ).distinct())
        # اگر @ دارد = ایمیل (اختیاری)
        elif '@' in login_input:
            user = authenticate(
                request=self.context.get('request'),
                username=login_input,
                password=password_val
            )
            return user
        
        for user in candidates:
            if user.check_password(password_val):
                return user
        return None
    
    def validate(self, attrs):
        login_input = attrs.get('email', '').strip()
        password_val = attrs.get('password')
        
        if not login_input or not password_val:
            raise serializers.ValidationError('کد ملی/پاسپورت و رمز عبور الزامی است.')
        
        user = self._find_user_by_login_input(login_input, password_val)
        
        if not user:
            raise serializers.ValidationError('کد ملی/پاسپورت یا رمز عبور اشتباه است.')
        
        if not user.is_active:
            raise serializers.ValidationError('حساب کاربری شما غیرفعال است.')
        
        attrs['user'] = user
        return attrs


class TokenObtainPairResponseSerializer(serializers.Serializer):
    """
    Serializer for JWT token response
    """
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        """Get user data"""
        from accounts.serializers import UserSerializer
        return UserSerializer(obj['user']).data

