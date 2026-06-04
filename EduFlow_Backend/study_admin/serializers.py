from rest_framework import serializers
from accounts.models import CustomUser
from study_tracker.models import StudySession
from mock_tests.models import MockTest

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class AdminStudySessionSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    subject_name = serializers.ReadOnlyField(source='subject.name')

    class Meta:
        model = StudySession
        fields = ['id', 'user_email', 'subject_name', 'start_time', 'end_time', 'duration', 'session_type', 'notes']
