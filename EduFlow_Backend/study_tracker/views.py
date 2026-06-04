from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Avg, Count, F
from datetime import timedelta
from .models import StudySession, DailyGoal
from mock_tests.models import TestAttempt
from notifications.utils import create_notification

class SaveStudySessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        subject_value = data.get("subject")
        valid_subjects = dict(StudySession.SUBJECT_CHOICES)
        if not subject_value or subject_value not in valid_subjects:
            return Response({"error": "Invalid or missing subject"}, status=status.HTTP_400_BAD_REQUEST)

        if not data.get("duration"):
            return Response({"error": "Missing duration"}, status=status.HTTP_400_BAD_REQUEST)

        session = StudySession.objects.create(
            user=request.user,
            subject=subject_value,
            duration=data["duration"],
            session_type=data.get("type", "custom"),
            date=timezone.now().date(),
            notes=data.get("notes", "")
        )

        # Create notification
        create_notification(
            request.user,
            "Session Completed 🎯",
            f"Your study session for {valid_subjects[subject_value]} ({data['duration']} mins) has been recorded successfully.",
            "study"
        )

        return Response({"status": "success", "message": "Session saved"}, status=status.HTTP_201_CREATED)

from django.db.models.functions import ExtractHour

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        time_range = request.query_params.get('range', 'weekly').lower()
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        if time_range == 'daily':
            start_date = today
        elif time_range == 'monthly':
            start_date = month_ago
        else: # weekly
            start_date = week_ago

        # 1. Overview Summary
        total_minutes = StudySession.objects.filter(user=user).aggregate(Sum('duration'))['duration__sum'] or 0
        today_minutes = StudySession.objects.filter(user=user, date=today).aggregate(Sum('duration'))['duration__sum'] or 0
        
        range_sessions = StudySession.objects.filter(user=user, date__gte=start_date)
        range_minutes = range_sessions.aggregate(Sum('duration'))['duration__sum'] or 0

        # Streak Calculation (always 30 days lookback for streak)
        streak = 0
        for i in range(30):
            day = today - timedelta(days=i)
            if StudySession.objects.filter(user=user, date=day).exists():
                streak += 1
            else:
                break
        
        # Focus Score (consistency + duration in the selected range)
        if time_range == 'daily':
            goal = 240 # 4 hours
        elif time_range == 'monthly':
            goal = 7200 # 120 hours
        else:
            goal = 1680 # 28 hours
            
        focus_score = min(100, int((range_minutes / goal) * 100)) if range_minutes > 0 else 0

        # 2. Study Trend
        if time_range == 'daily':
            trend_qs = StudySession.objects.filter(
                user=user, date=today
            ).annotate(hour=ExtractHour('created_at')).values('hour').annotate(total=Sum('duration')).order_by('hour')
            trend = [{"label": f"{item['hour']}:00", "total": item['total'], "date": today} for item in trend_qs]
        else:
            trend_qs = StudySession.objects.filter(
                user=user, date__gte=start_date
            ).values('date').annotate(total=Sum('duration')).order_by('date')
            trend = list(trend_qs)

        # 3. Subject-wise Analysis (filtered by range)
        subject_map = dict(StudySession.SUBJECT_CHOICES)
        subject_stats_qs = StudySession.objects.filter(user=user, date__gte=start_date).values('subject').annotate(total=Sum('duration'))
        subject_analysis = [
            {
                "subject": s['subject'],
                "subject_display": subject_map.get(s['subject'], s['subject']),
                "total": s['total']
            } for s in subject_stats_qs
        ]

        # 4. Performance Metrics (Mock Tests)
        attempts = TestAttempt.objects.filter(user=user, submitted_at__isnull=False)
        
        perf_data = []
        total_accuracy = 0
        completed_count = attempts.count()
        
        for attempt in attempts:
            test_total_marks = attempt.mock_test.questions.aggregate(Sum('marks'))['marks__sum'] or 1
            accuracy = (attempt.score / test_total_marks) * 100 if attempt.score is not None else 0
            total_accuracy += accuracy
            perf_data.append({
                "test": attempt.mock_test.title,
                "subject": attempt.mock_test.subject,
                "score": attempt.score,
                "total_marks": test_total_marks,
                "accuracy": accuracy,
                "date": attempt.submitted_at
            })

        avg_accuracy = (total_accuracy / completed_count) if completed_count > 0 else 0
        
        subject_scores = {}
        for p in perf_data:
            sub = p['subject']
            if sub not in subject_scores:
                subject_scores[sub] = []
            subject_scores[sub].append(p['accuracy'])
        
        performance_summary = {
            "accuracy": avg_accuracy,
            "completion_rate": 100 if completed_count > 0 else 0,
            "subject_performances": [
                {"subject": sub, "avg_accuracy": sum(accs)/len(accs)} 
                for sub, accs in subject_scores.items()
            ]
        }

        # 5. Heatmap Data (Last 30 Days)
        heatmap = list(StudySession.objects.filter(
            user=user, date__gte=month_ago
        ).values('date').annotate(total=Sum('duration')).order_by('date'))

        # 6. Insights & Suggestions
        insights = []
        if today_minutes < 60:
            insights.append("You studied less today. Try a 45-minute deep work session.")
        if streak >= 5:
            insights.append(f"Great consistency! {streak} day streak 🔥")
        if avg_accuracy < 60 and completed_count > 0:
            insights.append("Focus on accuracy improvement in your mock tests.")
        
        # Original code used weekly_sessions which I replaced with range_sessions if range is weekly
        # But for insights we probably always want to check the last week
        weekly_sessions_exists = StudySession.objects.filter(user=user, date__gte=week_ago).exists()
        if not weekly_sessions_exists:
            insights.append("Start your first session of the week to build momentum!")

        next_step = "Plan a deep work block on your weakest subject."
        if subject_analysis:
            weakest = min(subject_analysis, key=lambda x: x['total'])
            next_step = f"Focus more on {weakest['subject_display']} next - it has your lowest study time."

        return Response({
            "overview": {
                "total_hours": round(total_minutes / 60, 2),
                "today_minutes": today_minutes,
                "range_hours": round(range_minutes / 60, 2), # Using range_hours instead of weekly_hours
                "focus_score": focus_score,
                "streak": streak
            },
            "study_trend": trend,
            "subject_analysis": subject_analysis,
            "performance": performance_summary,
            "heatmap": heatmap,
            "insights": insights,
            "next_step": next_step
        })

class DailyProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        today = timezone.now().date()
        total = StudySession.objects.filter(user=request.user, date=today).aggregate(Sum('duration'))['duration__sum'] or 0
        return Response({"daily_minutes": total, "daily_hours": round(total / 60, 2)})

class WeeklyProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        today = timezone.now().date()
        last_week = today - timedelta(days=7)
        sessions = StudySession.objects.filter(user=request.user, date__gte=last_week).values('date').annotate(total=Sum('duration')).order_by('date')
        return Response({"status": "success", "data": list(sessions)})

class SubjectStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        stats = StudySession.objects.filter(user=request.user).values('subject').annotate(total=Sum('duration')).order_by('-total')
        subject_map = dict(StudySession.SUBJECT_CHOICES)
        formatted_data = [{"subject": item['subject'], "subject_display": subject_map.get(item['subject'], item['subject']), "total": item['total']} for item in stats]
        return Response({"status": "success", "data": formatted_data})

class QuickStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user)
        total_minutes = sessions.aggregate(Sum('duration'))['duration__sum'] or 0
        total_sessions = sessions.count()
        today = timezone.now().date()
        last_7_days = today - timedelta(days=7)
        recent_total = sessions.filter(date__gte=last_7_days).aggregate(Sum('duration'))['duration__sum'] or 0
        avg_per_day = round(recent_total / 7, 2)
        return Response({"total_hours": round(total_minutes / 60, 2), "total_sessions": total_sessions, "avg_minutes_per_day": avg_per_day})
