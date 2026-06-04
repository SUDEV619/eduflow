from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("study", "Study"),
        ("mock", "Mock Test"),
        ("circle", "Study Circle"),
        ("admin", "Admin"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="notifications"
    )

    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=255, null=True, blank=True)

    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class AdminBroadcast(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()

    # targeting
    is_global = models.BooleanField(default=True)
    target_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="targeted_broadcasts")

    # metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_broadcasts")
    created_at = models.DateTimeField(auto_now_add=True)

    # scheduling
    scheduled_at = models.DateTimeField(null=True, blank=True)

    # status
    is_sent = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class UserBroadcastLink(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="broadcast_links")
    broadcast = models.ForeignKey(AdminBroadcast, on_delete=models.CASCADE, related_name="delivered_links")

    is_read = models.BooleanField(default=False)
    delivered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'broadcast')
