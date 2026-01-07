"""
URL configuration for nasim project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from rest_framework.routers import DefaultRouter
import os
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .admin_site import limited_admin_site
from .views import ReactAppView

# API Router for API root view
api_router = DefaultRouter()

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Limited Admin (only blog and gallery)
    path('limited-admin/', limited_admin_site.urls),
    
    # API Root
    path('api/', include([
        # JWT Authentication
        path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
        path('auth/', include('authenticate.urls')),
        
        # Apps
        path('accounts/', include('accounts.urls')),
        path('flights/', include('flights.urls')),
        path('bookings/', include('bookings.urls')),
        path('payments/', include('payments.urls')),
        path('notifications/', include('notifications.urls')),
        path('pilots/', include('pilots.urls')),
        path('security/', include('security.urls')),
        path('blog/', include('blog.urls')),
        path('gallery/', include('gallery.urls')),
        path('support/', include('support.urls')),
        path('customer-service/', include('customer_service.urls')),
        path('main/', include('main.urls')),
    ])),
    
    # CKEditor
    path('ckeditor/', include('ckeditor_uploader.urls')),
    
    # Serve static files from React build
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    # Serve images from React build
    re_path(r'^images/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.FRONTEND_BUILD_DIR, 'images') if os.path.exists(settings.FRONTEND_BUILD_DIR) else os.path.join(settings.BASE_DIR, 'frontend', 'public', 'images'),
    }),
    re_path(r'^.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$', serve, {
        'document_root': settings.STATIC_ROOT,
    }),
]

# Serve React app for all other routes (SPA)
# This must be last to catch all unmatched routes
urlpatterns += [
    re_path(r'^(?!api|admin|limited-admin|ckeditor|media|static).*$', ReactAppView.as_view(), name='react-app'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
