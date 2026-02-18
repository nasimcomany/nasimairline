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
    ChatMessageViewSet,
    security_contact_info,
    submit_complaint_form,
    submit_survey_form,
)

app_name = 'support'

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'messages', TicketMessageViewSet, basename='message')
router.register(r'attachments', TicketAttachmentViewSet, basename='attachment')
router.register(r'categories', TicketCategoryViewSet, basename='category')
router.register(r'chat', ChatMessageViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
    path('security/contact/', security_contact_info, name='security-contact'),
    path('complaints/submit/', submit_complaint_form, name='complaint-submit'),
    path('surveys/submit/', submit_survey_form, name='survey-submit'),
]

