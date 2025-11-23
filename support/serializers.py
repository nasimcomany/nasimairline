"""
Serializers for support app
"""
from rest_framework import serializers
from .models import Ticket, TicketMessage, TicketAttachment, TicketCategory
from accounts.serializers import UserSerializer


class TicketCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for TicketCategory
    """
    ticket_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketCategory
        fields = [
            'uuid', 'name', 'slug', 'description',
            'is_active', 'order', 'ticket_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'ticket_count', 'created_at', 'updated_at']
    
    def get_ticket_count(self, obj):
        """Get ticket count for this category"""
        return obj.tickets.count()


class TicketAttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for TicketAttachment
    """
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketAttachment
        fields = [
            'uuid', 'ticket', 'message', 'file', 'file_url',
            'file_name', 'file_size', 'file_size_display',
            'file_type', 'mime_type', 'description', 'created_at'
        ]
        read_only_fields = [
            'uuid', 'file_name', 'file_size', 'file_type',
            'mime_type', 'created_at'
        ]
    
    def get_file_url(self, obj):
        """Get file URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size_display(self, obj):
        """Get file size in human readable format"""
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class TicketMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for TicketMessage
    """
    user = UserSerializer(read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    attachment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketMessage
        fields = [
            'uuid', 'ticket', 'user', 'message', 'message_type',
            'is_read', 'is_internal', 'attachments', 'attachment_count',
            'message_ip', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'user', 'message_ip', 'created_at', 'updated_at'
        ]
    
    def get_attachment_count(self, obj):
        """Get attachment count"""
        return obj.attachments.count()
    
    def create(self, validated_data):
        """Create message and set IP address"""
        request = self.context.get('request')
        if request:
            validated_data['message_ip'] = self._get_client_ip(request)
        return super().create(validated_data)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TicketSerializer(serializers.ModelSerializer):
    """
    Base serializer for Ticket
    """
    user = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    user_info = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    unread_message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = [
            'uuid', 'reference', 'user', 'user_info', 'title', 'description',
            'category', 'ticket_category', 'priority', 'status',
            'assigned_to', 'source', 'related_booking', 'related_flight',
            'nira_ticket_id', 'sla_deadline', 'first_response_at',
            'resolved_at', 'closed_at', 'is_overdue', 'message_count',
            'unread_message_count', 'ticket_ip', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'reference', 'user', 'user_info', 'first_response_at',
            'resolved_at', 'closed_at', 'is_overdue', 'message_count',
            'unread_message_count', 'ticket_ip', 'created_at', 'updated_at'
        ]
    
    def get_user_info(self, obj):
        """Get user information"""
        return obj.get_user_info()
    
    def get_is_overdue(self, obj):
        """Check if ticket is overdue"""
        return obj.is_overdue()
    
    def get_message_count(self, obj):
        """Get message count"""
        return obj.get_message_count()
    
    def get_unread_message_count(self, obj):
        """Get unread message count"""
        return obj.get_unread_message_count()


class TicketDetailSerializer(TicketSerializer):
    """
    Detailed serializer for Ticket with messages
    """
    messages = TicketMessageSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True, source='ticket_attachments')
    
    class Meta(TicketSerializer.Meta):
        fields = TicketSerializer.Meta.fields + ['messages', 'attachments']


class TicketCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new ticket
    """
    class Meta:
        model = Ticket
        fields = [
            'title', 'description', 'category', 'ticket_category',
            'priority', 'related_booking', 'related_flight', 'source'
        ]
    
    def create(self, validated_data):
        """Create ticket and set user and IP"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        
        if request:
            validated_data['ticket_ip'] = self._get_client_ip(request)
        
        return super().create(validated_data)
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TicketUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating ticket (staff only)
    """
    class Meta:
        model = Ticket
        fields = [
            'status', 'priority', 'assigned_to',
            'category', 'ticket_category'
        ]

