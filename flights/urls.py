"""
URL configuration for flights app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AirportViewSet, AircraftViewSet, FlightViewSet, NiraAPIViewSet

app_name = 'flights'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'airports', AirportViewSet, basename='airport')
router.register(r'aircrafts', AircraftViewSet, basename='aircraft')
router.register(r'flights', FlightViewSet, basename='flight')
router.register(r'nira', NiraAPIViewSet, basename='nira')

urlpatterns = [
    path('', include(router.urls)),
]

