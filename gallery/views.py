"""
Views for gallery app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import GalleryCategory, GalleryAlbum, GalleryImage, HeroSlider, HomePageSectionItem, HomePageSectionConfig
from .serializers import (
    GalleryCategorySerializer,
    GalleryCategoryDetailSerializer,
    GalleryAlbumSerializer,
    GalleryAlbumDetailSerializer,
    GalleryImageSerializer,
    GalleryImageDetailSerializer,
    HeroSliderSerializer,
    HomePageSectionItemSerializer,
    HomePageSectionConfigSerializer,
)


class GalleryCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GalleryCategory model
    """
    queryset = GalleryCategory.objects.active()
    serializer_class = GalleryCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_featured']
    search_fields = ['name', 'slug', 'description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return GalleryCategoryDetailSerializer
        return GalleryCategorySerializer


class GalleryAlbumViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GalleryAlbum model
    """
    queryset = GalleryAlbum.objects.published().select_related('author', 'category')
    serializer_class = GalleryAlbumSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'is_featured', 'category', 'author', 'uuid'
    ]
    search_fields = [
        'uuid', 'title', 'slug', 'description', 'author__email'
    ]
    ordering_fields = [
        'uuid', 'published_at', 'created_at', 'view_count'
    ]
    ordering = ['-published_at', '-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return GalleryAlbumDetailSerializer
        return GalleryAlbumSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_view(self, request, slug=None):
        """Increment view count for album"""
        album = self.get_object()
        album.view_count += 1
        album.save(update_fields=['view_count'])
        return Response({'view_count': album.view_count})


class GalleryImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GalleryImage model
    """
    queryset = GalleryImage.objects.published().select_related(
        'author', 'category', 'album'
    )
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'status', 'is_featured', 'is_pinned', 'media_type',
        'category', 'album', 'author', 'uuid'
    ]
    search_fields = [
        'uuid', 'title', 'slug', 'description', 'alt_text',
        'author__email', 'category__name', 'album__title'
    ]
    ordering_fields = [
        'uuid', 'published_at', 'created_at', 'view_count',
        'download_count', 'file_size'
    ]
    ordering = ['-published_at', '-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return GalleryImageDetailSerializer
        return GalleryImageSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_view(self, request, slug=None):
        """Increment view count for image"""
        image = self.get_object()
        image.increment_view()
        return Response({'view_count': image.view_count})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_download(self, request, slug=None):
        """Increment download count for image"""
        image = self.get_object()
        image.increment_download()
        return Response({'download_count': image.download_count})
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """Get featured images"""
        images = self.queryset.filter(is_featured=True)
        page = self.paginate_queryset(images)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def recent(self, request):
        """Get recent images"""
        limit = int(request.query_params.get('limit', 10))
        images = self.queryset[:limit]
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)


class HeroSliderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for HeroSlider model - Homepage banner images
    Read-only for frontend, admin can manage via Django admin
    """
    queryset = HeroSlider.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = HeroSliderSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [OrderingFilter]
    ordering_fields = ['order', 'created_at']
    ordering = ['order', '-created_at']
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def active(self, request):
        """Get all active hero slider images"""
        sliders = self.get_queryset()
        serializer = self.get_serializer(sliders, many=True)
        return Response(serializer.data)


class HomePageSectionItemViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for HomePageSectionItem - public read-only"""
    queryset = HomePageSectionItem.objects.filter(is_active=True).order_by('section_type', 'order')
    serializer_class = HomePageSectionItemSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def by_section(self, request):
        """Get items by section type: ?section=SPECIAL_SERVICE or ?section=EXPERIENCE"""
        section = request.query_params.get('section')
        items = self.get_queryset()
        if section:
            items = items.filter(section_type=section)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def all(self, request):
        """Get all active items grouped by section"""
        items = self.get_queryset()
        serializer = self.get_serializer(items, many=True)
        data = {
            'special_services': [i for i in serializer.data if i['section_type'] == 'SPECIAL_SERVICE'],
            'experience': [i for i in serializer.data if i['section_type'] == 'EXPERIENCE'],
            'survey': [i for i in serializer.data if i['section_type'] == 'SURVEY'],
            'faq': [i for i in serializer.data if i['section_type'] == 'FAQ'],
            'popular_routes': [i for i in serializer.data if i['section_type'] == 'POPULAR_ROUTES'],
        }
        return Response(data)


class HomePageSectionConfigViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for HomePageSectionConfig - public read-only"""
    queryset = HomePageSectionConfig.objects.all()
    serializer_class = HomePageSectionConfigSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def all(self, request):
        """Get all section configs as a dict keyed by section_type"""
        configs = self.get_queryset()
        serializer = self.get_serializer(configs, many=True)
        data = {c['section_type']: c for c in serializer.data}
        return Response(data)
