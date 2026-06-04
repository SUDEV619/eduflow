from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet, AdminStudySessionListView, AdminDashboardStatsView

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('sessions/', AdminStudySessionListView.as_view(), name='admin-sessions'),
    path('', include(router.urls)),
]
