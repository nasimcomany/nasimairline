from rest_framework import serializers
from bookings.models import Booking, Passenger, BookingExtra


class BookingSerializer(serializers.ModelSerializer)
    class Meta:
        model = Booking
        fields = ['id', 'booking_reference', 'user', 'flight', 'booking_type', 'cabin_class', 'base_price', 'extras_price', 'taxes', 'total_amount', 'status', 'booking_source', 'special_requests', 'cancellation_reason', 'cancelled_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'booking_reference': {'required': True, 'validators': [validate_booking_reference]},
            'user': {'required': True, 'validators': [validate_user]},
            'flight': {'required': True, 'validators': [validate_flight]},
            'booking_type': {'required': True, 'validators': [validate_booking_type]},
            'cabin_class': {'required': True, 'validators': [validate_cabin_class]},
            'base_price': {'required': True, 'validators': [validate_base_price]},
            'extras_price': {'required': True, 'validators': [validate_extras_price]},
            'taxes': {'required': True, 'validators': [validate_taxes]},
            'total_amount': {'required': True, 'validators': [validate_total_amount]},
        }

class PassengerSerializer(serializers.ModelSerializers):
    class Meta:
        model = Pa
        fields = ['id', 'booking', 'first_name', 'last_name', 'date_of_birth', 'gender', 'nationality', 'passenger_type', 'passport_number', 'passport_expiry', 'national_id', 'seat_number', 'special_meal', 'wheelchair_assistance', 'special_assistance', 'created_at', 'updated_at']
        extra_kwargs = {
            'booking': {'required': True, 'validators': [validate_booking]},
            'first_name': {'required': True, 'validators': [validate_first_name]},
            'last_name': {'required': True, 'validators': [validate_last_name]},
            'date_of_birth': {'required': True, 'validators': [validate_date_of_birth]},
            'gender': {'required': True, 'validators': [validate_gender]},
            'nationality': {'required': True, 'validators': [validate_nationality]},
            'passenger_type': {'required': True, 'validators': [validate_passenger_type]},
            'passport_number': {'required': True, 'validators': [validate_passport_number]},
            'passport_expiry': {'required': True, 'validators': [validate_passport_expiry]},
        }

class BookingExtraSerializer(serializer.ModelSerializer):
    class Meta:
        model = BookingExtra
        fields = ['id', 'booking', 'service_type', 'service_name', 'quantity', 'unit_price', 'total_price', 'created_at']
        extra_kwargs = {
            'booking': {'required': True, 'validators': [validate_booking]},
            'service_type': {'required': True, 'validators': [validate_service_type]},
            'service_name': {'required': True, 'validators': [validate_service_name]},
            'quantity': {'required': True, 'validators': [validate_quantity]},
            'unit_price': {'required': True, 'validators': [validate_unit_price]},
            'total_price': {'required': True, 'validators': [validate_total_price]},
        }
        
        def save(self, *args, **kwargs):
            """Calculate total price before saving"""
            self.total_price = self.unit_price * self.quantity
            super().save(*args, **kwargs)

class BookingExtraDetailSerializer(serializer.ModelSerializer):
    class Meta:
        model = BookingExtra
        fields = ['id', 'booking', 'service_type', 'service_name', 'quantity', 'unit_price', 'total_price', 'created_at']
        extra_kwargs = {
            'booking': {'required': True, 'validators': [validate_booking]},
        }

        