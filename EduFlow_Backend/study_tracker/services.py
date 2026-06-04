from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta
from .models import StudySession, DailyStats, Subject

def get_study_analytics(user):
    today = timezone.now().date()
    start_of_week = today - timedelta(days=today.weekday())
    
    # Today's minutes
    today_minutes = StudySession.objects.filter(
        user=user, 
        start_time__date=today
    ).aggregate(total=Sum('duration'))['total'] or 0
    
    # Weekly minutes
    weekly_minutes = StudySession.objects.filter(
        user=user, 
        start_time__date__gte=start_of_week
    ).aggregate(total=Sum('duration'))['total'] or 0
    
    # Subject distribution
    subject_distribution = StudySession.objects.filter(
        user=user
    ).values('subject__name').annotate(
        minutes=Sum('duration')
    ).order_by('-minutes')
    
    distribution_data = [
        {"subject": item['subject__name'], "minutes": item['minutes']} 
        for item in subject_distribution
    ]
    
    # Daily trend (last 7 days)
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    daily_trend = []
    
    # Efficiently fetch stats for the range
    stats_map = {
        stat.date: stat.total_minutes 
        for stat in DailyStats.objects.filter(user=user, date__in=last_7_days)
    }
    
    for date in last_7_days:
        daily_trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "minutes": stats_map.get(date, 0)
        })
        
    return {
        "today_minutes": today_minutes,
        "weekly_minutes": weekly_minutes,
        "subject_distribution": distribution_data,
        "daily_trend": daily_trend
    }

def update_daily_stats(user, date, duration):
    stats, created = DailyStats.objects.get_or_create(user=user, date=date)
    stats.total_minutes += duration
    stats.save()
