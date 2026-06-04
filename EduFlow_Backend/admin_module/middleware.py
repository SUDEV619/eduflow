from django.http import JsonResponse
from .models import SystemSettings

class MaintenanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Exempt admin paths and actual admins from maintenance mode
        if request.path.startswith('/api/admin/') or request.path.startswith('/admin/'):
            return self.get_response(request)

        try:
            settings = SystemSettings.get_settings()
            if settings.maintenance_mode:
                # Check if user is staff/admin
                if not (request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'role', '') == 'admin')):
                    return JsonResponse({
                        "status": "error",
                        "code": "maintenance_mode",
                        "message": "System is currently under maintenance. Please try again later."
                    }, status=503)
        except Exception:
            # Fallback if DB is not ready or model doesn't exist yet
            pass

        return self.get_response(request)
