from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Notification, AdminBroadcast, UserBroadcastLink
from .serializers import NotificationSerializer, AdminBroadcastSerializer, AdminBroadcastDetailSerializer
from .permissions import IsAdminUserRole # Assuming this exists from previous tasks
from accounts.models import CustomUser
from django.db import transaction
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """
    Fetch user-specific notifications and broadcasts ordered by created_at descending.
    """
    try:
        # 1. Individual notifications
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')

        # Apply filters
        n_type = request.query_params.get("type")
        is_read_param = request.query_params.get("is_read")

        if n_type:
            notifications = notifications.filter(type=n_type)

        if is_read_param is not None:
            if is_read_param.lower() == "true":
                notifications = notifications.filter(is_read=True)
            elif is_read_param.lower() == "false":
                notifications = notifications.filter(is_read=False)

        # 2. Broadcasts targeting this user
        broadcast_links = UserBroadcastLink.objects.filter(user=request.user).select_related('broadcast').order_by('-delivered_at')
        if is_read_param is not None:
            if is_read_param.lower() == "true":
                broadcast_links = broadcast_links.filter(is_read=True)
            elif is_read_param.lower() == "false":
                broadcast_links = broadcast_links.filter(is_read=False)
                
        data = []
        
        # Add individual notifications
        for n in notifications:
            data.append({
                "id": n.id,
                "db_id": n.id,
                "title": n.title or "",
                "message": n.message or "",
                "type": n.type or "system",
                "is_read": n.is_read,
                "created_at": n.created_at,
                "date_label": "Today" # Will be processed by frontend or added here if needed
            })
            
        # Add broadcasts
        for link in broadcast_links:
            broadcast = link.broadcast
            if not broadcast:
                continue
                
            data.append({
                "id": f"broadcast_{broadcast.id}",
                "db_id": link.id,
                "title": broadcast.title or "",
                "message": broadcast.message or "",
                "type": "admin",
                "is_read": link.is_read,
                "created_at": link.delivered_at,
                "date_label": "Earlier"
            })

        # Sort by created_at (which are now all datetime objects)
        data.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Convert datetimes to strings for JSON response
        for item in data:
            if isinstance(item['created_at'], timezone.datetime):
                item['created_at'] = item['created_at'].isoformat()

        return Response({"status": "success", "data": data})

    except Exception as e:
        import traceback
        print("NOTIFICATION ERROR:", str(e))
        print(traceback.format_exc())
        return Response(
            {"status": "error", "message": "Failed to load notifications"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notification_id):
    """
    Mark a specific notification or broadcast as read.
    """
    if str(notification_id).startswith('broadcast_'):
        # It's a combined ID from frontend
        try:
            link_id = request.data.get('db_id')
            link = UserBroadcastLink.objects.get(id=link_id, user=request.user)
            link.is_read = True
            link.save()
            return Response({"status": "success", "message": "Broadcast marked as read"})
        except UserBroadcastLink.DoesNotExist:
            return Response({"error": "Broadcast link not found"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"status": "success", "message": "Notification marked as read"})
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    Mark all unread notifications and broadcasts for the user as read.
    """
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    UserBroadcastLink.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"status": "success", "message": "All marked as read"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """
    Delete a specific notification.
    """
    if str(notification_id).startswith('broadcast_'):
         try:
            link_id = request.data.get('db_id')
            UserBroadcastLink.objects.get(id=link_id, user=request.user).delete()
            return Response({"status": "success"})
         except:
             return Response({"error": "Failed to delete broadcast link"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.delete()
        return Response({"status": "success", "message": "Deleted"})
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """
    Get combined unread count.
    """
    n_count = Notification.objects.filter(user=request.user, is_read=False).count()
    b_count = UserBroadcastLink.objects.filter(user=request.user, is_read=False).count()
    return Response({"status": "success", "count": n_count + b_count})

# ─────────────────────────────────────────
# Admin Broadcast APIs
# ─────────────────────────────────────────

def dispatch_broadcast(broadcast):
    """
    Helper to deliver a broadcast to users.
    """
    with transaction.atomic():
        if broadcast.is_global:
            users = CustomUser.objects.all()
        else:
            users = broadcast.target_users.all()

        # Bulk create links for efficiency
        links = [
            UserBroadcastLink(user=user, broadcast=broadcast)
            for user in users
        ]
        UserBroadcastLink.objects.bulk_create(links, ignore_conflicts=True)
        
        broadcast.is_sent = True
        broadcast.save()

class AdminBroadcastListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        broadcasts = AdminBroadcast.objects.all().order_by('-created_at')
        serializer = AdminBroadcastSerializer(broadcasts, many=True)
        return Response({"status": "success", "data": serializer.data})

    def post(self, request):
        data = request.data
        try:
            with transaction.atomic():
                broadcast = AdminBroadcast.objects.create(
                    title=data['title'],
                    message=data['message'],
                    is_global=data.get('is_global', True),
                    created_by=request.user,
                    scheduled_at=data.get('scheduled_at')
                )
                
                if not broadcast.is_global:
                    user_ids = data.get('user_ids', [])
                    users = CustomUser.objects.filter(id__in=user_ids)
                    broadcast.target_users.set(users)

                # If no schedule, send immediately if requested or by default
                should_send = data.get('send_now', False)
                if should_send and not broadcast.scheduled_at:
                    dispatch_broadcast(broadcast)

                return Response({
                    "status": "success", 
                    "message": "Broadcast created",
                    "data": AdminBroadcastSerializer(broadcast).data
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminBroadcastDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request, pk):
        broadcast = get_object_or_404(AdminBroadcast, pk=pk)
        serializer = AdminBroadcastDetailSerializer(broadcast)
        return Response({"status": "success", "data": serializer.data})

    def delete(self, request, pk):
        broadcast = get_object_or_404(AdminBroadcast, pk=pk)
        broadcast.delete()
        return Response({"status": "success", "message": "Broadcast deleted"})

class AdminBroadcastSendView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def post(self, request, pk):
        broadcast = get_object_or_404(AdminBroadcast, pk=pk)
        if broadcast.is_sent:
            return Response({"status": "error", "message": "Already sent"}, status=status.HTTP_400_BAD_REQUEST)
        
        dispatch_broadcast(broadcast)
        return Response({"status": "success", "message": "Broadcast dispatched successfully"})

from django.shortcuts import get_object_or_404
