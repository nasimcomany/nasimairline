"""
Serializers for gallery app
"""
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ValidationError
from django.db import models
from .models import GalleryCategory, GalleryAlbum, GalleryImage, HeroSlider, HomePageSectionItem, HomePageSectionConfig


class BaseGallerySerializer(serializers.ModelSerializer):
    """
    Base serializer for Gallery models with common fields
    """
    uuid = serializers.UUIDField(read_only=True)
    
    class Meta:
        abstract = True
        read_only_fields = ('id', 'uuid', 'created_at', 'updated_at')
    
    def to_representation(self, instance):
        """Override to add computed fields"""
        data = super().to_representation(instance)
        return data


class GalleryCategorySerializer(BaseGallerySerializer):
    """
    Serializer for GalleryCategory model
    """
    image_count = SerializerMethodField()
    url = SerializerMethodField()
    
    class Meta(BaseGallerySerializer.Meta):
        model = GalleryCategory
        fields = [
            'id', 'uuid', 'name', 'slug', 'description', 'image',
            'status', 'is_featured', 'order', 'image_count', 'url',
            'meta_title', 'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'image_count', 'url',
            'created_at', 'updated_at'
        ]
    
    def get_image_count(self, obj):
        """Get count of published images in category"""
        return obj.images.filter(status='PUBLISHED').count()
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class GalleryCategoryDetailSerializer(BaseGallerySerializer):
    """
    Detailed serializer for GalleryCategory
    """
    image_count = SerializerMethodField()
    url = SerializerMethodField()
    
    class Meta(BaseGallerySerializer.Meta):
        model = GalleryCategory
        fields = [
            'id', 'uuid', 'name', 'slug', 'description', 'image',
            'status', 'is_featured', 'order', 'image_count', 'url',
            'meta_title', 'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'image_count', 'url',
            'created_at', 'updated_at'
        ]
    
    def get_image_count(self, obj):
        """Get count of published images"""
        return obj.images.filter(status='PUBLISHED').count()
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class GalleryAlbumSerializer(BaseGallerySerializer):
    """
    Serializer for GalleryAlbum model
    """
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    image_count = SerializerMethodField()
    url = SerializerMethodField()
    
    class Meta(BaseGallerySerializer.Meta):
        model = GalleryAlbum
        fields = [
            'id', 'uuid', 'title', 'slug', 'description', 'category',
            'category_name', 'cover_image', 'author', 'author_email',
            'author_name', 'status', 'is_featured', 'view_count',
            'image_count', 'url', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'author_email', 'author_name',
            'category_name', 'view_count', 'image_count', 'url',
            'created_at', 'updated_at', 'published_at'
        ]
    
    def get_author_name(self, obj):
        """Get author's full name"""
        return obj.author.get_full_name()
    
    def get_image_count(self, obj):
        """Get count of published images in album"""
        return obj.images.filter(status='PUBLISHED').count()
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class GalleryAlbumDetailSerializer(BaseGallerySerializer):
    """
    Detailed serializer for GalleryAlbum with nested images
    """
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = SerializerMethodField()
    category_detail = GalleryCategorySerializer(source='category', read_only=True)
    images = serializers.SerializerMethodField()
    url = SerializerMethodField()
    
    class Meta(BaseGallerySerializer.Meta):
        model = GalleryAlbum
        fields = [
            'id', 'uuid', 'title', 'slug', 'description', 'category',
            'category_detail', 'cover_image', 'author', 'author_email',
            'author_name', 'status', 'is_featured', 'view_count',
            'images', 'url', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'author_email', 'author_name',
            'category_detail', 'view_count', 'images', 'url',
            'created_at', 'updated_at', 'published_at'
        ]
    
    def get_author_name(self, obj):
        """Get author's full name"""
        return obj.author.get_full_name()
    
    def get_images(self, obj):
        """Get published images in album"""
        # Avoid circular import by using the class directly
        images = obj.images.filter(status='PUBLISHED')
        # Use a simplified representation to avoid recursion
        return [
            {
                'id': img.id,
                'uuid': str(img.uuid),
                'title': img.title,
                'slug': img.slug,
                'image_url': img.image.url if img.image else None,
                'thumbnail_url': img.thumbnail.url if img.thumbnail else None,
            }
            for img in images
        ]
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class GalleryImageSerializer(BaseGallerySerializer):
    """
    Serializer for GalleryImage model
    """
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    album_title = serializers.CharField(source='album.title', read_only=True, allow_null=True)
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    file_size_mb = SerializerMethodField()
    
    class Meta(BaseGallerySerializer.Meta):
        model = GalleryImage
        fields = [
            'id', 'uuid', 'title', 'slug', 'description', 'image',
            'image_url', 'thumbnail', 'thumbnail_url', 'category',
            'category_name', 'album', 'album_title', 'author',
            'author_email', 'author_name', 'media_type', 'file_size',
            'file_size_mb', 'width', 'height', 'status', 'is_featured',
            'is_pinned', 'view_count', 'download_count', 'alt_text',
            'meta_title', 'meta_description', 'created_at', 'updated_at',
            'published_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'author_email', 'author_name',
            'category_name', 'album_title', 'image_url', 'thumbnail_url',
            'file_size_mb', 'view_count', 'download_count',
            'created_at', 'updated_at', 'published_at'
        ]
    
    def get_author_name(self, obj):
        """Get author's full name"""
        return obj.author.get_full_name()
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_thumbnail_url(self, obj):
        """Get thumbnail URL"""
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        elif obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_file_size_mb(self, obj):
        """Get file size in MB"""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0


class GalleryImageDetailSerializer(BaseGallerySerializer):
    """
    Detailed serializer for GalleryImage
    """
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = SerializerMethodField()
    category_detail = GalleryCategorySerializer(source='category', read_only=True)
    album_detail = GalleryAlbumSerializer(source='album', read_only=True)
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    file_size_mb = SerializerMethodField()
    url = SerializerMethodField()
    
    class Meta(BaseGallerySerializer.Meta):
        model = GalleryImage
        fields = [
            'id', 'uuid', 'title', 'slug', 'description', 'image',
            'image_url', 'thumbnail', 'thumbnail_url', 'category',
            'category_detail', 'album', 'album_detail', 'author',
            'author_email', 'author_name', 'media_type', 'file_size',
            'file_size_mb', 'width', 'height', 'status', 'is_featured',
            'is_pinned', 'view_count', 'download_count', 'alt_text',
            'meta_title', 'meta_description', 'url', 'metadata',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'slug', 'author_email', 'author_name',
            'category_detail', 'album_detail', 'image_url', 'thumbnail_url',
            'file_size_mb', 'view_count', 'download_count', 'url',
            'created_at', 'updated_at', 'published_at'
        ]
    
    def get_author_name(self, obj):
        """Get author's full name"""
        return obj.author.get_full_name()
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_thumbnail_url(self, obj):
        """Get thumbnail URL"""
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        elif obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_file_size_mb(self, obj):
        """Get file size in MB"""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class HeroSliderSerializer(serializers.ModelSerializer):
    """
    Serializer for HeroSlider model - Homepage banner images
    """
    image_url = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = HeroSlider
        fields = [
            'id', 'uuid', 'title', 'image', 'image_url', 'alt_text',
            'order', 'is_active', 'link_url', 'created_by', 
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'image_url', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_created_by_name(self, obj):
        """Get creator's full name"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class HomePageSectionItemSerializer(serializers.ModelSerializer):
    """Serializer for HomePageSectionItem - public API"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HomePageSectionItem
        fields = [
            'id', 'uuid', 'section_type', 'title_fa', 'title_ar', 'title_en',
            'description_fa', 'description_ar', 'description_en',
            'image_url', 'link_url', 'order', 'is_active'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HomePageSectionConfigSerializer(serializers.ModelSerializer):
    """Serializer for HomePageSectionConfig - public API"""
    
    class Meta:
        model = HomePageSectionConfig
        fields = [
            'id', 'uuid', 'section_type',
            'title1_fa', 'title1_ar', 'title1_en',
            'title2_fa', 'title2_ar', 'title2_en',
            'title3_fa', 'title3_ar', 'title3_en',
        ]

