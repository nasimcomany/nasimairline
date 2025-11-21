from rest_framework import serializers
from security.models import SecurityInfo, SecurityAlert


class SecurityInfoSerializer(serializer.ModelSerializers):
    clas Meta:
       model = SecurityInfo
       fields = ['id', 'flight', 'security_level', 'passenger_screening', 'baggage_screening', 'special_instructions', 'restricted_passengers', 'notes', 'created_at', 'updated_at']
       extra_kwargs = {
            'flight': {'required': True, 'validators': [validate_flight]},
            'security_level': {'required': True, 'validators': [validate_security_level]},
            'passenger_screening': {'required': True, 'validators': [validate_passenger_screening]},
            'baggage_screening': {'required': True, 'validators': [validate_baggage_screening]},
            'special_instructions': {'required': True, 'validators': [validate_special_instructions]},
            'restricted_passengers': {'required': True, 'validators': [validate_restricted_passengers]},
            'notes': {'required': True, 'validators': [validate_notes]},
        }   