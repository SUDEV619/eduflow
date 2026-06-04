from django.db import models
from django.conf import settings

class MockTest(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Marking scheme
    correct_points = models.IntegerField(default=1)
    incorrect_points = models.IntegerField(default=0)
    unanswered_points = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class Question(models.Model):
    mock_test = models.ForeignKey(MockTest, related_name='questions', on_delete=models.CASCADE)
    prompt = models.TextField()
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.mock_test.title} - Q{self.order}"

class Option(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    label = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.label

class TestAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='attempts', on_delete=models.CASCADE)
    mock_test = models.ForeignKey('admin_module.MockTest', related_name='attempts', on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.mock_test}"

class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey('admin_module.Question', related_name='attempt_answers', on_delete=models.CASCADE)
    # For simplicity, we'll store the selected option as a string 'A', 'B', 'C', 'D'
    selected_option_str = models.CharField(max_length=1, null=True, blank=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"{self.attempt} - {self.question}"
