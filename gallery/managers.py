"""
Custom managers for gallery app
"""
from django.db import models
from .constants import (
    GALLERY_CATEGORY_ACTIVE,
    IMAGE_STATUS_PUBLISHED,
    ALBUM_STATUS_PUBLISHED,
)


class GalleryCategoryManager(models.Manager):
    """
    Custom manager for GalleryCategory
    """
    def active(self):
        """Return only active categories"""
        return self.filter(status=GALLERY_CATEGORY_ACTIVE)
    
    def with_image_count(self):
        """Annotate with image count"""
        return self.annotate(
            image_count=models.Count('images', distinct=True)
        )


class GalleryImageManager(models.Manager):
    """
    Custom manager for GalleryImage
    """
    def published(self):
        """Return only published images"""
        return self.filter(status=IMAGE_STATUS_PUBLISHED)
    
    def featured(self):
        """Return only featured images"""
        return self.filter(is_featured=True, status=IMAGE_STATUS_PUBLISHED)
    
    def by_category(self, category):
        """Filter by category"""
        return self.filter(category=category, status=IMAGE_STATUS_PUBLISHED)
    
    def recent(self, limit=10):
        """Get recent images"""
        return self.published().order_by('-created_at')[:limit]


class GalleryAlbumManager(models.Manager):
    """
    Custom manager for GalleryAlbum
    """
    def published(self):
        """Return only published albums"""
        return self.filter(status=ALBUM_STATUS_PUBLISHED)
    
    def featured(self):
        """Return only featured albums"""
        return self.filter(is_featured=True, status=ALBUM_STATUS_PUBLISHED)
    
    def with_image_count(self):
        """Annotate with image count"""
        return self.annotate(
            image_count=models.Count('images', distinct=True)
        )

