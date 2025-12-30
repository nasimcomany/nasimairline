"""
Serializers for Nira API integration
"""
from rest_framework import serializers
from datetime import datetime


class NiraAvailabilityRequestSerializer(serializers.Serializer):
    """
    Serializer for Nira Availability API request
    """
    origin = serializers.CharField(
        required=True,
        max_length=3,
        help_text="Origin airport IATA code (e.g., 'THR')"
    )
    destination = serializers.CharField(
        required=True,
        max_length=3,
        help_text="Destination airport IATA code (e.g., 'MHD')"
    )
    departure_date = serializers.DateField(
        required=True,
        help_text="Departure date (will be converted to Jalali format)"
    )
    round_trip = serializers.BooleanField(
        default=False,
        help_text="Whether it's a round trip"
    )
    return_date = serializers.DateField(
        required=False,
        allow_null=True,
        help_text="Return date (required if round_trip=True)"
    )
    adult_qty = serializers.IntegerField(
        default=1,
        min_value=1,
        max_value=9,
        help_text="Number of adults"
    )
    child_qty = serializers.IntegerField(
        default=0,
        min_value=0,
        max_value=9,
        help_text="Number of children"
    )
    infant_qty = serializers.IntegerField(
        default=0,
        min_value=0,
        max_value=9,
        help_text="Number of infants"
    )
    
    def validate(self, attrs):
        """Validate that return_date is provided if round_trip is True"""
        round_trip = attrs.get('round_trip', False)
        return_date = attrs.get('return_date')
        
        if round_trip and not return_date:
            raise serializers.ValidationError({
                'return_date': 'Return date is required for round trip flights'
            })
        
        if return_date and not round_trip:
            raise serializers.ValidationError({
                'round_trip': 'Round trip must be True if return date is provided'
            })
        
        # Validate that return_date is after departure_date
        if return_date and attrs.get('departure_date'):
            if return_date <= attrs['departure_date']:
                raise serializers.ValidationError({
                    'return_date': 'Return date must be after departure date'
                })
        
        return attrs


class NiraRoutesRequestSerializer(serializers.Serializer):
    """
    Serializer for Nira Routes API request
    """
    origin = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=3,
        help_text="Origin airport IATA code. Leave empty to get all origin cities, or provide code to get destinations from that origin"
    )

