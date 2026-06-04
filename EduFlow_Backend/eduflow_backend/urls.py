from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/mock-tests/', include('mock_tests.urls')),
    path('api/tracker/', include('study_tracker.urls')),
    path('api/admin/', include('admin_module.urls')),
    path('api/circles/', include('study_circles.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/profile/', include('profiles.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
