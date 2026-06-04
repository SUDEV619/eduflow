from django.core.management.base import BaseCommand
from django.utils import timezone
from notifications.models import AdminBroadcast
from notifications.views import dispatch_broadcast

class Command(BaseCommand):
    help = 'Dispatch scheduled notifications'

    def handle(self, *args, **options):
        now = timezone.now()
        scheduled_notifs = AdminBroadcast.objects.filter(
            is_sent=False,
            scheduled_at__lte=now
        )
        
        count = scheduled_notifs.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No scheduled notifications to dispatch.'))
            return

        for notif in scheduled_notifs:
            try:
                dispatch_broadcast(notif)
                self.stdout.write(self.style.SUCCESS(f'Successfully dispatched: {notif.title}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to dispatch {notif.title}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'Dispatch process complete. Processed {count} items.'))
