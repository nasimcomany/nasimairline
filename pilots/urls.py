"""
URL configuration for pilots app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PilotViewSet, PilotRequestViewSet

app_name = 'pilots'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'pilots', PilotViewSet, basename='pilot')
router.register(r'requests', PilotRequestViewSet, basename='pilot-request')

urlpatterns = [
    path('', include(router.urls)),
]

