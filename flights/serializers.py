"""
Serializers for flights app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ValidationError
from .models import Airport, Aircraft, Flight


class BaseFlightSerializer(serializers.ModelSerializer):
    """
    Base serializer for Flight-related models with common fields
    """
    uuid = serializers.UUIDField(read_only=True)
    metadata = serializers.JSONField(read_only=True, required=False, allow_null=True)
    
    class Meta:
        abstract = True
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at', 'metadata')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        return data


class AirportSerializer(BaseFlightSerializer):
    """
    Serializer for Airport model with UUID and advanced fields
    """
    full_name = SerializerMethodField()
    slug = serializers.SlugField(read_only=True)
    is_popular = SerializerMethodField()
    
    class Meta(BaseFlightSerializer.Meta):
        model = Airport
        fields = [
            'id', 'uuid', 'code', 'name', 'slug', 'city', 'country',
            'latitude', 'longitude', 'timezone',
            'is_active', 'flight_count', 'full_name', 'is_popular', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'flight_count', 'created_at', 'updated_at', 
            'full_name', 'is_popular', 'metadata'
        ]
    
    def get_full_name(self, obj):
        """Return full airport name"""
        return obj.get_full_name()


class AirportDetailSerializer(BaseFlightSerializer):
    """
    Detailed serializer for Airport model with computed statistics
    """
    full_name = SerializerMethodField()
    departure_count = SerializerMethodField()
    arrival_count = SerializerMethodField()
    slug = serializers.SlugField(read_only=True)
    is_popular = SerializerMethodField()
    total_flights = SerializerMethodField()
    
    class Meta(BaseFlightSerializer.Meta):
        model = Airport
        fields = [
            'id', 'uuid', 'code', 'name', 'slug', 'city', 'country',
            'latitude', 'longitude', 'timezone',
            'is_active', 'flight_count', 'full_name',
            'departure_count', 'arrival_count', 'is_popular', 'total_flights', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'flight_count', 'created_at', 'updated_at',
            'full_name', 'departure_count', 'arrival_count', 'is_popular', 
            'total_flights', 'metadata'
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
    
    def get_is_popular(self, obj):
        """Check if airport is popular"""
        return obj.flight_count > 100
    
    def get_total_flights(self, obj):
        """Get total flights (departures + arrivals)"""
        return obj.departures.count() + obj.arrivals.count()


class AircraftSerializer(BaseFlightSerializer):
    """
    Serializer for Aircraft model with UUID
    """
    utilization_rate = SerializerMethodField()
    
    class Meta(BaseFlightSerializer.Meta):
        model = Aircraft
        fields = [
            'id', 'uuid', 'registration_number', 'model', 'manufacturer',
            'aircraft_type', 'total_seats', 'economy_seats',
            'business_seats', 'first_class_seats', 'is_active',
            'in_service_date', 'utilization_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'utilization_rate'
        ]
    
    def get_utilization_rate(self, obj):
        """Calculate aircraft utilization rate"""
        # This is a placeholder - can be calculated based on flight hours
        return 0.0


class AircraftDetailSerializer(BaseFlightSerializer):
    """
    Detailed serializer for Aircraft model with statistics
    """
    flight_count = SerializerMethodField()
    utilization_rate = SerializerMethodField()
    seat_occupancy_rate = SerializerMethodField()
    
    class Meta(BaseFlightSerializer.Meta):
        model = Aircraft
        fields = [
            'id', 'uuid', 'registration_number', 'model', 'manufacturer',
            'aircraft_type', 'total_seats', 'economy_seats',
            'business_seats', 'first_class_seats', 'is_active',
            'in_service_date', 'flight_count', 'utilization_rate', 
            'seat_occupancy_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'flight_count',
            'utilization_rate', 'seat_occupancy_rate'
        ]
    
    def get_flight_count(self, obj):
        """Get count of flights"""
        return obj.flights.count()
    
    def get_utilization_rate(self, obj):
        """Calculate aircraft utilization rate"""
        return 0.0  # Placeholder
    
    def get_seat_occupancy_rate(self, obj):
        """Calculate average seat occupancy rate"""
        return 0.0  # Placeholder


class FlightSerializer(BaseFlightSerializer):
    """
    Serializer for Flight model with UUID and computed fields
    """
    origin_code = serializers.CharField(source='origin.code', read_only=True)
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_code = serializers.CharField(source='destination.code', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    aircraft_model = serializers.CharField(source='aircraft.model', read_only=True)
    route = SerializerMethodField()
    is_available = SerializerMethodField()
    lowest_price = SerializerMethodField()
    departure_date = serializers.DateField(source='departure_time.date', read_only=True)
    arrival_date = serializers.DateField(source='arrival_time.date', read_only=True)
    
    class Meta(BaseFlightSerializer.Meta):
        model = Flight
        fields = [
            'id', 'uuid', 'flight_number', 'origin', 'destination',
            'origin_code', 'origin_name', 'destination_code', 'destination_name',
            'aircraft', 'aircraft_model', 'departure_time', 'arrival_time',
            'departure_date', 'arrival_date', 'duration', 
            'economy_price', 'business_price', 'first_class_price',
            'economy_available', 'business_available', 'first_class_available',
            'status', 'flight_type', 'gate', 'terminal', 'route',
            'is_available', 'lowest_price', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'route',
            'origin_code', 'origin_name', 'destination_code',
            'destination_name', 'aircraft_model', 'is_available',
            'lowest_price', 'departure_date', 'arrival_date', 'metadata'
        ]
    
    def get_route(self, obj):
        """Return route string"""
        return obj.get_route()


class FlightDetailSerializer(BaseFlightSerializer):
    """
    Detailed serializer for Flight model with nested objects and statistics
    """
    origin_detail = AirportSerializer(source='origin', read_only=True)
    destination_detail = AirportSerializer(source='destination', read_only=True)
    aircraft_detail = AircraftSerializer(source='aircraft', read_only=True)
    route = SerializerMethodField()
    booking_count = SerializerMethodField()
    is_available = SerializerMethodField()
    lowest_price = SerializerMethodField()
    occupancy_rate = SerializerMethodField()
    departure_date = serializers.DateField(source='departure_time.date', read_only=True)
    arrival_date = serializers.DateField(source='arrival_time.date', read_only=True)
    
    class Meta(BaseFlightSerializer.Meta):
        model = Flight
        fields = [
            'id', 'uuid', 'flight_number', 'origin', 'destination',
            'origin_detail', 'destination_detail', 'aircraft',
            'aircraft_detail', 'departure_time', 'arrival_time',
            'departure_date', 'arrival_date', 'duration', 
            'economy_price', 'business_price', 'first_class_price',
            'economy_available', 'business_available', 'first_class_available',
            'status', 'flight_type', 'gate', 'terminal', 'route',
            'booking_count', 'is_available', 'lowest_price', 'occupancy_rate', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'created_at', 'updated_at', 'route', 'booking_count',
            'origin_detail', 'destination_detail', 'aircraft_detail',
            'is_available', 'lowest_price', 'occupancy_rate', 'departure_date',
            'arrival_date', 'metadata'
        ]
    
    def get_route(self, obj):
        """Return route string"""
        return obj.get_route()
    
    def get_booking_count(self, obj):
        """Get count of bookings"""
        return obj.bookings.count()
    
    def get_is_available(self, obj):
        """Check if flight has available seats"""
        return obj.is_available('ECONOMY', 1)
    
    def get_lowest_price(self, obj):
        """Get lowest price among all cabin classes"""
        prices = [
            float(obj.economy_price),
            float(obj.business_price),
            float(obj.first_class_price)
        ]
        return min(prices)
    
    def get_occupancy_rate(self, obj):
        """Calculate seat occupancy rate"""
        total_seats = obj.aircraft.total_seats
        booked_seats = total_seats - (
            obj.economy_available + obj.business_available + obj.first_class_available
        )
        if total_seats > 0:
            return round((booked_seats / total_seats) * 100, 2)
        return 0.0


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
