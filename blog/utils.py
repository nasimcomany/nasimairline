"""
Utility functions for blog app
"""
import re
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


def count_headings(content):
    """
    Count H1, H2, H3, H4 headings in content
    Returns dict with counts
    """
    from django.utils.html import strip_tags
    
    # Remove HTML tags to get plain text
    text = strip_tags(content)
    
    # Count headings in HTML
    h1_count = len(re.findall(r'<h1[^>]*>', content, re.IGNORECASE))
    h2_count = len(re.findall(r'<h2[^>]*>', content, re.IGNORECASE))
    h3_count = len(re.findall(r'<h3[^>]*>', content, re.IGNORECASE))
    h4_count = len(re.findall(r'<h4[^>]*>', content, re.IGNORECASE))
    
    # Also check for H1 in title
    h1_text = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    h1_title = h1_text.group(1).strip() if h1_text else None
    
    return {
        'h1_title': h1_title,
        'h1_count': h1_count,
        'h2_count': h2_count,
        'h3_count': h3_count,
        'h4_count': h4_count,
    }


def count_links(content):
    """
    Count internal and external links in content
    Returns dict with counts
    """
    from django.utils.html import strip_tags
    from django.conf import settings
    
    # Find all links
    internal_links = 0
    external_links = 0
    
    # Get domain from settings
    try:
        site_domain = settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else ''
    except:
        site_domain = ''
    
    # Find all <a> tags
    link_pattern = r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>'
    links = re.findall(link_pattern, content, re.IGNORECASE)
    
    for link in links:
        if link.startswith('http://') or link.startswith('https://'):
            if site_domain and site_domain in link:
                internal_links += 1
            else:
                external_links += 1
        elif link.startswith('/') or not link.startswith('http'):
            internal_links += 1
    
    return {
        'internal_links': internal_links,
        'external_links': external_links,
    }


def calculate_keyword_density(content, keyword):
    """
    Calculate keyword density in content
    Returns percentage
    """
    from django.utils.html import strip_tags
    
    if not content or not keyword:
        return 0.0
    
    # Remove HTML tags
    text = strip_tags(content).lower()
    keyword_lower = keyword.lower()
    
    # Count words
    words = text.split()
    total_words = len(words)
    
    if total_words == 0:
        return 0.0
    
    # Count keyword occurrences
    keyword_count = text.count(keyword_lower)
    
    # Calculate density
    density = (keyword_count / total_words) * 100
    
    return round(density, 2)


def analyze_content_seo(content, main_keyword=None):
    """
    Comprehensive SEO analysis of content
    Returns dict with all SEO metrics
    """
    from django.utils.html import strip_tags
    
    # Remove HTML tags
    text = strip_tags(content)
    
    # Basic stats
    content_length = len(text)
    word_count = len(text.split())
    char_count = len(text.replace(' ', ''))
    
    # Heading counts
    headings = count_headings(content)
    
    # Link counts
    links = count_links(content)
    
    # Keyword density
    keyword_density = 0.0
    if main_keyword:
        keyword_density = calculate_keyword_density(content, main_keyword)
    
    # Calculate reading time (200 words per minute)
    reading_time = max(1, round(word_count / 200))
    
    return {
        'content_length': content_length,
        'word_count': word_count,
        'char_count': char_count,
        'reading_time': reading_time,
        'h1_title': headings.get('h1_title'),
        'h1_count': headings.get('h1_count', 0),
        'h2_count': headings.get('h2_count', 0),
        'h3_count': headings.get('h3_count', 0),
        'h4_count': headings.get('h4_count', 0),
        'internal_links': links.get('internal_links', 0),
        'external_links': links.get('external_links', 0),
        'keyword_density': keyword_density,
    }

