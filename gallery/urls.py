"""
URL configuration for gallery app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GalleryCategoryViewSet,
    GalleryAlbumViewSet,
    GalleryImageViewSet,
)

app_name = 'gallery'

router = DefaultRouter()
router.register(r'categories', GalleryCategoryViewSet, basename='category')
router.register(r'albums', GalleryAlbumViewSet, basename='album')
router.register(r'images', GalleryImageViewSet, basename='image')

urlpatterns = [
    path('', include(router.urls)),
]

