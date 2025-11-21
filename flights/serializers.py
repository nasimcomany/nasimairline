from rest_framework import serializers
from flights.models import Airport, Flight, Aircraft


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = ['id', 'code', 'name', 'city', 'country', 'latitude', 'longitude', 'timezone', 'is_active', 'flight_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'code': {'required': True, 'validators': [validate_airport_code]},
            'name': {'required': True, 'validators': [validate_name]},
            'city': {'required': True, 'validators': [validate_city]},
            'country': {'required': True, 'validators': [validate_country]},
            'latitude': {'required': True, 'validators': [validate_latitude]},
            'longitude': {'required': True, 'validators': [validate_longitude]},
            'timezone': {'required': True, 'validators': [validate_timezone]},
            'is_active': {'required': True, 'validators': [validate_is_active]},
            'flight_count': {'required': True, 'validators': [validate_flight_count]},
        }

class FlightSerializer(serializer.ModelSerializers):
    class Meta:
        model = Flight
        fields = ['id', 'flight_number', 'origin', 'destination', 'aircraft', 'departure_time', 'arrival_time', 'duration', 'economy_price', 'business_price', 'first_class_price', 'economy_available', 'business_available', 'first_class_available', 'status', 'flight_type', 'gate', 'terminal', 'created_at', 'updated_at']
        extra_kwargs = {
            'flight_number': {'required': True, 'validators': [validate_flight_number]},
            'origin': {'required': True, 'validators': [validate_origin]},
            'destination': {'required': True, 'validators': [validate_destination]},
            'aircraft': {'required': True, 'validators': [validate_aircraft]},
            'departure_time': {'required': True, 'validators': [validate_departure_time]},
            'arrival_time': {'required': True, 'validators': [validate_arrival_time]},
            'duration': {'required': True, 'validators': [validate_duration]},
            'economy_price': {'required': True, 'validators': [validate_economy_price]},
            'business_price': {'required': True, 'validators': [validate_business_price]},


            