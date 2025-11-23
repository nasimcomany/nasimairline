"""
URLs for support app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet,
    TicketMessageViewSet,
    TicketAttachmentViewSet,
    TicketCategoryViewSet,
    security_contact_info,
)

app_name = 'support'

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'messages', TicketMessageViewSet, basename='message')
router.register(r'attachments', TicketAttachmentViewSet, basename='attachment')
router.register(r'categories', TicketCategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    path('security/contact/', security_contact_info, name='security-contact'),
]

