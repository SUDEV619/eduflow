from django.urls import path
from . import views

urlpatterns = [
    # User side
    path('', views.get_notifications, name='get_notifications'),
    path('mark-read/<str:notification_id>/', views.mark_as_read, name='mark_as_read'),
    path('mark-all-read/', views.mark_all_read, name='mark_all_read'),
    path('delete/<str:notification_id>/', views.delete_notification, name='delete_notification'),
    path('unread-count/', views.unread_count, name='unread_count'),

    # Admin side
    path('admin/notifications/', views.AdminBroadcastListView.as_view(), name='admin-notifications-list'),
    path('admin/notifications/unread-count/', views.unread_count, name='admin-unread-count'),
    path('admin/notifications/<int:pk>/', views.AdminBroadcastDetailView.as_view(), name='admin-notification-detail'),
    path('admin/notifications/<int:pk>/send/', views.AdminBroadcastSendView.as_view(), name='admin-notification-send'),
]
