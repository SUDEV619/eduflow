from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from study_tracker.models import StudySession
from mock_tests.models import TestAttempt
from study_circles.models import StudyCircle
from notifications.models import Notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    user = request.user
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)

    # ------------------ STUDY DATA ------------------
    sessions = StudySession.objects.filter(user=user)

    total_minutes = sessions.aggregate(
        Sum('duration')
    )['duration__sum'] or 0
    total_hours = round(total_minutes / 60, 2)

    today_minutes = sessions.filter(date=today).aggregate(
        Sum('duration')
    )['duration__sum'] or 0
    today_hours = round(today_minutes / 60, 2)

    weekly_sessions = sessions.filter(date__gte=week_ago)

    # 🔥 Streak Calculation
    streak = 0
    for i in range(30):
        day = today - timedelta(days=i)
        if StudySession.objects.filter(user=user, date=day).exists():
            streak += 1
        else:
            break

    # 🎯 Focus Score (consistency + duration in the last 7 days)
    # Goal: 28 hours a week (4 hours/day)
    weekly_minutes = weekly_sessions.aggregate(
        Sum('duration')
    )['duration__sum'] or 0
    goal_minutes = 1680 # 28 hours
    focus_score = min(100, int((weekly_minutes / goal_minutes) * 100)) if weekly_minutes > 0 else 0

    # ------------------ MOCK TEST ------------------
    attempts = TestAttempt.objects.filter(user=user, submitted_at__isnull=False)
    recent_attempts = attempts.order_by('-submitted_at')[:5]

    # ------------------ STUDY CIRCLES ------------------
    circles = StudyCircle.objects.filter(members=user)
    recent_circles = circles.order_by('-created_at')[:5]

    # ------------------ NOTIFICATIONS ------------------
    notifications = Notification.objects.filter(user=user)
    unread_count = notifications.filter(is_read=False).count()
    recent_notifications = notifications.order_by('-created_at')[:5]

    # ------------------ TREND (Last 7 Days) ------------------
    trend_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_total = sessions.filter(date=day).aggregate(Sum('duration'))['duration__sum'] or 0
        trend_data.append({
            "date": day,
            "total": day_total
        })
    trend_data.reverse()

    # ------------------ RESPONSE ------------------
    return Response({
        "overview": {
            "total_hours": total_hours,
            "today_hours": today_hours,
            "today_minutes": today_minutes,
            "streak": streak,
            "focus_score": focus_score,
            "unread_notifications": unread_count
        },
        "recent_activity": {
            "study_sessions": [
                {
                    "id": s.id,
                    "subject": s.subject,
                    "subject_display": s.get_subject_display(),
                    "duration": s.duration,
                    "date": s.date,
                    "created_at": s.created_at
                } for s in sessions.order_by('-created_at')[:5]
            ],
            "mock_tests": [
                {
                    "id": m.id,
                    "test_title": m.mock_test.title,
                    "score": m.score,
                    "date": m.submitted_at
                } for m in recent_attempts
            ]
        },
        "circles": [
            {
                "id": c.id,
                "name": c.name,
                "members_count": c.members.count(),
                "subject": c.subject
            } for c in recent_circles
        ],
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "is_read": n.is_read,
                "created_at": n.created_at
            } for n in recent_notifications
        ],
        "trend": trend_data
    })
