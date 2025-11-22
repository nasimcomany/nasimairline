"""
Serializers for pilots app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ValidationError
from .models import Pilot, PilotRequest
from accounts.serializers import UserSerializer
from flights.serializers import FlightSerializer


class BasePilotSerializer(serializers.ModelSerializer):
    """
    Base serializer for Pilot-related models with common fields
    """
    uuid = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        return data


class PilotSerializer(BasePilotSerializer):
    """
    Serializer for Pilot model with UUID and computed fields
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = SerializerMethodField()
    is_license_valid = SerializerMethodField()
    experience_level = SerializerMethodField()
    
    class Meta(BasePilotSerializer.Meta):
        model = Pilot
        fields = [
            'id', 'uuid', 'user', 'user_email', 'user_full_name',
            'license_number', 'license_type', 'license_expiry',
            'total_flight_hours', 'status', 'aircraft_types_certified',
            'is_license_valid', 'experience_level',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at',
            'user_email', 'user_full_name', 'is_license_valid', 'experience_level'
        ]
    
    def get_user_full_name(self, obj):
        """Return user's full name"""
        return obj.user.get_full_name()
    
    def get_is_license_valid(self, obj):
        """Check if pilot license is valid"""
        from django.utils import timezone
        return obj.license_expiry > timezone.now().date()
    
    def get_experience_level(self, obj):
        """Determine experience level based on flight hours"""
        if obj.total_flight_hours >= 10000:
            return 'Expert'
        elif obj.total_flight_hours >= 5000:
            return 'Senior'
        elif obj.total_flight_hours >= 2000:
            return 'Intermediate'
        else:
            return 'Junior'


class PilotDetailSerializer(BasePilotSerializer):
    """
    Detailed serializer for Pilot model with statistics
    """
    user_detail = UserSerializer(source='user', read_only=True)
    is_license_valid = SerializerMethodField()
    experience_level = SerializerMethodField()
    request_count = SerializerMethodField()
    
    class Meta(BasePilotSerializer.Meta):
        model = Pilot
        fields = [
            'id', 'uuid', 'user', 'user_detail', 'license_number',
            'license_type', 'license_expiry', 'total_flight_hours',
            'status', 'aircraft_types_certified',
            'is_license_valid', 'experience_level', 'request_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'user_detail',
            'is_license_valid', 'experience_level', 'request_count'
        ]
    
    def get_is_license_valid(self, obj):
        """Check if pilot license is valid"""
        from django.utils import timezone
        return obj.license_expiry > timezone.now().date()
    
    def get_experience_level(self, obj):
        """Determine experience level"""
        if obj.total_flight_hours >= 10000:
            return 'Expert'
        elif obj.total_flight_hours >= 5000:
            return 'Senior'
        elif obj.total_flight_hours >= 2000:
            return 'Intermediate'
        else:
            return 'Junior'
    
    def get_request_count(self, obj):
        """Get total request count"""
        return obj.requests.count()


class PilotRequestSerializer(BasePilotSerializer):
    """
    Serializer for PilotRequest model with UUID
    """
    pilot_name = SerializerMethodField()
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
    is_pending = SerializerMethodField()
    response_time = SerializerMethodField()
    
    class Meta(BasePilotSerializer.Meta):
        model = PilotRequest
        fields = [
            'id', 'uuid', 'pilot', 'pilot_name', 'request_type', 'status',
            'title', 'description', 'requested_date', 'flight',
            'flight_number', 'response', 'responded_by',
            'responded_by_email', 'responded_at', 'is_pending', 'response_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'responded_at',
            'pilot_name', 'flight_number', 'responded_by_email', 'is_pending', 'response_time'
        ]
    
    def get_pilot_name(self, obj):
        """Return pilot's full name"""
        return obj.pilot.user.get_full_name()
    
    def get_is_pending(self, obj):
        """Check if request is pending"""
        return obj.status == 'PENDING'
    
    def get_response_time(self, obj):
        """Calculate response time if responded"""
        if obj.responded_at and obj.created_at:
            delta = obj.responded_at - obj.created_at
            return str(delta)
        return None


class PilotRequestDetailSerializer(BasePilotSerializer):
    """
    Detailed serializer for PilotRequest model with nested objects
    """
    pilot_detail = PilotSerializer(source='pilot', read_only=True)
    flight_detail = FlightSerializer(source='flight', read_only=True)
    responded_by_detail = UserSerializer(source='responded_by', read_only=True)
    is_pending = SerializerMethodField()
    response_time = SerializerMethodField()
    
    class Meta(BasePilotSerializer.Meta):
        model = PilotRequest
        fields = [
            'id', 'uuid', 'pilot', 'pilot_detail', 'request_type', 'status',
            'title', 'description', 'requested_date', 'flight',
            'flight_detail', 'response', 'responded_by',
            'responded_by_detail', 'responded_at', 'is_pending', 'response_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'responded_at',
            'pilot_detail', 'flight_detail', 'responded_by_detail',
            'is_pending', 'response_time'
        ]
    
    def get_is_pending(self, obj):
        """Check if request is pending"""
        return obj.status == 'PENDING'
    
    def get_response_time(self, obj):
        """Calculate response time"""
        if obj.responded_at and obj.created_at:
            delta = obj.responded_at - obj.created_at
            return str(delta)
        return None
