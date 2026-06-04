from django.db import models
from django.conf import settings

class StudyCircle(models.Model):
    RESOURCE_PERMISSIONS = [
        ('admin_only', 'Admin Only'),
        ('all_members', 'All Members')
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    subject = models.CharField(max_length=100, blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_circles')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_circles')
    
    is_private = models.BooleanField(default=False)
    allow_join_requests = models.BooleanField(default=True)
    
    # Moderation
    is_active = models.BooleanField(default=True)
    
    # New Settings
    resource_permissions = models.CharField(max_length=20, choices=RESOURCE_PERMISSIONS, default='all_members')
    discussion_enabled = models.BooleanField(default=True)
    discussion_restricted_to_admin = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserCircleSettings(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    circle = models.ForeignKey(StudyCircle, on_delete=models.CASCADE, related_name='user_settings')
    
    notify_messages = models.BooleanField(default=True)
    notify_resources = models.BooleanField(default=True)
    notify_join_requests = models.BooleanField(default=True) # Only relevant for admins
    
    class Meta:
        unique_together = ('user', 'circle')

    def __str__(self):
        return f"Settings for {self.user.email} in {self.circle.name}"

class Message(models.Model):
    circle = models.ForeignKey(StudyCircle, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.email}: {self.content[:20]}"

class Resource(models.Model):
    circle = models.ForeignKey(StudyCircle, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resources/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class JoinRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ]
    
    circle = models.ForeignKey(StudyCircle, on_delete=models.CASCADE, related_name='join_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_circle_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('circle', 'user')

    def __str__(self):
        return f"{self.user.email} -> {self.circle.name} ({self.status})"

class Report(models.Model):
    REPORT_TYPES = [
        ('circle', 'Circle'),
        ('member', 'Member')
    ]
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_sent')
    circle = models.ForeignKey(StudyCircle, on_delete=models.CASCADE, related_name='reports')
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_received')
    
    report_type = models.CharField(max_length=10, choices=REPORT_TYPES)
    message = models.TextField()
    
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter.email} - {self.report_type}"
