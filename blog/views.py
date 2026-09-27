"""
Views for blog app
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count
from django.utils import timezone
from .models import Article, Category, Tag, Comment, SEOData, IranCity, IranologyArticle
from .serializers import (
    ArticleListSerializer, ArticleDetailSerializer,
    CategorySerializer, TagSerializer,
    CommentSerializer, SEODataSerializer,
    IranCitySerializer, IranologyArticleListSerializer, IranologyArticleDetailSerializer
)
from .constants import ARTICLE_STATUS_PUBLISHED


class ArticleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Article model
    """
    queryset = Article.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'article_type', 'category', 'tags', 'author', 'is_featured', 'slug']
    search_fields = ['title', 'excerpt', 'content', 'meta_keywords']
    ordering_fields = ['published_at', 'created_at', 'view_count', 'reading_time']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleListSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is not authenticated or not staff, only show published articles
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(
                status=ARTICLE_STATUS_PUBLISHED,
                published_at__lte=timezone.now()
            )
        
        # Prefetch related objects for performance
        queryset = queryset.select_related('author', 'category').prefetch_related('tags')
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve article and increment view count"""
        instance = self.get_object()
        
        # Increment view count for published articles
        if instance.status == ARTICLE_STATUS_PUBLISHED:
            instance.increment_view()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """Get featured articles"""
        articles = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def recent(self, request):
        """Get recent articles"""
        limit = int(request.query_params.get('limit', 10))
        articles = self.get_queryset()[:limit]
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request, pk=None):
        """Publish an article"""
        article = self.get_object()
        article.status = ARTICLE_STATUS_PUBLISHED
        if not article.published_at:
            article.published_at = timezone.now()
        article.save()
        serializer = self.get_serializer(article)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unpublish(self, request, pk=None):
        """Unpublish an article"""
        article = self.get_object()
        article.status = 'DRAFT'
        article.save()
        serializer = self.get_serializer(article)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Category model (read-only)
    """
    queryset = Category.objects.active()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def articles(self, request, slug=None):
        """Get articles in this category"""
        category = self.get_object()
        articles = (
            Article.objects.published()
            .filter(category=category)
            .order_by('-published_at', '-created_at')
        )
        search = (request.query_params.get('search') or '').strip()
        if search:
            articles = articles.filter(
                Q(title__icontains=search)
                | Q(excerpt__icontains=search)
                | Q(content__icontains=search)
            )

        # Pagination
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = ArticleListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Tag model (read-only)
    """
    queryset = Tag.objects.active()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def popular(self, request):
        """Get popular tags"""
        limit = int(request.query_params.get('limit', 20))
        tags = Tag.objects.popular(limit)
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def articles(self, request, pk=None):
        """Get articles with this tag"""
        tag = self.get_object()
        articles = Article.objects.published().filter(tags=tag)
        
        # Pagination
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = ArticleListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Comment model
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['article', 'status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is not staff, only show approved comments
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='APPROVED')
        
        return queryset
    
    def perform_create(self, serializer):
        """Create comment with IP address"""
        # Get IP address from request
        ip_address = self.get_client_ip()
        serializer.save(ip_address=ip_address)
    
    def get_client_ip(self):
        """Get client IP address"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class SEODataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SEOData model
    """
    queryset = SEOData.objects.all()
    serializer_class = SEODataSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['article', 'robots_index', 'robots_follow']


class IranCityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for IranCity model (read-only for public)
    """
    queryset = IranCity.objects.filter(is_active=True)
    serializer_class = IranCitySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['province', 'is_active']
    search_fields = ['name', 'name_en', 'province', 'province_en', 'description']
    ordering_fields = ['order', 'name', 'province', 'view_count', 'created_at']
    ordering = ['order', 'province', 'name']
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve city and increment view count"""
        instance = self.get_object()
        instance.increment_view()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def articles(self, request, slug=None):
        """Get articles for this city"""
        city = self.get_object()
        articles = IranologyArticle.objects.filter(
            city=city,
            status=ARTICLE_STATUS_PUBLISHED,
            published_at__lte=timezone.now()
        )
        
        # Pagination
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = IranologyArticleListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = IranologyArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def provinces(self, request):
        """Get list of provinces with city counts"""
        from django.db.models import Count
        provinces = IranCity.objects.filter(is_active=True).values('province', 'province_en').annotate(
            city_count=Count('id')
        ).order_by('province')
        return Response(provinces)


class IranologyArticleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for IranologyArticle model
    """
    queryset = IranologyArticle.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'city', 'author', 'is_featured']
    search_fields = ['title', 'excerpt', 'content', 'meta_keywords']
    ordering_fields = ['published_at', 'created_at', 'view_count', 'reading_time']
    ordering = ['-published_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return IranologyArticleDetailSerializer
        return IranologyArticleListSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is not authenticated or not staff, only show published articles
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(
                status=ARTICLE_STATUS_PUBLISHED,
                published_at__lte=timezone.now()
            )
        
        # Prefetch related objects for performance
        queryset = queryset.select_related('author', 'city')
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve article and increment view count"""
        instance = self.get_object()
        
        # Increment view count for published articles
        if instance.status == ARTICLE_STATUS_PUBLISHED:
            instance.increment_view()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_city(self, request):
        """Get articles by city slug"""
        city_slug = request.query_params.get('city', None)
        if not city_slug:
            return Response({'error': 'City slug is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            city = IranCity.objects.get(slug=city_slug, is_active=True)
        except IranCity.DoesNotExist:
            return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
        
        articles = self.get_queryset().filter(city=city)
        
        # Pagination
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """Get featured articles"""
        articles = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)
