"""
Serializers for pilots app
"""
from rest_framework import serializers
from .models import Pilot, PilotRequest
from accounts.serializers import UserSerializer
from flights.serializers import FlightSerializer


class PilotSerializer(serializers.ModelSerializer):
    """
    Serializer for Pilot model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Pilot
        fields = [
            'id', 'user', 'user_email', 'user_full_name',
            'license_number', 'license_type', 'license_expiry',
            'total_flight_hours', 'status', 'aircraft_types_certified',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'user_email', 'user_full_name'
        ]
    
    def get_user_full_name(self, obj):
        """Return user's full name"""
        return obj.user.get_full_name()


class PilotDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Pilot model
    """
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Pilot
        fields = [
            'id', 'user', 'user_detail', 'license_number',
            'license_type', 'license_expiry', 'total_flight_hours',
            'status', 'aircraft_types_certified',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'user_detail'
        ]


class PilotRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for PilotRequest model
    """
    pilot_name = serializers.SerializerMethodField()
    flight_number = serializers.CharField(
        source='flight.flight_number',
        read_only=True,
        allow_null=True
    )
    responded_by_email = serializers.EmailField(
        source='responded_by.email',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = PilotRequest
        fields = [
            'id', 'pilot', 'pilot_name', 'request_type', 'status',
            'title', 'description', 'requested_date', 'flight',
            'flight_number', 'response', 'responded_by',
            'responded_by_email', 'responded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'responded_at',
            'pilot_name', 'flight_number', 'responded_by_email'
        ]
    
    def get_pilot_name(self, obj):
        """Return pilot's full name"""
        return obj.pilot.user.get_full_name()


class PilotRequestDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for PilotRequest model
    """
    pilot_detail = PilotSerializer(source='pilot', read_only=True)
    flight_detail = FlightSerializer(source='flight', read_only=True)
    responded_by_detail = UserSerializer(source='responded_by', read_only=True)
    
    class Meta:
        model = PilotRequest
        fields = [
            'id', 'pilot', 'pilot_detail', 'request_type', 'status',
            'title', 'description', 'requested_date', 'flight',
            'flight_detail', 'response', 'responded_by',
            'responded_by_detail', 'responded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'responded_at',
            'pilot_detail', 'flight_detail', 'responded_by_detail'
        ]
