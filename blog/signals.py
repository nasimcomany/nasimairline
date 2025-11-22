"""
Signals for blog app
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Article, SEOData


@receiver(pre_save, sender=Article)
def auto_generate_seo_fields(sender, instance, **kwargs):
    """
    Auto-generate SEO fields if not provided
    """
    from .utils import generate_meta_description
    
    # Generate meta description if not provided
    if not instance.meta_description and instance.content:
        instance.meta_description = generate_meta_description(instance.content)
    
    # Generate OG fields if not provided
    if not instance.og_title:
        instance.og_title = instance.title[:60]
    
    if not instance.og_description and instance.meta_description:
        instance.og_description = instance.meta_description


@receiver(post_save, sender=Article)
def create_seo_data(sender, instance, created, **kwargs):
    """
    Create SEOData when article is created
    """
    if created:
        SEOData.objects.get_or_create(article=instance)

