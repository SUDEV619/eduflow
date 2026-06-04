from django.urls import path
from . import views

urlpatterns = [
    path('', views.StudyCircleListCreateView.as_view(), name='circle-list'),
    path('<int:pk>/', views.StudyCircleDetailView.as_view(), name='circle-detail'),
    path('<int:pk>/request-join/', views.StudyCircleRequestJoinView.as_view(), name='circle-request-join'),
    path('<int:circle_id>/status/', views.check_membership_status, name='circle-status'),
    path('<int:circle_id>/join-requests/', views.JoinRequestListView.as_view(), name='circle-join-requests'),
    path('join-requests/<int:pk>/approve/', views.ApproveJoinRequestView.as_view(), name='join-request-approve'),
    path('join-requests/<int:pk>/reject/', views.JoinRequestListView.as_view(), name='join-request-reject'), # Reuse ListView for rejection by JR ID
    path('join-requests-action/<int:pk>/reject/', views.RejectJoinRequestView.as_view(), name='join-request-reject-action'),
    path('<int:circle_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('<int:circle_id>/resources/', views.ResourceListView.as_view(), name='resource-list'),
    path('resources/<int:pk>/', views.ResourceDeleteView.as_view(), name='resource-delete'),
    path('<int:circle_id>/members/', views.MemberListView.as_view(), name='member-list'),
    path('<int:circle_id>/leave/', views.leave_circle, name='leave-circle'),
    path('<int:circle_id>/remove-member/', views.remove_member, name='remove-member'),
    path('<int:circle_id>/settings/', views.get_circle_settings, name='get-circle-settings'),
    path('<int:circle_id>/settings/update/', views.update_circle_settings, name='update-circle-settings'),
    path('<int:circle_id>/settings/notifications/', views.update_user_notification_settings, name='update-notification-settings'),
    path('<int:circle_id>/delete/', views.delete_circle, name='delete-circle'),
    path('report/', views.submit_report, name='submit-report'),
]
