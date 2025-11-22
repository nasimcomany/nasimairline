"""
Serializers for blog app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Article, Category, Tag, Comment, SEOData

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model
    """
    article_count = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'meta_title', 
            'meta_description', 'meta_keywords', 'image', 'is_active', 
            'order', 'article_count', 'url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_article_count(self, obj):
        """Get published article count"""
        return obj.articles.filter(status='PUBLISHED').count()
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for Tag model
    """
    article_count = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = [
            'id', 'name', 'slug', 'description', 'meta_description', 
            'is_active', 'article_count', 'url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_article_count(self, obj):
        """Get published article count"""
        return obj.articles.filter(status='PUBLISHED').count()
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for Comment model
    """
    replies = serializers.SerializerMethodField()
    article_title = serializers.CharField(source='article.title', read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'uuid', 'article', 'article_title', 'name', 'email', 'website', 
            'content', 'status', 'parent', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'status', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """Get nested replies"""
        replies = obj.replies.filter(status='APPROVED')
        return CommentSerializer(replies, many=True).data


class ArticleListSerializer(serializers.ModelSerializer):
    """
    Serializer for Article list view (lightweight)
    """
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    url = serializers.SerializerMethodField()
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'uuid', 'title', 'slug', 'excerpt', 'author', 'author_name',
            'category', 'category_name', 'category_slug', 'tags',
            'article_type', 'featured_image', 'featured_image_url',
            'is_featured', 'is_pinned', 'view_count', 'reading_time',
            'published_at', 'url', 'created_at'
        ]
        read_only_fields = ['uuid', 'view_count', 'reading_time', 'created_at']
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()
    
    def get_featured_image_url(self, obj):
        """Get featured image URL"""
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None


class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Article detail view (full)
    """
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    related_articles = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    canonical_url = serializers.SerializerMethodField()
    og_image_url = serializers.SerializerMethodField()
    seo_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'uuid', 'title', 'slug', 'excerpt', 'content', 'author', 
            'author_name', 'author_email', 'category', 'tags', 'article_type',
            'featured_image', 'image_alt', 'meta_title', 'meta_description',
            'meta_keywords', 'seo_priority', 'og_title', 'og_description',
            'og_image', 'canonical_url', 'status', 'is_featured', 'is_pinned',
            'allow_comments', 'view_count', 'reading_time', 'metadata',
            'published_at', 'url', 'canonical_url', 'og_image_url',
            'comments', 'related_articles', 'seo_data', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'view_count', 'reading_time', 'published_at',
            'created_at', 'updated_at'
        ]
    
    def get_comments(self, obj):
        """Get approved comments"""
        comments = obj.comments.filter(status='APPROVED', parent=None)
        return CommentSerializer(comments, many=True).data
    
    def get_related_articles(self, obj):
        """Get related articles"""
        related = obj.get_related_articles(limit=5)
        return ArticleListSerializer(related, many=True, context=self.context).data
    
    def get_url(self, obj):
        """Get absolute URL"""
        return obj.get_absolute_url()
    
    def get_canonical_url(self, obj):
        """Get canonical URL"""
        return obj.get_canonical_url()
    
    def get_og_image_url(self, obj):
        """Get Open Graph image URL"""
        return obj.get_og_image_url()
    
    def get_seo_data(self, obj):
        """Get SEO data if exists"""
        try:
            seo_data = obj.seo_data
            return {
                'robots_index': seo_data.robots_index,
                'robots_follow': seo_data.robots_follow,
                'sitemap_priority': str(seo_data.sitemap_priority),
                'sitemap_changefreq': seo_data.sitemap_changefreq,
            }
        except SEOData.DoesNotExist:
            return None


class SEODataSerializer(serializers.ModelSerializer):
    """
    Serializer for SEOData model
    """
    article_title = serializers.CharField(source='article.title', read_only=True)
    
    class Meta:
        model = SEOData
        fields = [
            'id', 'article', 'article_title', 'structured_data', 'schema_markup',
            'robots_index', 'robots_follow', 'robots_noarchive', 'robots_nosnippet',
            'sitemap_priority', 'sitemap_changefreq', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

