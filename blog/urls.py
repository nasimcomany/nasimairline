"""
URL configuration for blog app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ArticleViewSet, CategoryViewSet, TagViewSet,
    CommentViewSet, SEODataViewSet
)

app_name = 'blog'

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'seo-data', SEODataViewSet, basename='seo-data')

urlpatterns = [
    path('', include(router.urls)),
]

