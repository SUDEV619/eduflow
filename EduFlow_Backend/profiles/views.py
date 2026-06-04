from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import UserProfile
from study_tracker.models import StudySession
from mock_tests.models import TestAttempt
from study_circles.models import StudyCircle

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Fetch the profile data for the authenticated user.
    """
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    return Response({
        "name": profile.name or request.user.name,
        "email": request.user.email,
        "photo": request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None,
        "description": profile.description,
        "role": request.user.role,
        "date_joined": request.user.date_joined
    })

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update the profile data for the authenticated user.
    """
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if "name" in request.data:
        profile.name = request.data["name"]
        # Also update the name in CustomUser model
        request.user.name = request.data["name"]
        request.user.save()
        
    if "description" in request.data:
        profile.description = request.data["description"]
            
    if request.FILES.get("profile_photo"):
        profile.profile_photo = request.FILES["profile_photo"]
        
    profile.save()
    
    return Response({
        "status": "updated",
        "name": profile.name,
        "photo": request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None,
        "description": profile.description
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats(request):
    """
    Calculate performance stats for the profile.
    """
    user = request.user
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)

    sessions = StudySession.objects.filter(user=user)

    total_minutes = sessions.aggregate(Sum('duration'))['duration__sum'] or 0
    total_hours = round(total_minutes / 60, 2)

    today_minutes = sessions.filter(date=today).aggregate(Sum('duration'))['duration__sum'] or 0
    today_hours = round(today_minutes / 60, 2)

    weekly_minutes = sessions.filter(date__gte=week_ago).aggregate(Sum('duration'))['duration__sum'] or 0
    weekly_hours = round(weekly_minutes / 60, 2)

    # Daily Average
    days_count = sessions.values('date').distinct().count() or 1
    daily_avg_minutes = total_minutes / days_count
    daily_avg_hours = round(daily_avg_minutes / 60, 2)

    # Streak
    streak = 0
    for i in range(30):
        day = today - timedelta(days=i)
        if sessions.filter(date=day).exists():
            streak += 1
        else:
            break

    return Response({
        "total_hours": total_hours,
        "daily_average": daily_avg_hours,
        "weekly_progress": weekly_hours,
        "streak": streak,
        "today_hours": today_hours
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_timeline(request):
    """
    Generate an activity timeline for the user.
    """
    user = request.user

    # Study Sessions
    sessions = StudySession.objects.filter(user=user).order_by('-created_at')[:20]
    
    # Mock Test Attempts
    attempts = TestAttempt.objects.filter(user=user, submitted_at__isnull=False).order_by('-submitted_at')[:20]

    timeline = []

    for s in sessions:
        timeline.append({
            "type": "study",
            "date": s.created_at,
            "title": "Study Session",
            "text": f"Studied {s.get_subject_display()} for {int(s.duration)} mins"
        })

    for a in attempts:
        timeline.append({
            "type": "mock",
            "date": a.submitted_at,
            "title": "Mock Test",
            "text": f"Completed '{a.mock_test.title}' and scored {a.score}"
        })

    # Sort by date descending
    timeline = sorted(timeline, key=lambda x: x['date'], reverse=True)

    return Response({"timeline": timeline[:20]})
