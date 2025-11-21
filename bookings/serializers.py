"""
Serializers for bookings app
"""
from rest_framework import serializers
from .models import Booking, Passenger, BookingExtra
from flights.serializers import FlightSerializer
from accounts.serializers import UserSerializer


class PassengerSerializer(serializers.ModelSerializer):
    """
    Serializer for Passenger model
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Passenger
        fields = [
            'id', 'booking', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'gender', 'nationality', 'passenger_type',
            'passport_number', 'passport_expiry', 'national_id',
            'seat_number', 'special_meal', 'wheelchair_assistance',
            'special_assistance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']
    
    def get_full_name(self, obj):
        """Return passenger's full name"""
        return obj.get_full_name()


class BookingExtraSerializer(serializers.ModelSerializer):
    """
    Serializer for BookingExtra model
    """
    class Meta:
        model = BookingExtra
        fields = [
            'id', 'booking', 'service_type', 'service_name',
            'quantity', 'unit_price', 'total_price', 'created_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at']
    
    def validate(self, attrs):
        """Validate and calculate total price"""
        if 'unit_price' in attrs and 'quantity' in attrs:
            attrs['total_price'] = attrs['unit_price'] * attrs['quantity']
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for Booking model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    flight_number = serializers.CharField(source='flight.flight_number', read_only=True)
    passenger_count = serializers.SerializerMethodField()
    is_refundable = serializers.SerializerMethodField()
    can_modify = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'user', 'user_email', 'flight',
            'flight_number', 'booking_type', 'cabin_class',
            'base_price', 'extras_price', 'taxes', 'total_amount',
            'status', 'booking_source', 'special_requests',
            'cancellation_reason', 'cancelled_at', 'passenger_count',
            'is_refundable', 'can_modify', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'booking_reference', 'created_at', 'updated_at',
            'cancelled_at', 'passenger_count', 'is_refundable', 'can_modify',
            'user_email', 'flight_number'
        ]
    
    def get_passenger_count(self, obj):
        """Get passenger count breakdown"""
        return obj.get_passenger_count()
    
    def get_is_refundable(self, obj):
        """Check if booking is refundable"""
        return obj.is_refundable()
    
    def get_can_modify(self, obj):
        """Check if booking can be modified"""
        return obj.can_modify()


class BookingDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Booking model with nested objects
    """
    user_detail = UserSerializer(source='user', read_only=True)
    flight_detail = FlightSerializer(source='flight', read_only=True)
    passengers = PassengerSerializer(many=True, read_only=True)
    extras = BookingExtraSerializer(many=True, read_only=True)
    passenger_count = serializers.SerializerMethodField()
    is_refundable = serializers.SerializerMethodField()
    can_modify = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'user', 'user_detail', 'flight',
            'flight_detail', 'booking_type', 'cabin_class',
            'base_price', 'extras_price', 'taxes', 'total_amount',
            'status', 'booking_source', 'special_requests',
            'cancellation_reason', 'cancelled_at', 'passengers',
            'extras', 'passenger_count', 'is_refundable', 'can_modify',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'booking_reference', 'created_at', 'updated_at',
            'cancelled_at', 'passenger_count', 'is_refundable', 'can_modify',
            'user_detail', 'flight_detail', 'passengers', 'extras'
        ]
    
    def get_passenger_count(self, obj):
        """Get passenger count breakdown"""
        return obj.get_passenger_count()
    
    def get_is_refundable(self, obj):
        """Check if booking is refundable"""
        return obj.is_refundable()
    
    def get_can_modify(self, obj):
        """Check if booking can be modified"""
        return obj.can_modify()


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating bookings
    """
    passengers = PassengerSerializer(many=True, write_only=True)
    extras = BookingExtraSerializer(many=True, write_only=True, required=False)
    
    class Meta:
        model = Booking
        fields = [
            'flight', 'booking_type', 'cabin_class',
            'base_price', 'extras_price', 'taxes', 'total_amount',
            'booking_source', 'special_requests', 'passengers', 'extras'
        ]
    
    def create(self, validated_data):
        """Create booking with passengers and extras"""
        passengers_data = validated_data.pop('passengers')
        extras_data = validated_data.pop('extras', [])
        
        # Set user from request
        validated_data['user'] = self.context['request'].user
        
        # Generate booking reference (should be done in model or utils)
        from .utils import generate_booking_reference
        validated_data['booking_reference'] = generate_booking_reference()
        
        booking = Booking.objects.create(**validated_data)
        
        # Create passengers
        for passenger_data in passengers_data:
            Passenger.objects.create(booking=booking, **passenger_data)
        
        # Create extras
        for extra_data in extras_data:
            BookingExtra.objects.create(booking=booking, **extra_data)
        
        return booking
