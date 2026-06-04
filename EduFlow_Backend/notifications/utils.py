from .models import Notification

def create_notification(user, title, message, n_type="system", link=None):
    """
    Utility function to create a notification for a user.
    """
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=n_type,
        link=link
    )
