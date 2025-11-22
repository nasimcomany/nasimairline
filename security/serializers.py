"""
Serializers for security app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ValidationError
from .models import SecurityInfo, SecurityAlert
from flights.serializers import FlightSerializer
from accounts.serializers import UserSerializer


class BaseSecuritySerializer(serializers.ModelSerializer):
    """
    Base serializer for Security-related models with common fields
    """
    uuid = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        return data


class SecurityInfoSerializer(BaseSecuritySerializer):
    """
    Serializer for SecurityInfo model with UUID
    """
    flight_number = serializers.CharField(
        source='flight.flight_number',
        read_only=True
    )
    is_high_security = SerializerMethodField()
    restricted_count = SerializerMethodField()
    
    class Meta(BaseSecuritySerializer.Meta):
        model = SecurityInfo
        fields = [
            'id', 'uuid', 'flight', 'flight_number', 'security_level',
            'passenger_screening', 'baggage_screening',
            'special_instructions', 'restricted_passengers', 'restricted_count',
            'notes', 'is_high_security', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'flight_number',
            'is_high_security', 'restricted_count'
        ]
    
    def get_is_high_security(self, obj):
        """Check if security level is high"""
        return obj.security_level in ['HIGH', 'CRITICAL']
    
    def get_restricted_count(self, obj):
        """Get count of restricted passengers"""
        if isinstance(obj.restricted_passengers, list):
            return len(obj.restricted_passengers)
        return 0


class SecurityInfoDetailSerializer(BaseSecuritySerializer):
    """
    Detailed serializer for SecurityInfo model
    """
    flight_detail = FlightSerializer(source='flight', read_only=True)
    is_high_security = SerializerMethodField()
    restricted_count = SerializerMethodField()
    
    class Meta(BaseSecuritySerializer.Meta):
        model = SecurityInfo
        fields = [
            'id', 'uuid', 'flight', 'flight_detail', 'security_level',
            'passenger_screening', 'baggage_screening',
            'special_instructions', 'restricted_passengers', 'restricted_count',
            'notes', 'is_high_security', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'flight_detail',
            'is_high_security', 'restricted_count'
        ]
    
    def get_is_high_security(self, obj):
        """Check if security level is high"""
        return obj.security_level in ['HIGH', 'CRITICAL']
    
    def get_restricted_count(self, obj):
        """Get count of restricted passengers"""
        if isinstance(obj.restricted_passengers, list):
            return len(obj.restricted_passengers)
        return 0


class SecurityAlertSerializer(BaseSecuritySerializer):
    """
    Serializer for SecurityAlert model with UUID and computed fields
    """
    flight_number = serializers.CharField(
        source='flight.flight_number',
        read_only=True,
        allow_null=True
    )
    resolved_by_email = serializers.EmailField(
        source='resolved_by.email',
        read_only=True,
        allow_null=True
    )
    is_active = SerializerMethodField()
    is_critical = SerializerMethodField()
    resolution_time = SerializerMethodField()
    
    class Meta(BaseSecuritySerializer.Meta):
        model = SecurityAlert
        fields = [
            'id', 'uuid', 'flight', 'flight_number', 'threat_type',
            'security_level', 'title', 'description', 'status',
            'resolved_by', 'resolved_by_email', 'resolved_at',
            'resolution_notes', 'is_active', 'is_critical', 'resolution_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'resolved_at',
            'flight_number', 'resolved_by_email', 'is_active', 'is_critical', 'resolution_time'
        ]
    
    def get_is_active(self, obj):
        """Check if alert is active"""
        return obj.status == 'ACTIVE'
    
    def get_is_critical(self, obj):
        """Check if alert is critical"""
        return obj.security_level == 'CRITICAL' or obj.threat_type in ['TERRORISM', 'BOMB']
    
    def get_resolution_time(self, obj):
        """Calculate resolution time if resolved"""
        if obj.resolved_at and obj.created_at:
            delta = obj.resolved_at - obj.created_at
            return str(delta)
        return None


class SecurityAlertDetailSerializer(BaseSecuritySerializer):
    """
    Detailed serializer for SecurityAlert model with nested objects
    """
    flight_detail = FlightSerializer(source='flight', read_only=True)
    resolved_by_detail = UserSerializer(source='resolved_by', read_only=True)
    is_active = SerializerMethodField()
    is_critical = SerializerMethodField()
    resolution_time = SerializerMethodField()
    
    class Meta(BaseSecuritySerializer.Meta):
        model = SecurityAlert
        fields = [
            'id', 'uuid', 'flight', 'flight_detail', 'threat_type',
            'security_level', 'title', 'description', 'status',
            'resolved_by', 'resolved_by_detail', 'resolved_at',
            'resolution_notes', 'is_active', 'is_critical', 'resolution_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'resolved_at',
            'flight_detail', 'resolved_by_detail', 'is_active', 'is_critical', 'resolution_time'
        ]
    
    def get_is_active(self, obj):
        """Check if alert is active"""
        return obj.status == 'ACTIVE'
    
    def get_is_critical(self, obj):
        """Check if alert is critical"""
        return obj.security_level == 'CRITICAL' or obj.threat_type in ['TERRORISM', 'BOMB']
    
    def get_resolution_time(self, obj):
        """Calculate resolution time"""
        if obj.resolved_at and obj.created_at:
            delta = obj.resolved_at - obj.created_at
            return str(delta)
        return None
