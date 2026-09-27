"""
URL configuration for payments app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, TransactionViewSet, RefundViewSet
from .nira_views import nira_payment_callback, nira_payment_return, nira_payment_status

app_name = 'payments'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'refunds', RefundViewSet, basename='refund')

urlpatterns = [
    # Nira IBE payment bridge (airline pattern — outside auth router)
    path('nira/callback/', nira_payment_callback, name='nira-callback'),
    path('nira/return/', nira_payment_return, name='nira-return'),
    path('nira/status/', nira_payment_status, name='nira-status'),
    path('', include(router.urls)),
]
