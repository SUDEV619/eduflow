from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import StudyCircle, Message, Resource, JoinRequest, UserCircleSettings, Report
from .serializers import (
    StudyCircleSerializer, MessageSerializer, ResourceSerializer, 
    UserSerializer, JoinRequestSerializer, UserCircleSettingsSerializer,
    ReportSerializer
)
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from notifications.utils import create_notification
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

class IsMemberPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        circle_id = view.kwargs.get('circle_id')
        if not circle_id:
            return True
        
        circle = get_object_or_404(StudyCircle, id=circle_id)
        is_member = circle.members.filter(id=request.user.id).exists()
        return is_member

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, StudyCircle):
            return obj.members.filter(id=request.user.id).exists()
        return obj.circle.members.filter(id=request.user.id).exists()

class IsCircleAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        circle_id = view.kwargs.get('circle_id')
        if not circle_id:
            return True
        circle = get_object_or_404(StudyCircle, id=circle_id)
        return circle.created_by == request.user

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, StudyCircle):
            return obj.created_by == request.user
        return obj.circle.created_by == request.user

class StudyCircleListCreateView(generics.ListCreateAPIView):
    queryset = StudyCircle.objects.all().order_by('-created_at')
    serializer_class = StudyCircleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        user = request.user
        search_query = request.query_params.get('search', '')
        
        base_queryset = self.get_queryset()
        if search_query:
            base_queryset = base_queryset.filter(
                Q(name__icontains=search_query) | 
                Q(subject__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        if not user.is_authenticated:
            return Response({
                "my_circles": [],
                "joined_circles": [],
                "all_circles": self.get_serializer(base_queryset, many=True).data
            })

        # Circles created by user
        my_circles = base_queryset.filter(created_by=user)

        # Circles user joined (excluding created ones)
        joined_circles = base_queryset.filter(members=user).exclude(created_by=user)

        # All circles (optionally excluding joined ones if requested, but user said "All")
        all_circles = base_queryset

        return Response({
            "my_circles": self.get_serializer(my_circles, many=True).data,
            "joined_circles": self.get_serializer(joined_circles, many=True).data,
            "all_circles": self.get_serializer(all_circles, many=True).data
        })

    def perform_create(self, serializer):
        # 🔥 REQUIRED - Ensure creator is added as member
        circle = serializer.save(created_by=self.request.user)
        circle.members.add(self.request.user)

class StudyCircleDetailView(generics.RetrieveAPIView):
    queryset = StudyCircle.objects.all()
    serializer_class = StudyCircleSerializer
    permission_classes = [permissions.IsAuthenticated]

# Join Request APIs
class StudyCircleRequestJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            circle = get_object_or_404(StudyCircle, pk=pk)
            user = request.user
            
            if circle.created_by == user:
                return Response({"error": "Creator is already the admin", "status": "is_creator"}, status=status.HTTP_400_BAD_REQUEST)

            if circle.members.filter(id=user.id).exists():
                return Response({"message": "Already a member", "status": "member"}, status=status.HTTP_200_OK)
            
            # Mandatory Approval Workflow: Create or update request regardless of circle privacy
            jr, created = JoinRequest.objects.get_or_create(circle=circle, user=user)
            
            if not created:
                if jr.status == 'pending':
                    return Response({"error": "Request already pending", "status": "pending"}, status=status.HTTP_400_BAD_REQUEST)
                elif jr.status == 'approved':
                    # Safety check: if approved but not in members for some reason
                    if not circle.members.filter(id=user.id).exists():
                        circle.members.add(user)
                    return Response({"message": "You are already a member", "status": "member"})
                elif jr.status == 'rejected':
                    jr.status = 'pending'
                    jr.save()
                    return Response({"message": "Request re-sent", "status": "request_sent"})

            # Notify circle creator
            create_notification(
                circle.created_by,
                "New Join Request",
                f"{user.name} wants to join your study circle '{circle.name}'.",
                "circle"
            )

            return Response({"message": "Join request sent successfully", "status": "request_sent"})
        except Exception as e:
            print(f"JOIN REQUEST ERROR: {str(e)}")
            return Response({"error": "An internal server error occurred while processing your request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_membership_status(request, circle_id):
    """
    Check the current user's membership or request status for a circle.
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)
    user = request.user

    if circle.created_by == user:
        return Response({"status": "admin"})
    
    if circle.members.filter(id=user.id).exists():
        return Response({"status": "member"})

    jr = JoinRequest.objects.filter(circle=circle, user=user).first()
    if jr:
        return Response({"status": jr.status})

    return Response({"status": "not_joined"})

class JoinRequestListView(generics.ListAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsCircleAdminPermission]

    def get_queryset(self):
        circle_id = self.kwargs.get('circle_id')
        return JoinRequest.objects.filter(circle_id=circle_id, status='pending').order_by('-created_at')

class ApproveJoinRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        jr = get_object_or_404(JoinRequest, pk=pk)
        if jr.circle.created_by != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # 🔥 CRITICAL FIX – Add user to members
        jr.status = 'approved'
        jr.save()
        jr.circle.members.add(jr.user)

        # Notify user
        create_notification(
            jr.user,
            "Request Approved ✅",
            f"You have been added to the study circle '{jr.circle.name}'.",
            "circle"
        )
        
        return Response({"status": "approved", "message": "Request approved and user added to circle."})

class RejectJoinRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        jr = get_object_or_404(JoinRequest, pk=pk)
        if jr.circle.created_by != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        jr.status = 'rejected'
        jr.save()
        return Response({"status": "rejected", "message": "Request rejected"})

# Discussion APIs
class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        circle_id = self.kwargs.get('circle_id')
        circle = get_object_or_404(StudyCircle, id=circle_id)
        
        if not circle.members.filter(id=self.request.user.id).exists():
             raise PermissionDenied("You are not a member of this circle")
             
        return Message.objects.filter(circle_id=circle_id).order_by('created_at')

    def post(self, request, *args, **kwargs):
        circle_id = self.kwargs.get('circle_id')
        circle = get_object_or_404(StudyCircle, id=circle_id)

        # 🔥 DEBUG LOGS (VERY IMPORTANT)
        print("==== SEND MESSAGE DEBUG ====")
        print("Request User ID:", request.user.id)
        print("Circle ID:", circle_id)
        print("Circle Creator:", circle.created_by.id)
        member_ids = list(circle.members.values_list('id', flat=True))
        print("Members:", member_ids)
        print("================================")

        # ✅ Membership check (optimized)
        is_member = request.user.id in member_ids

        if not is_member:
            return Response(
                {
                    "error": "You are not a member of this circle",
                    "user_id": request.user.id,
                    "members": member_ids
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ Validate message content
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Create message
        message = Message.objects.create(
            circle=circle,
            sender=request.user,
            content=content
        )

        # Notify other members
        for member in circle.members.exclude(id=request.user.id):
            create_notification(
                member,
                "New Message in Circle",
                f"New message from {request.user.name} in '{circle.name}'.",
                "circle"
            )

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Resource Vault APIs
class ResourceListView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsMemberPermission]

    def get_queryset(self):
        circle_id = self.kwargs.get('circle_id')
        return Resource.objects.filter(circle_id=circle_id).order_by('-created_at')

    def perform_create(self, serializer):
        circle_id = self.kwargs.get('circle_id')
        circle = get_object_or_404(StudyCircle, id=circle_id)
        serializer.save(uploaded_by=self.request.user, circle=circle)

class ResourceDeleteView(generics.DestroyAPIView):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.uploaded_by == self.request.user or instance.circle.created_by == self.request.user:
            instance.delete()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this resource.")

# Members APIs
class MemberListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsMemberPermission]

    def get(self, request, circle_id):
        circle = get_object_or_404(StudyCircle, id=circle_id)
        members = circle.members.all()
        
        member_data = []
        for user in members:
            member_data.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_admin": user == circle.created_by
            })
            
        return Response({"status": "success", "data": member_data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_circle(request, circle_id):
    """
    Remove the authenticated user from the study circle.
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)
    
    if circle.created_by == request.user:
        return Response({"error": "Creator cannot leave the circle. Transfer ownership or delete the circle instead."}, status=status.HTTP_400_BAD_REQUEST)
    
    if not circle.members.filter(id=request.user.id).exists():
        return Response({"error": "You are not a member of this circle."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Remove from members
    circle.members.remove(request.user)
    
    # 🔥 Delete join request so they can join again/fresh if they want
    JoinRequest.objects.filter(circle=circle, user=request.user).delete()
    
    return Response({"status": "success", "message": "You have left the circle."})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_member(request, circle_id):
    """
    Remove a member from the study circle (Admin only).
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)
    
    if circle.created_by != request.user:
        return Response({"error": "Only the circle creator can remove members."}, status=status.HTTP_403_FORBIDDEN)
    
    user_id = request.data.get("user_id")
    if not user_id:
        return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    user_to_remove = get_object_or_404(circle.members, id=user_id)
    
    if user_to_remove == circle.created_by:
        return Response({"error": "Cannot remove the admin."}, status=status.HTTP_400_BAD_REQUEST)
        
    circle.members.remove(user_to_remove)
    return Response({"status": "success", "message": f"Member {user_to_remove.name} has been removed."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_circle_settings(request, circle_id):
    """
    Fetch settings for a specific study circle.
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)

    # Only members can view settings
    if not circle.members.filter(id=request.user.id).exists():
        return Response({"error": "Access denied. You are not a member of this circle."}, status=status.HTTP_403_FORBIDDEN)

    serializer = StudyCircleSerializer(circle, context={'request': request})
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_circle_settings(request, circle_id):
    """
    Update settings for a specific study circle. Only creator can edit.
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)

    # Only creator can update settings
    if circle.created_by != request.user:
        return Response({"error": "Only the circle creator can update settings."}, status=status.HTTP_403_FORBIDDEN)

    circle.name = request.data.get("name", circle.name)
    circle.description = request.data.get("description", circle.description)
    circle.subject = request.data.get("subject", circle.subject)
    
    if "is_private" in request.data:
        circle.is_private = request.data["is_private"]
    
    if "allow_join_requests" in request.data:
        circle.allow_join_requests = request.data["allow_join_requests"]

    if "resource_permissions" in request.data:
        circle.resource_permissions = request.data["resource_permissions"]
    
    if "discussion_enabled" in request.data:
        circle.discussion_enabled = request.data["discussion_enabled"]
    
    if "discussion_restricted_to_admin" in request.data:
        circle.discussion_restricted_to_admin = request.data["discussion_restricted_to_admin"]

    circle.save()

    return Response({"status": "success", "message": "Settings updated successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_notification_settings(request, circle_id):
    """
    Update notification settings for the current user in a specific circle.
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)
    settings, _ = UserCircleSettings.objects.get_or_create(user=request.user, circle=circle)
    
    if "notify_messages" in request.data:
        settings.notify_messages = request.data["notify_messages"]
    if "notify_resources" in request.data:
        settings.notify_resources = request.data["notify_resources"]
    if "notify_join_requests" in request.data:
        settings.notify_join_requests = request.data["notify_join_requests"]
        
    settings.save()
    return Response({"status": "success", "message": "Notification settings updated"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_circle(request, circle_id):
    """
    Delete a study circle (Admin only).
    """
    circle = get_object_or_404(StudyCircle, id=circle_id)
    if circle.created_by != request.user:
        return Response({"error": "Only the circle creator can delete it."}, status=status.HTTP_403_FORBIDDEN)
    
    circle.delete()
    return Response({"status": "success", "message": "Circle deleted successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_report(request):
    """
    Submit a report against a circle or a member.
    """
    user = request.user
    report_type = request.data.get('type')
    circle_id = request.data.get('circle_id')
    reported_user_id = request.data.get('user_id')
    message = request.data.get('message')

    if not circle_id or not report_type or not message:
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    circle = get_object_or_404(StudyCircle, id=circle_id)

    # Security: Reporter must be a member
    if not circle.members.filter(id=user.id).exists():
        return Response({"error": "You must be a member to report"}, status=status.HTTP_403_FORBIDDEN)

    if report_type == 'circle' and circle.created_by == user:
        return Response({"error": "You cannot report your own circle"}, status=status.HTTP_400_BAD_REQUEST)

    reported_user = None
    if report_type == 'member' and reported_user_id:
        reported_user = get_object_or_404(circle.members, id=reported_user_id)

    report = Report.objects.create(
        reporter=user,
        circle=circle,
        reported_user=reported_user,
        report_type=report_type,
        message=message
    )

    # Auto Moderation Logic
    if report_type == 'circle':
        unique_reports = Report.objects.filter(circle=circle, report_type='circle').values('reporter').distinct().count()
        if unique_reports >= 5:
            circle.is_active = False
            circle.save()
            
            # Notify Creator
            create_notification(
                circle.created_by,
                "Circle Disabled 🚫",
                f"Your study circle '{circle.name}' has been automatically disabled due to multiple reports. Contact support for review.",
                "system"
            )

    # ✅ Notify all admins (is_staff=True)
    from accounts.models import CustomUser
    admins = CustomUser.objects.filter(is_staff=True)

    title = "🚩 New Report Submitted"
    
    if report_type == "member" and reported_user:
        target = reported_user.name or reported_user.email
        message_body = f"{user.name} reported user: {target}"
    else:
        target = circle.name
        message_body = f"{user.name} reported circle: {target}"

    # Create global-like notifications for all admins
    for admin in admins:
        create_notification(
            admin,
            title,
            message_body,
            "admin",
            link=f"/admin/reports/{report.id}"
        )

    # Also keep existing notification to circle creator for member reports
    if report_type == 'member' and reported_user:
        create_notification(
            circle.created_by,
            "Member Reported 🚩",
            f"{user.name} reported {reported_user.name} in '{circle.name}'.",
            "circle"
        )

    return Response({"status": "success", "message": "Report submitted successfully"})
