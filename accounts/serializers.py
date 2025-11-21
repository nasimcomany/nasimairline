from rest_framework import serializers
from accounts.models import User

class UserSerializer(serializer.Modelserializer)
    class Meta:
        model =User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 'gender', 'nationality', 'passport_number', 'passport_expiry', 'national_id', 'loyalty_points', 'membership_level', 'preferred_seat', 'preferred_meal', 'two_factor_enabled', 'two_factor_method', 'two_factor_secret', 'account_status', 'created_at', 'updated_at', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True, 'validators': [validate_email]},
            'phone_number': {'required': True, 'validators': [validate_phone_number]},
            'date_of_birth': {'required': True, 'validators': [validate_date_of_birth]},
            'gender': {'required': True, 'validators': [validate_gender]},
            'nationality': {'required': True, 'validators': [validate_nationality]},
            'passport_number': {'required': True, 'validators': [validate_passport_number]},
            'passport_expiry': {'required': True, 'validators': [validate_passport_expiry]},
            'national_id': {'required': True, 'validators': [validate_national_id]},
        }
        