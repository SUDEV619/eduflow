from django.db import models
from django.conf import settings

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    OPTION_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ]
    SUBJECT_CHOICES = [
        ('quantitative_aptitude', 'Quantitative Aptitude'),
        ('general_reasoning', 'General Reasoning'),
        ('english', 'English'),
        ('history', 'History'),
        ('geography', 'Geography'),
        ('polity', 'Polity'),
        ('general_science', 'General Science'),
        ('economy', 'Economy'),
        ('current_affairs', 'Current Affairs'),
    ]

    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES)
    
    subject = models.CharField(
        max_length=50, 
        choices=SUBJECT_CHOICES,
        db_index=True
    )
    topic = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, db_index=True)
    marks = models.IntegerField(default=1)
    explanation = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.text[:30]}"


class MockTest(models.Model):
    EXAM_CHOICES = [
        ('UPSC', 'UPSC'),
        ('SSC', 'SSC'),
        ('Banking', 'Banking'),
        ('Railways', 'Railways'),
        ('State PSC', 'State PSC'),
        ('NEET', 'NEET'),
        ('JEE', 'JEE'),
    ]
    SUBJECT_CHOICES = [
        ('quantitative_aptitude', 'Quantitative Aptitude'),
        ('general_reasoning', 'General Reasoning'),
        ('english', 'English'),
        ('history', 'History'),
        ('geography', 'Geography'),
        ('polity', 'Polity'),
        ('general_science', 'General Science'),
        ('economy', 'Economy'),
        ('current_affairs', 'Current Affairs'),
    ]
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField()  # in minutes
    
    exam_type = models.CharField(max_length=100, choices=EXAM_CHOICES, default='SSC')
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES, default='general_science')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    questions = models.ManyToManyField(Question, through='MockTestQuestion', related_name='mock_tests')

    def __str__(self):
        return f"{self.exam_type} - {self.title}"


class MockTestQuestion(models.Model):
    mock_test = models.ForeignKey(MockTest, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('mock_test', 'question')


class StudyMaterial(models.Model):
    SUBJECT_CHOICES = [
        ("quantitative_aptitude", "Quantitative Aptitude"),
        ("general_reasoning", "General Reasoning"),
        ("english", "English"),
        ("history", "History"),
        ("geography", "Geography"),
        ("polity", "Polity"),
        ("economy", "Economy"),
        ("general_science", "General Science"),
        ("current_affairs", "Current Affairs"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    tags = models.CharField(max_length=255, blank=True)

    file = models.FileField(upload_to='study_materials/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    download_count = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class FavoriteMaterial(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_materials')
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'material')

    def __str__(self):
        return f"{self.user.email} - {self.material.title}"


class SystemSettings(models.Model):
    # General
    system_language = models.CharField(max_length=50, default="en")
    timezone = models.CharField(max_length=50, default="UTC")
    maintenance_mode = models.BooleanField(default=False)

    # Security
    allow_signup = models.BooleanField(default=True)
    require_strong_password = models.BooleanField(default=True)
    max_login_attempts = models.IntegerField(default=5)

    # API
    api_access_enabled = models.BooleanField(default=True)

    # Database
    backup_frequency = models.CharField(max_length=20, default="daily")
    storage_limit_mb = models.IntegerField(default=5000)
    auto_cleanup = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def save(self, *args, **kwargs):
        if not self.pk and SystemSettings.objects.exists():
            return # Ensure singleton
        return super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


class RolePermission(models.Model):
    role = models.CharField(max_length=50, unique=True)
    can_manage_users = models.BooleanField(default=False)
    can_manage_circles = models.BooleanField(default=False)
    can_manage_materials = models.BooleanField(default=False)
    can_view_analytics = models.BooleanField(default=False)

    def __str__(self):
        return self.role


class APIKey(models.Model):
    name = models.CharField(max_length=100, default="Main API Key")
    key = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"
