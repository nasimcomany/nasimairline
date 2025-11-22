"""
Serializers for accounts app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from .models import User

User = get_user_model()


class BaseUserSerializer(serializers.ModelSerializer):
    """
    Base serializer for User model with common fields and methods
    """
    uuid = serializers.UUIDField(read_only=True)
    metadata = serializers.JSONField(read_only=True, required=False, allow_null=True)
    
    class Meta:
        abstract = True
        model = User
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at', 'metadata')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        # Add computed fields if needed
        return data


class UserSerializer(BaseUserSerializer):
    """
    Serializer for User model with UUID and advanced fields
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    registration_ip = serializers.CharField(read_only=True, required=False, allow_null=True)
    last_login_ip = serializers.CharField(read_only=True, required=False, allow_null=True)
    
    class Meta(BaseUserSerializer.Meta):
        fields = [
            'id', 'uuid', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'gender', 'nationality',
            'passport_number', 'passport_expiry', 'national_id',
            'loyalty_points', 'membership_level', 'preferred_seat',
            'preferred_meal', 'two_factor_enabled', 'two_factor_method',
            'account_status', 'is_active', 'is_staff', 'is_superuser',
            'registration_ip', 'last_login_ip', 'metadata',
            'date_joined', 'last_login', 'created_at', 'updated_at',
            'password'
        ]
        read_only_fields = [
            'id', 'uuid', 'date_joined', 'last_login', 'created_at', 'updated_at',
            'is_staff', 'is_superuser', 'registration_ip', 'last_login_ip', 'metadata'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'password': {'write_only': True, 'required': False},
        }
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


class UserDetailSerializer(BaseUserSerializer):
    """
    Detailed serializer for User model with additional computed fields
    """
    full_name = SerializerMethodField()
    is_premium_member = SerializerMethodField()
    can_access_lounge = SerializerMethodField()
    discount_percentage = SerializerMethodField()
    booking_count = SerializerMethodField()
    total_spent = SerializerMethodField()
    registration_ip = serializers.CharField(read_only=True, required=False, allow_null=True)
    last_login_ip = serializers.CharField(read_only=True, required=False, allow_null=True)
    
    class Meta(BaseUserSerializer.Meta):
        fields = [
            'id', 'uuid', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'gender', 'nationality',
            'passport_number', 'passport_expiry', 'national_id',
            'loyalty_points', 'membership_level', 'preferred_seat',
            'preferred_meal', 'two_factor_enabled', 'two_factor_method',
            'account_status', 'is_active', 'is_staff', 'is_superuser',
            'is_premium_member', 'can_access_lounge', 'discount_percentage',
            'booking_count', 'total_spent',
            'registration_ip', 'last_login_ip', 'metadata',
            'date_joined', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'date_joined', 'last_login', 'created_at', 'updated_at',
            'is_staff', 'is_superuser', 'full_name', 'is_premium_member',
            'can_access_lounge', 'discount_percentage', 'booking_count', 'total_spent',
            'registration_ip', 'last_login_ip', 'metadata'
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
    
    def get_discount_percentage(self, obj):
        """Get discount percentage based on membership level"""
        return obj.get_discount_percentage()
    
    def get_booking_count(self, obj):
        """Get total booking count"""
        return obj.bookings.count()
    
    def get_total_spent(self, obj):
        """Get total amount spent by user"""
        from payments.models import Payment
        total = Payment.objects.filter(
            user=obj,
            status='COMPLETED'
        ).aggregate(total=models.Sum('amount'))['total']
        return float(total) if total else 0.0


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
