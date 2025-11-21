"""
Serializers for security app
"""
from rest_framework import serializers
from .models import SecurityInfo, SecurityAlert
from flights.serializers import FlightSerializer
from accounts.serializers import UserSerializer


class SecurityInfoSerializer(serializers.ModelSerializer):
    """
    Serializer for SecurityInfo model
    """
    flight_number = serializers.CharField(
        source='flight.flight_number',
        read_only=True
    )
    
    class Meta:
        model = SecurityInfo
        fields = [
            'id', 'flight', 'flight_number', 'security_level',
            'passenger_screening', 'baggage_screening',
            'special_instructions', 'restricted_passengers',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'flight_number'
        ]


class SecurityInfoDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for SecurityInfo model
    """
    flight_detail = FlightSerializer(source='flight', read_only=True)
    
    class Meta:
        model = SecurityInfo
        fields = [
            'id', 'flight', 'flight_detail', 'security_level',
            'passenger_screening', 'baggage_screening',
            'special_instructions', 'restricted_passengers',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'flight_detail'
        ]


class SecurityAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for SecurityAlert model
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
    
    class Meta:
        model = SecurityAlert
        fields = [
            'id', 'flight', 'flight_number', 'threat_type',
            'security_level', 'title', 'description', 'status',
            'resolved_by', 'resolved_by_email', 'resolved_at',
            'resolution_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'resolved_at',
            'flight_number', 'resolved_by_email'
        ]


class SecurityAlertDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for SecurityAlert model
    """
    flight_detail = FlightSerializer(source='flight', read_only=True)
    resolved_by_detail = UserSerializer(source='resolved_by', read_only=True)
    
    class Meta:
        model = SecurityAlert
        fields = [
            'id', 'flight', 'flight_detail', 'threat_type',
            'security_level', 'title', 'description', 'status',
            'resolved_by', 'resolved_by_detail', 'resolved_at',
            'resolution_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'resolved_at',
            'flight_detail', 'resolved_by_detail'
        ]
