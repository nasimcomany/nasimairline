"""
URL configuration for gallery app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GalleryCategoryViewSet,
    GalleryAlbumViewSet,
    GalleryImageViewSet,
    HeroSliderViewSet,
)

app_name = 'gallery'

router = DefaultRouter()
router.register(r'categories', GalleryCategoryViewSet, basename='category')
router.register(r'albums', GalleryAlbumViewSet, basename='album')
router.register(r'images', GalleryImageViewSet, basename='image')
router.register(r'hero-sliders', HeroSliderViewSet, basename='hero-slider')

urlpatterns = [
    path('', include(router.urls)),
]

