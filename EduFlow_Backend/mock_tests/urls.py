from django.urls import path
from .views import (
    MockTestListView, 
    MockTestDetailView, 
    StartAttemptView, 
    SubmitAttemptView,
    UserAttemptsView
)

urlpatterns = [
    path('attempts/history/', UserAttemptsView.as_view(), name='attempt-history'),
    path('attempts/<int:pk>/submit/', SubmitAttemptView.as_view(), name='submit-attempt'),
    path('', MockTestListView.as_view(), name='mock-test-list'),
    path('<str:id>/', MockTestDetailView.as_view(), name='mock-test-detail'),
    path('<str:pk>/attempt/', StartAttemptView.as_view(), name='start-attempt'),
]
