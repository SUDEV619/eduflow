from django.urls import path
from .views import (
    SaveStudySessionView, 
    DailyProgressView, 
    WeeklyProgressView, 
    SubjectStatsView, 
    QuickStatsView,
    AnalyticsView
)

urlpatterns = [
    path('save/', SaveStudySessionView.as_view(), name='study-save'),
    path('daily/', DailyProgressView.as_view(), name='study-daily'),
    path('weekly/', WeeklyProgressView.as_view(), name='study-weekly'),
    path('subjects/', SubjectStatsView.as_view(), name='study-subjects'),
    path('stats/', QuickStatsView.as_view(), name='study-stats'),
    path('analytics/', AnalyticsView.as_view(), name='study-analytics'),
]
