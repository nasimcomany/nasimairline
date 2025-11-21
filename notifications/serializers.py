"""
Serializers for notifications app
"""
from rest_framework import serializers
from .models import Notification
from accounts.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_email', 'notification_type', 'channel',
            'title', 'message', 'status', 'priority', 'is_read',
            'read_at', 'metadata', 'created_at', 'sent_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'sent_at', 'read_at', 'user_email'
        ]


class NotificationDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Notification model
    """
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_detail', 'notification_type', 'channel',
            'title', 'message', 'status', 'priority', 'is_read',
            'read_at', 'metadata', 'created_at', 'sent_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'sent_at', 'read_at', 'user_detail'
        ]


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
