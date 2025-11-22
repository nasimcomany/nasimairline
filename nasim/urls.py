"""
URL configuration for nasim project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# API Router for API root view
api_router = DefaultRouter()

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Root
    path('api/', include([
        # JWT Authentication
        path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
        
        # Apps
        path('accounts/', include('accounts.urls')),
        path('flights/', include('flights.urls')),
        path('bookings/', include('bookings.urls')),
        path('payments/', include('payments.urls')),
        path('notifications/', include('notifications.urls')),
        path('pilots/', include('pilots.urls')),
        path('security/', include('security.urls')),
        path('blog/', include('blog.urls')),
        path('main/', include('main.urls')),
    ])),
]
