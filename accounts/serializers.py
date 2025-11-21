"""
Serializers for accounts app
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import User

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'gender', 'nationality',
            'passport_number', 'passport_expiry', 'national_id',
            'loyalty_points', 'membership_level', 'preferred_seat',
            'preferred_meal', 'two_factor_enabled', 'two_factor_method',
            'account_status', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'created_at', 'updated_at',
            'password'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'created_at', 'updated_at',
            'is_staff', 'is_superuser'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'password': {'write_only': True, 'required': False},
        }
    
    def create(self, validated_data):
        """Create user with hashed password"""
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        """Update user with password handling"""
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for User model with additional information
    """
    full_name = serializers.SerializerMethodField()
    is_premium_member = serializers.SerializerMethodField()
    can_access_lounge = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'gender', 'nationality',
            'passport_number', 'passport_expiry', 'national_id',
            'loyalty_points', 'membership_level', 'preferred_seat',
            'preferred_meal', 'two_factor_enabled', 'two_factor_method',
            'account_status', 'is_active', 'is_staff', 'is_superuser',
            'is_premium_member', 'can_access_lounge',
            'date_joined', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'created_at', 'updated_at',
            'is_staff', 'is_superuser', 'full_name', 'is_premium_member',
            'can_access_lounge'
        ]
    
    def get_full_name(self, obj):
        """Return user's full name"""
        return obj.get_full_name()
    
    def get_is_premium_member(self, obj):
        """Check if user is premium member"""
        return obj.is_premium_member()
    
    def get_can_access_lounge(self, obj):
        """Check if user can access lounge"""
        return obj.can_access_lounge()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
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
            'email', 'username', 'first_name', 'last_name',
            'phone_number', 'password', 'password_confirm'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': 'Passwords do not match.'
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
