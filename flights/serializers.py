"""
Serializers for flights app
"""
from rest_framework import serializers
from .models import Airport, Aircraft, Flight


class AirportSerializer(serializers.ModelSerializer):
    """
    Serializer for Airport model
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Airport
        fields = [
            'id', 'code', 'name', 'city', 'country',
            'latitude', 'longitude', 'timezone',
            'is_active', 'flight_count', 'full_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'flight_count', 'created_at', 'updated_at', 'full_name']
    
    def get_full_name(self, obj):
        """Return full airport name"""
        return obj.get_full_name()


class AirportDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Airport model
    """
    full_name = serializers.SerializerMethodField()
    departure_count = serializers.SerializerMethodField()
    arrival_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Airport
        fields = [
            'id', 'code', 'name', 'city', 'country',
            'latitude', 'longitude', 'timezone',
            'is_active', 'flight_count', 'full_name',
            'departure_count', 'arrival_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'flight_count', 'created_at', 'updated_at',
            'full_name', 'departure_count', 'arrival_count'
        ]
    
    def get_full_name(self, obj):
        """Return full airport name"""
        return obj.get_full_name()
    
    def get_departure_count(self, obj):
        """Get count of departures"""
        return obj.departures.count()
    
    def get_arrival_count(self, obj):
        """Get count of arrivals"""
        return obj.arrivals.count()


class AircraftSerializer(serializers.ModelSerializer):
    """
    Serializer for Aircraft model
    """
    class Meta:
        model = Aircraft
        fields = [
            'id', 'registration_number', 'model', 'manufacturer',
            'aircraft_type', 'total_seats', 'economy_seats',
            'business_seats', 'first_class_seats', 'is_active',
            'in_service_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AircraftDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Aircraft model
    """
    flight_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Aircraft
        fields = [
            'id', 'registration_number', 'model', 'manufacturer',
            'aircraft_type', 'total_seats', 'economy_seats',
            'business_seats', 'first_class_seats', 'is_active',
            'in_service_date', 'flight_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'flight_count']
    
    def get_flight_count(self, obj):
        """Get count of flights"""
        return obj.flights.count()


class FlightSerializer(serializers.ModelSerializer):
    """
    Serializer for Flight model
    """
    origin_code = serializers.CharField(source='origin.code', read_only=True)
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_code = serializers.CharField(source='destination.code', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    aircraft_model = serializers.CharField(source='aircraft.model', read_only=True)
    route = serializers.SerializerMethodField()
    
    class Meta:
        model = Flight
        fields = [
            'id', 'flight_number', 'origin', 'destination',
            'origin_code', 'origin_name', 'destination_code', 'destination_name',
            'aircraft', 'aircraft_model', 'departure_time', 'arrival_time',
            'duration', 'economy_price', 'business_price', 'first_class_price',
            'economy_available', 'business_available', 'first_class_available',
            'status', 'flight_type', 'gate', 'terminal', 'route',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'route',
            'origin_code', 'origin_name', 'destination_code',
            'destination_name', 'aircraft_model'
        ]
    
    def get_route(self, obj):
        """Return route string"""
        return obj.get_route()


class FlightDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Flight model
    """
    origin_detail = AirportSerializer(source='origin', read_only=True)
    destination_detail = AirportSerializer(source='destination', read_only=True)
    aircraft_detail = AircraftSerializer(source='aircraft', read_only=True)
    route = serializers.SerializerMethodField()
    booking_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Flight
        fields = [
            'id', 'flight_number', 'origin', 'destination',
            'origin_detail', 'destination_detail', 'aircraft',
            'aircraft_detail', 'departure_time', 'arrival_time',
            'duration', 'economy_price', 'business_price', 'first_class_price',
            'economy_available', 'business_available', 'first_class_available',
            'status', 'flight_type', 'gate', 'terminal', 'route',
            'booking_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'route', 'booking_count',
            'origin_detail', 'destination_detail', 'aircraft_detail'
        ]
    
    def get_route(self, obj):
        """Return route string"""
        return obj.get_route()
    
    def get_booking_count(self, obj):
        """Get count of bookings"""
        return obj.bookings.count()


class FlightSearchSerializer(serializers.Serializer):
    """
    Serializer for flight search
    """
    origin = serializers.CharField(required=True)
    destination = serializers.CharField(required=True)
    departure_date = serializers.DateField(required=True)
    return_date = serializers.DateField(required=False, allow_null=True)
    passengers = serializers.IntegerField(default=1, min_value=1, max_value=9)
    cabin_class = serializers.ChoiceField(
        choices=['ECONOMY', 'BUSINESS', 'FIRST_CLASS'],
        default='ECONOMY'
    )
