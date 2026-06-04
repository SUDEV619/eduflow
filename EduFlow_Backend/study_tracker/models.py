from django.db import models
from django.conf import settings
from django.utils import timezone

class StudySession(models.Model):
    SESSION_TYPES = [
        ('pomodoro', 'Pomodoro'),
        ('short_break', 'Short Break'),
        ('long_break', 'Long Break'),
        ('custom', 'Custom')
    ]

    SUBJECT_CHOICES = [
        ("quantitative_aptitude", "Quantitative Aptitude"),
        ("general_reasoning", "General Reasoning"),
        ("english", "English"),
        ("history", "History"),
        ("geography", "Geography"),
        ("polity", "Polity"),
        ("economy", "Economy"),
        ("general_science", "General Science"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_sessions_new')
    
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    duration = models.FloatField()  # in minutes
    
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES)
    notes = models.TextField(blank=True)
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.get_subject_display()} ({self.duration}m)"

class DailyGoal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_goals')
    target_hours = models.FloatField(default=4.0)
    date = models.DateField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.email} - {self.date} ({self.target_hours}h)"
