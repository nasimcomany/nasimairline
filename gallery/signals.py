"""
Signals for gallery app
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import GalleryImage, GalleryAlbum


@receiver(pre_save, sender=GalleryImage)
def auto_generate_seo_fields_image(sender, instance, **kwargs):
    """
    Auto-generate SEO fields for GalleryImage if not provided
    """
    # Generate alt_text from title if not provided
    if not instance.alt_text and instance.title:
        instance.alt_text = instance.title[:200]
    
    # Generate meta_title from title if not provided
    if not instance.meta_title and instance.title:
        instance.meta_title = instance.title[:60]
    
    # Generate meta_description from description if not provided
    if not instance.meta_description and instance.description:
        from django.utils.html import strip_tags
        text = strip_tags(instance.description)
        instance.meta_description = text[:160] if len(text) > 160 else text


@receiver(pre_save, sender=GalleryAlbum)
def auto_generate_seo_fields_album(sender, instance, **kwargs):
    """
    Auto-generate SEO fields for GalleryAlbum if not provided
    """
    # Generate meta_title from title if not provided
    if not instance.meta_title and instance.title:
        instance.meta_title = instance.title[:60]
    
    # Generate meta_description from description if not provided
    if not instance.meta_description and instance.description:
        from django.utils.html import strip_tags
        text = strip_tags(instance.description)
        instance.meta_description = text[:160] if len(text) > 160 else text

