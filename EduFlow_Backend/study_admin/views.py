from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import CustomUser
from study_tracker.models import StudySession
from mock_tests.models import MockTest
from .serializers import AdminUserSerializer, AdminStudySessionSerializer
from .permissions import IsAdminUserRole
from django.db.models import Count, Sum

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserRole]

class AdminStudySessionListView(generics.ListAPIView):
    queryset = StudySession.objects.all()
    serializer_class = AdminStudySessionSerializer
    permission_classes = [IsAdminUserRole]

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_users = CustomUser.objects.count()
        active_users = CustomUser.objects.filter(is_active=True).count()
        total_study_minutes = StudySession.objects.aggregate(total=Sum('duration'))['total'] or 0
        total_mock_tests = MockTest.objects.count()
        
        return Response({
            "status": "success",
            "data": {
                "total_users": total_users,
                "active_users": active_users,
                "total_study_hours": round(total_study_minutes / 60, 1),
                "total_mock_tests": total_mock_tests
            }
        })
