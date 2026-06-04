from django.urls import path
from .views import (
    AdminDashboardStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusView,
    AdminStudySessionListView,
    AdminMockTestListCreateView,
    AdminMockTestDetailView,
    AdminQuestionListView,
    AdminQuestionDetailView,
    AdminQuestionBulkDeleteView,
    AdminQuestionCSVUploadView,
    AdminMockTestAddQuestionsView,
    AdminMockTestBulkAddQuestionsView,
    AdminMockTestSetQuestionsView,
    AdminAnalyticsView,
    AdminStudyCircleListView,
    AdminStudyCircleDetailView,
    AdminStudyMaterialListCreateView,
    AdminStudyMaterialDetailView,
    get_materials,
    download_material,
    toggle_favorite,
    AdminSettingsView,
    AdminUpdateSettingsView,
    AdminRolePermissionListView,
    AdminAPIKeyListView,
)

urlpatterns = [
    # ── Dashboard ──────────────────────────────────
    path('stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),

    # ── User Management ────────────────────────────
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/status/', AdminUserStatusView.as_view(), name='admin-user-status'),

    # ── Study Circle Management ───────────────────
    path('circles/', AdminStudyCircleListView.as_view(), name='admin-circle-list'),
    path('circles/<int:pk>/', AdminStudyCircleDetailView.as_view(), name='admin-circle-detail'),

    # ── Mock Test Management ───────────────────────
    path('mocktests/', AdminMockTestListCreateView.as_view(), name='admin-mocktest-list'),
    path('mocktests/<int:pk>/', AdminMockTestDetailView.as_view(), name='admin-mocktest-detail'),
    path('mocktests/<int:pk>/add-questions/', AdminMockTestAddQuestionsView.as_view(), name='admin-mocktest-add-questions'),
    path('mocktests/<int:pk>/bulk-add-questions/', AdminMockTestBulkAddQuestionsView.as_view(), name='admin-mocktest-bulk-add-questions'),
    path('mocktests/<int:pk>/set-questions/', AdminMockTestSetQuestionsView.as_view(), name='admin-mocktest-set-questions'),

    # ── Question Bank Management ───────────────────
    path('questions/', AdminQuestionListView.as_view(), name='admin-question-list'),
    path('questions/bulk-delete/', AdminQuestionBulkDeleteView.as_view(), name='admin-question-bulk-delete'),
    path('questions/<int:pk>/', AdminQuestionDetailView.as_view(), name='admin-question-detail'),
    path('questions/upload-csv/', AdminQuestionCSVUploadView.as_view(), name='admin-question-upload'),

    # ── Study Materials (Admin) ────────────────────
    path('materials/', AdminStudyMaterialListCreateView.as_view(), name='admin-material-list'),
    path('materials/<int:pk>/', AdminStudyMaterialDetailView.as_view(), name='admin-material-detail'),

    # ── Study Materials (User) ─────────────────────
    path('user/materials/', get_materials, name='user-material-list'),
    path('user/materials/<int:id>/download/', download_material, name='user-material-download'),
    path('user/materials/<int:id>/favorite/', toggle_favorite, name='user-material-favorite'),

    # ── System Settings ───────────────────────────
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('settings/update/', AdminUpdateSettingsView.as_view(), name='admin-settings-update'),
    path('settings/roles/', AdminRolePermissionListView.as_view(), name='admin-roles'),
    path('settings/apikeys/', AdminAPIKeyListView.as_view(), name='admin-apikeys'),
    path('settings/apikeys/<int:pk>/', AdminAPIKeyListView.as_view(), name='admin-apikey-detail'),

    # ── Study Sessions ─────────────────────────────
    path('sessions/', AdminStudySessionListView.as_view(), name='admin-sessions'),

    # ── Analytics ──────────────────────────────────
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]
