from rest_framework import serializers
from .models import Notification, AdminBroadcast, UserBroadcastLink
from django.utils import timezone
from datetime import timedelta
from accounts.models import CustomUser

class NotificationSerializer(serializers.ModelSerializer):
    date_label = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'is_read', 'created_at', 'date_label']

    def get_date_label(self, obj):
        now = timezone.now().date()
        obj_date = obj.created_at.date()
        
        if obj_date == now:
            return "Today"
        elif obj_date == now - timedelta(days=1):
            return "Yesterday"
        else:
            return "Earlier"

class AdminBroadcastSerializer(serializers.ModelSerializer):
    delivered_count = serializers.IntegerField(source='delivered_links.count', read_only=True)
    read_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = AdminBroadcast
        fields = [
            'id', 'title', 'message', 'is_global', 'created_at', 
            'scheduled_at', 'is_sent', 'delivered_count', 
            'read_count', 'created_by_name'
        ]

    def get_read_count(self, obj):
        return obj.delivered_links.filter(is_read=True).count()

class AdminBroadcastDetailSerializer(AdminBroadcastSerializer):
    target_user_emails = serializers.SerializerMethodField()

    class Meta(AdminBroadcastSerializer.Meta):
        fields = AdminBroadcastSerializer.Meta.fields + ['target_user_emails']

    def get_target_user_emails(self, obj):
        if obj.is_global:
            return ["All Users"]
        return list(obj.target_users.values_list('email', flat=True))
