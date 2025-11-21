from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializer.ModelSerializers)
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'channel', 'title', 'message', 'status', 'priority', 'is_read', 'read_at', 'metadata', 'created_at', 'sent_at']
        extra_kwargs = {
            'user': {'required': True, 'validators': [validate_user]},
            'notification_type': {'required': True, 'validators': [validate_notification_type]},
            'channel': {'required': True, 'validators': [validate_channel]},
            'title': {'required': True, 'validators': [validate_title]},
            'message': {'required': True, 'validators': [validate_message]},
            'status': {'required': True, 'validators': [validate_status]},
            'priority': {'required': True, 'validators': [validate_priority]},
            'is_read': {'required': True, 'validators': [validate_is_read]},
            'read_at': {'required': True, 'validators': [validate_read_at]},
        }