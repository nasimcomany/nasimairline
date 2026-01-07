"""
URLs for customer_service app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerTierSettingsViewSet,
    ChatSessionViewSet,
    ChatMessageViewSet,
    CustomerTierViewSet,
)

router = DefaultRouter()
router.register(r'tier-settings', CustomerTierSettingsViewSet, basename='tier-settings')
router.register(r'chat/sessions', ChatSessionViewSet, basename='chat-sessions')
router.register(r'chat/messages', ChatMessageViewSet, basename='chat-messages')
router.register(r'tier', CustomerTierViewSet, basename='customer-tier')

app_name = 'customer_service'

urlpatterns = [
    path('', include(router.urls)),
]

