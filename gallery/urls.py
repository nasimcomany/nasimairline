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
    HomePageSectionItemViewSet,
    HomePageSectionConfigViewSet,
)

app_name = 'gallery'

router = DefaultRouter()
router.register(r'categories', GalleryCategoryViewSet, basename='category')
router.register(r'albums', GalleryAlbumViewSet, basename='album')
router.register(r'images', GalleryImageViewSet, basename='image')
router.register(r'hero-sliders', HeroSliderViewSet, basename='hero-slider')
router.register(r'homepage-section-items', HomePageSectionItemViewSet, basename='homepage-section-item')
router.register(r'homepage-section-configs', HomePageSectionConfigViewSet, basename='homepage-section-config')

urlpatterns = [
    path('', include(router.urls)),
]

