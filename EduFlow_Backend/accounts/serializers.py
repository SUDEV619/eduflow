from rest_framework import serializers
from .models import CustomUser
from .validators import validate_name, validate_strong_password
from django.core.exceptions import ValidationError

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_strong_password])
    name = serializers.CharField(validators=[validate_name])

    class Meta:
        model = CustomUser
        fields = ['name', 'email', 'password', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
            'password': {'required': True},
            'role': {'required': False},
        }

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
