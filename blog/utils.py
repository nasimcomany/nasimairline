"""
Utility functions for blog app
"""
from django.utils.text import slugify
from django.utils.html import strip_tags
from .validators import validate_reading_time


def generate_slug(title):
    """
    Generate a unique slug from title
    """
    return slugify(title)


def generate_excerpt(content, length=200):
    """
    Generate excerpt from content
    """
    # Remove HTML tags
    text = strip_tags(content)
    
    # Truncate to desired length
    if len(text) <= length:
        return text
    
    # Truncate at word boundary
    truncated = text[:length].rsplit(' ', 1)[0]
    return truncated + '...'


def calculate_reading_time(content):
    """
    Calculate reading time in minutes
    """
    return validate_reading_time(content)


def generate_meta_description(content, custom_description=None):
    """
    Generate meta description from content or use custom
    """
    if custom_description:
        return custom_description[:160]
    
    excerpt = generate_excerpt(content, 160)
    return excerpt


def generate_og_image_url(article):
    """
    Generate Open Graph image URL for article
    """
    if article.featured_image:
        return article.featured_image.url
    # Return default OG image if no featured image
    return '/static/images/default-og-image.jpg'


def generate_canonical_url(article):
    """
    Generate canonical URL for article
    """
    from django.urls import reverse
    return reverse('blog:article-detail', kwargs={'slug': article.slug})


def get_related_articles(article, limit=5):
    """
    Get related articles based on category and tags
    """
    from .models import Article
    from .constants import ARTICLE_STATUS_PUBLISHED
    
    related = Article.objects.published().exclude(id=article.id)
    
    # Filter by same category
    if article.category:
        related = related.filter(category=article.category)
    
    # Filter by same tags
    if article.tags.exists():
        related = related.filter(tags__in=article.tags.all()).distinct()
    
    return related[:limit]


def increment_view_count(article):
    """
    Increment view count for article
    """
    article.view_count += 1
    article.save(update_fields=['view_count'])


def format_content_for_seo(content):
    """
    Format content for better SEO
    """
    # This is a placeholder for content formatting
    # Can be extended with markdown processing, etc.
    return content

