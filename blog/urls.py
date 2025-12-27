"""
URL configuration for blog app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ArticleViewSet, CategoryViewSet, TagViewSet,
    CommentViewSet, SEODataViewSet,
    IranCityViewSet, IranologyArticleViewSet
)

app_name = 'blog'

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'seo-data', SEODataViewSet, basename='seo-data')
router.register(r'iran-cities', IranCityViewSet, basename='iran-city')
router.register(r'iranology-articles', IranologyArticleViewSet, basename='iranology-article')

urlpatterns = [
    path('', include(router.urls)),
]

