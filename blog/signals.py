"""
Signals for blog app
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Article, SEOData
from .utils import (
    generate_meta_description,
    count_headings,
    count_links,
    analyze_content_seo,
    calculate_reading_time,
)


@receiver(pre_save, sender=Article)
def auto_generate_seo_fields(sender, instance, **kwargs):
    """
    Auto-generate SEO fields if not provided and calculate SEO metrics
    """
    # Generate meta description if not provided
    if not instance.meta_description and instance.content:
        instance.meta_description = generate_meta_description(instance.content)
    
    # Generate OG fields if not provided
    if not instance.og_title:
        instance.og_title = instance.title[:60]
    
    if not instance.og_description and instance.meta_description:
        instance.og_description = instance.meta_description
    
    # Calculate SEO metrics if content exists
    if instance.content:
        # Analyze content
        main_keyword = instance.meta_keywords.split(',')[0].strip() if instance.meta_keywords else None
        seo_analysis = analyze_content_seo(instance.content, main_keyword)
        
        # Update heading counts
        headings = count_headings(instance.content)
        instance.h1_title = headings.get('h1_title') or instance.h1_title
        instance.h2_count = headings.get('h2_count', 0)
        instance.h3_count = headings.get('h3_count', 0)
        instance.h4_count = headings.get('h4_count', 0)
        
        # Update link counts
        links = count_links(instance.content)
        instance.internal_link_count = links.get('internal_links', 0)
        instance.external_link_count = links.get('external_links', 0)
        
        # Update content stats
        instance.content_length = seo_analysis.get('content_length', 0)
        instance.word_count = seo_analysis.get('word_count', 0)
        instance.keyword_density = seo_analysis.get('keyword_density', 0.0)
        
        # Calculate reading time
        instance.reading_time = calculate_reading_time(instance.content)
        
        # Update backlink count from related model (only after article has PK)
        if instance.pk:
            instance.backlink_count = instance.backlinks.filter(status='active').count()
        else:
            instance.backlink_count = 0


@receiver(post_save, sender=Article)
def create_seo_data(sender, instance, created, **kwargs):
    """
    Create SEOData when article is created
    """
    if created:
        SEOData.objects.get_or_create(article=instance)

