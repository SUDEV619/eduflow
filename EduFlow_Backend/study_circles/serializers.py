from rest_framework import serializers
from .models import StudyCircle, Message, Resource, JoinRequest, UserCircleSettings, Report
from accounts.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email']

class JoinRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = JoinRequest
        fields = ['id', 'circle', 'user', 'user_name', 'user_email', 'status', 'created_at']
        read_only_fields = ['user']

class UserCircleSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCircleSettings
        fields = ['notify_messages', 'notify_resources', 'notify_join_requests']

class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.name', read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_name', 'circle', 'reported_user', 'report_type', 'message', 'is_resolved', 'created_at']
        read_only_fields = ['reporter']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'circle', 'sender', 'sender_name', 'sender_email', 'content', 'created_at']
        read_only_fields = ['sender']

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)
    
    class Meta:
        model = Resource
        fields = ['id', 'circle', 'title', 'file', 'uploaded_by', 'uploaded_by_name', 'created_at']
        read_only_fields = ['uploaded_by']

class StudyCircleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    member_count = serializers.IntegerField(source='members.count', read_only=True)
    is_member = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    request_status = serializers.SerializerMethodField()
    user_settings = serializers.SerializerMethodField()

    class Meta:
        model = StudyCircle
        fields = [
            'id', 'name', 'description', 'subject', 'is_private', 
            'created_by', 'created_by_name', 'member_count', 
            'is_member', 'is_admin', 'request_status', 
            'resource_permissions', 'discussion_enabled', 
            'discussion_restricted_to_admin', 'user_settings',
            'created_at'
        ]
        read_only_fields = ['created_by']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

    def get_is_admin(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.created_by == request.user
        return False

    def get_request_status(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            jr = JoinRequest.objects.filter(circle=obj, user=request.user).first()
            if jr:
                return jr.status
        return None

    def get_user_settings(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            settings, _ = UserCircleSettings.objects.get_or_create(user=request.user, circle=obj)
            return UserCircleSettingsSerializer(settings).data
        return None
