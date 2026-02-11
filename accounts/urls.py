"""
URL configuration for accounts app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, WalletViewSet, MembershipViewSet

app_name = 'accounts'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'wallet', WalletViewSet, basename='wallet')
router.register(r'membership', MembershipViewSet, basename='membership')

urlpatterns = [
    path('', include(router.urls)),
]

