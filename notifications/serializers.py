"""
Serializers for notifications app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ValidationError
from .models import Notification
from accounts.serializers import UserSerializer


class BaseNotificationSerializer(serializers.ModelSerializer):
    """
    Base serializer for Notification model with common fields
    """
    uuid = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True
        model = Notification
        read_only_fields = ('id', 'uuid', 'created_at', 'sent_at', 'read_at')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        return data


class NotificationSerializer(BaseNotificationSerializer):
    """
    Serializer for Notification model with UUID and computed fields
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    time_since_created = SerializerMethodField()
    is_urgent = SerializerMethodField()
    
    class Meta(BaseNotificationSerializer.Meta):
        fields = [
            'id', 'uuid', 'user', 'user_email', 'notification_type', 'channel',
            'title', 'message', 'status', 'priority', 'is_read',
            'read_at', 'metadata', 'time_since_created', 'is_urgent',
            'created_at', 'sent_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'sent_at', 'read_at', 'user_email',
            'time_since_created', 'is_urgent'
        ]
    
    def get_time_since_created(self, obj):
        """Calculate time since notification was created"""
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        return str(delta)
    
    def get_is_urgent(self, obj):
        """Check if notification is urgent"""
        return obj.priority == 'HIGH' or obj.priority == 'CRITICAL'


class NotificationDetailSerializer(BaseNotificationSerializer):
    """
    Detailed serializer for Notification model with user details
    """
    user_detail = UserSerializer(source='user', read_only=True)
    time_since_created = SerializerMethodField()
    is_urgent = SerializerMethodField()
    
    class Meta(BaseNotificationSerializer.Meta):
        fields = [
            'id', 'uuid', 'user', 'user_detail', 'notification_type', 'channel',
            'title', 'message', 'status', 'priority', 'is_read',
            'read_at', 'metadata', 'time_since_created', 'is_urgent',
            'created_at', 'sent_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'sent_at', 'read_at', 'user_detail',
            'time_since_created', 'is_urgent'
        ]
    
    def get_time_since_created(self, obj):
        """Calculate time since notification was created"""
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        return str(delta)
    
    def get_is_urgent(self, obj):
        """Check if notification is urgent"""
        return obj.priority == 'HIGH' or obj.priority == 'CRITICAL'


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating notifications
    """
    class Meta:
        model = Notification
        fields = [
            'user', 'notification_type', 'channel',
            'title', 'message', 'priority', 'metadata'
        ]
