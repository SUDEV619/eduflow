from rest_framework import serializers
from .models import Subject, StudySession

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']

class StudySessionSerializer(serializers.ModelSerializer):
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), 
        source='subject',
        write_only=True
    )
    subject_name = serializers.ReadOnlyField(source='subject.name')

    class Meta:
        model = StudySession
        fields = [
            'id', 'subject_id', 'subject_name', 'start_time', 
            'end_time', 'duration', 'session_type', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'duration', 'created_at']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time.")
        
        user = self.context['request'].user
        if data['subject'].user != user:
             raise serializers.ValidationError("Subject must belong to the user.")
        
        # Check for overlapping sessions
        overlaps = StudySession.objects.filter(
            user=user,
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time']
        ).exists()
        
        if overlaps:
            raise serializers.ValidationError("This session overlaps with an existing study session.")
             
        return data

class AnalyticsSerializer(serializers.Serializer):
    today_minutes = serializers.IntegerField()
    weekly_minutes = serializers.IntegerField()
    subject_distribution = serializers.ListField(
        child=serializers.DictField()
    )
    daily_trend = serializers.ListField(
        child=serializers.DictField()
    )
