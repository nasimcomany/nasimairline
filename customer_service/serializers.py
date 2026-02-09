"""
Serializers for customer_service app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomerTierSettings,
    ChatSession,
    ChatMessage,
    FlightMealFeedback,
)
from .utils import (
    calculate_customer_tier,
    get_customer_tier_info,
    generate_session_id,
)
from .constants import (
    CUSTOMER_TIER_CHOICES,
    CHAT_STATUS_CHOICES,
    MESSAGE_TYPE_CHOICES,
    MESSAGE_TYPE_CUSTOMER,
    MESSAGE_TYPE_STAFF,
)

User = get_user_model()


class CustomerTierSettingsSerializer(serializers.ModelSerializer):
    """Serializer for CustomerTierSettings"""
    
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)
    criteria_type_display = serializers.CharField(source='get_criteria_type_display', read_only=True)
    operator_display = serializers.CharField(source='get_operator_display', read_only=True)
    
    class Meta:
        model = CustomerTierSettings
        fields = [
            'uuid', 'tier', 'tier_display', 'criteria_type', 'criteria_type_display',
            'operator', 'operator_display', 'value', 'description', 'priority',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for ChatSession"""
    
    customer_tier_display = serializers.CharField(source='get_customer_tier_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_name = serializers.CharField(source='get_customer_name', read_only=True)
    customer_email = serializers.CharField(source='get_customer_email', read_only=True)
    message_count = serializers.IntegerField(source='get_message_count', read_only=True)
    unread_message_count = serializers.IntegerField(source='get_unread_message_count', read_only=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'uuid', 'user', 'guest_name', 'guest_email', 'session_id',
            'status', 'status_display', 'assigned_to', 'customer_tier',
            'customer_tier_display', 'customer_name', 'customer_email',
            'nira_session_id', 'nira_data', 'message_count', 'unread_message_count',
            'created_at', 'updated_at', 'closed_at',
        ]
        read_only_fields = ['uuid', 'session_id', 'created_at', 'updated_at', 'closed_at']
    
    def create(self, validated_data):
        """Create chat session with auto-generated session_id and tier"""
        # Generate session ID if not provided
        if not validated_data.get('session_id'):
            validated_data['session_id'] = generate_session_id()
        
        # Get user and calculate tier
        user = validated_data.get('user') or self.context['request'].user if self.context.get('request') else None
        
        if user and user.is_authenticated:
            # Calculate customer tier
            validated_data['customer_tier'] = calculate_customer_tier(user)
        
        return super().create(validated_data)


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage"""
    
    message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)
    sender_name = serializers.CharField(source='get_sender_name', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'uuid', 'session', 'user', 'message', 'message_type',
            'message_type_display', 'is_read', 'sender_name',
            'nira_message_id', 'created_at', 'updated_at',
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create chat message"""
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            # If user is staff, set message type to STAFF
            if request.user.is_staff:
                validated_data['message_type'] = MESSAGE_TYPE_STAFF
                validated_data['user'] = request.user
            else:
                # Customer message
                validated_data['message_type'] = MESSAGE_TYPE_CUSTOMER
        
        # Set IP address
        if request:
            validated_data['message_ip'] = request.META.get('REMOTE_ADDR')
        
        return super().create(validated_data)


class CustomerTierInfoSerializer(serializers.Serializer):
    """Serializer for customer tier information"""
    
    current_tier = serializers.CharField()
    current_tier_display = serializers.CharField()
    metrics = serializers.DictField()
    next_tier = serializers.CharField(allow_null=True)
    next_tier_display = serializers.CharField(allow_null=True)
    next_tier_requirements = serializers.ListField()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for chat session list"""
    
    customer_name = serializers.CharField(source='get_customer_name', read_only=True)
    customer_tier_display = serializers.CharField(source='get_customer_tier_display', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.IntegerField(source='get_unread_message_count', read_only=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'uuid', 'session_id', 'customer_name', 'customer_tier',
            'customer_tier_display', 'status', 'assigned_to',
            'last_message', 'unread_count', 'created_at', 'updated_at',
        ]
    
    def get_last_message(self, obj):
        """Get last message preview"""
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'message': last_msg.message[:100] + ('...' if len(last_msg.message) > 100 else ''),
                'message_type': last_msg.message_type,
                'created_at': last_msg.created_at,
            }
        return None


class FlightMealFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for flight meal feedback submission"""
    
    average_rating = serializers.SerializerMethodField(read_only=True)
    passenger_name = serializers.CharField(source='get_passenger_name', read_only=True)
    
    class Meta:
        model = FlightMealFeedback
        fields = [
            'uuid',
            'flight_number',
            'origin_city',
            'destination_city',
            'first_name',
            'last_name',
            'passenger_name',
            'food_quality',
            'food_temperature',
            'food_taste',
            'food_presentation',
            'portion_size',
            'variety',
            'packaging',
            'service_quality',
            'comments',
            'average_rating',
            'submitted_at',
        ]
        read_only_fields = ['uuid', 'submitted_at', 'average_rating', 'passenger_name']
    
    def get_average_rating(self, obj):
        """Get average rating"""
        return obj.get_average_rating()
    
    def create(self, validated_data):
        """Create feedback with IP and user agent from request"""
        request = self.context.get('request')
        if request:
            # Get IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            validated_data['ip_address'] = ip
            
            # Get user agent
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)


class FlightMealFeedbackListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for feedback list in admin"""
    
    passenger_name = serializers.CharField(source='get_passenger_name', read_only=True)
    average_rating = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = FlightMealFeedback
        fields = [
            'uuid',
            'flight_number',
            'passenger_name',
            'origin_city',
            'destination_city',
            'average_rating',
            'is_reviewed',
            'submitted_at',
        ]
    
    def get_average_rating(self, obj):
        """Get average rating"""
        avg = obj.get_average_rating()
        return round(avg, 2) if avg else None

