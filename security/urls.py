"""
URL configuration for security app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SecurityInfoViewSet, SecurityAlertViewSet

app_name = 'security'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'info', SecurityInfoViewSet, basename='security-info')
router.register(r'alerts', SecurityAlertViewSet, basename='security-alert')

urlpatterns = [
    path('', include(router.urls)),
]

