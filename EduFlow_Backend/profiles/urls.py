from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_profile, name='get_profile'),
    path('update/', views.update_profile, name='update_profile'),
    path('stats/', views.profile_stats, name='profile_stats'),
    path('timeline/', views.activity_timeline, name='activity_timeline'),
]
