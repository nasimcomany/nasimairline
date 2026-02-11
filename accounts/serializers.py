"""
Serializers for accounts app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from .models import User, Wallet, WalletTransaction
from .membership_models import (
    MembershipTierConfig,
    UserMembershipActivity,
    MembershipUpgradeLog
)

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


class WalletTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for WalletTransaction model
    """
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    
    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'transaction_type', 'transaction_type_display',
            'amount', 'status', 'status_display',
            'gateway', 'gateway_display', 'gateway_transaction_id',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WalletSerializer(serializers.ModelSerializer):
    """
    Serializer for Wallet model
    """
    transactions = WalletTransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'transactions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class MembershipTierConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for MembershipTierConfig
    """
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)
    
    class Meta:
        model = MembershipTierConfig
        fields = [
            'uuid', 'tier', 'tier_display', 'name_fa', 'name_en',
            'min_bookings_total', 'min_bookings_per_month', 'min_bookings_per_week',
            'min_membership_days', 'min_active_months', 'min_completed_flights',
            'criteria_priority_1', 'criteria_priority_2', 'criteria_priority_3',
            'is_active', 'auto_upgrade', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']


class UserMembershipActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for UserMembershipActivity
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    membership_duration_days = serializers.SerializerMethodField()
    
    class Meta:
        model = UserMembershipActivity
        fields = [
            'uuid', 'user_email', 'user_name',
            'total_bookings', 'total_completed_flights',
            'first_booking_date', 'last_booking_date',
            'bookings_last_7_days', 'bookings_last_30_days', 'bookings_last_90_days',
            'active_months_count', 'average_bookings_per_month',
            'membership_duration_days',
            'last_calculated_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'user_email', 'user_name',
            'total_bookings', 'total_completed_flights',
            'first_booking_date', 'last_booking_date',
            'bookings_last_7_days', 'bookings_last_30_days', 'bookings_last_90_days',
            'active_months_count', 'average_bookings_per_month',
            'membership_duration_days',
            'last_calculated_at', 'created_at', 'updated_at'
        ]
    
    def get_user_name(self, obj):
        """Get user's full name"""
        return obj.user.get_full_name()
    
    def get_membership_duration_days(self, obj):
        """Get membership duration in days"""
        return obj.calculate_membership_duration_days()


class MembershipUpgradeLogSerializer(serializers.ModelSerializer):
    """
    Serializer for MembershipUpgradeLog
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    old_tier_display = serializers.CharField(source='get_old_tier_display', read_only=True)
    new_tier_display = serializers.CharField(source='get_new_tier_display', read_only=True)
    upgraded_by_email = serializers.EmailField(source='upgraded_by.email', read_only=True, allow_null=True)
    
    class Meta:
        model = MembershipUpgradeLog
        fields = [
            'uuid', 'user_email', 'user_name',
            'old_tier', 'old_tier_display',
            'new_tier', 'new_tier_display',
            'reason',
            'total_bookings_at_upgrade', 'membership_days_at_upgrade',
            'is_automatic', 'upgraded_by_email',
            'created_at'
        ]
        read_only_fields = [
            'uuid', 'user_email', 'user_name',
            'old_tier', 'old_tier_display',
            'new_tier', 'new_tier_display',
            'reason',
            'total_bookings_at_upgrade', 'membership_days_at_upgrade',
            'is_automatic', 'upgraded_by_email',
            'created_at'
        ]
    
    def get_user_name(self, obj):
        """Get user's full name"""
        return obj.user.get_full_name()


class UserMembershipStatusSerializer(serializers.Serializer):
    """
    Serializer for user's complete membership status
    برای نمایش وضعیت کامل عضویت کاربر در فرانت
    """
    # اطلاعات کاربر
    user_uuid = serializers.UUIDField()
    user_email = serializers.EmailField()
    user_name = serializers.CharField()
    
    # tier فعلی
    current_tier = serializers.CharField()
    current_tier_display = serializers.CharField()
    
    # آمار فعالیت
    total_bookings = serializers.IntegerField()
    total_completed_flights = serializers.IntegerField()
    bookings_last_7_days = serializers.IntegerField()
    bookings_last_30_days = serializers.IntegerField()
    active_months_count = serializers.IntegerField()
    membership_duration_days = serializers.IntegerField()
    
    # tier بعدی و پیشرفت
    next_tier = serializers.CharField(allow_null=True)
    next_tier_display = serializers.CharField(allow_null=True)
    progress_to_next_tier = serializers.DictField(allow_null=True)
    
    # تنظیمات tier فعلی
    current_tier_config = MembershipTierConfigSerializer(allow_null=True)
    
    # لاگ آخرین ارتقا
    last_upgrade = MembershipUpgradeLogSerializer(allow_null=True)
