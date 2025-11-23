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
            'phone_number': {'required': True},
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
    Serializer for user login
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'),
                              username=email, password=password)
            
            if not user:
                raise serializers.ValidationError(
                    'ایمیل یا رمز عبور اشتباه است.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'حساب کاربری شما غیرفعال است.'
                )
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError(
                'ایمیل و رمز عبور الزامی است.'
            )
        
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

