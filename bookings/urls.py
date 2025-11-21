"""
URL configuration for bookings app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, PassengerViewSet, BookingExtraViewSet

app_name = 'bookings'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'passengers', PassengerViewSet, basename='passenger')
router.register(r'extras', BookingExtraViewSet, basename='booking-extra')

urlpatterns = [
    path('', include(router.urls)),
]

