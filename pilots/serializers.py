from rest_framework import serializers
from pilots.models import Pilot, PilotRequest

class PilotSerializer(serializer.ModelSerializers):
    class Meta:
        model = Pilot 
        fields = ['id', 'user', 'license_number', 'license_type', 'license_expiry', 'total_flight_hours', 'status', 'aircraft_types_certified', 'created_at', 'updated_at']
        extra_kwargs = {
            'user': {'required': True, 'validators': [validate_user]},
            'license_number': {'required': True, 'validators': [validate_license_number]},
            'license_type': {'required': True, 'validators': [validate_license_type]},
            'license_expiry': {'required': True, 'validators': [validate_license_expiry]},
            'total_flight_hours': {'required': True, 'validators': [validate_total_flight_hours]},
            'status': {'required': True, 'validators': [validate_status]},
            'aircraft_types_certified': {'required': True, 'validators': [validate_aircraft_types_certified]},
        }


class PilotRequestSerializer(serializer.Modelserializer):
    class Meta:
        models =  PilotRequest
        fields = ['id', 'pilot', 'request_type', 'status', 'title', 'description', 'requested_date', 'flight', 'response', 'responded_by', 'responded_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'pilot': {'required': True, 'validators': [validate_pilot]},
            'request_type': {'required': True, 'validators': [validate_request_type]},
            'status': {'required': True, 'validators': [validate_status]},
            'title': {'required': True, 'validators': [validate_title]},
            'description': {'required': True, 'validators': [validate_description]},
            'requested_date': {'required': True, 'validators': [validate_requested_date]},
            'flight': {'required': True, 'validators': [validate_flight]},
            'response': {'required': True, 'validators': [validate_response]},
        }
        