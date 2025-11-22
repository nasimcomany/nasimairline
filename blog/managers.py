"""
Custom managers for blog app
"""
from django.db import models
from django.utils import timezone
from .constants import (
    ARTICLE_STATUS_PUBLISHED,
    ARTICLE_STATUS_DRAFT,
)


class ArticleManager(models.Manager):
    """
    Custom manager for Article model
    """
    
    def published(self):
        """Return only published articles"""
        return self.filter(
            status=ARTICLE_STATUS_PUBLISHED,
            published_at__lte=timezone.now()
        )
    
    def draft(self):
        """Return only draft articles"""
        return self.filter(status=ARTICLE_STATUS_DRAFT)
    
    def featured(self):
        """Return only featured articles"""
        return self.published().filter(is_featured=True)
    
    def recent(self, limit=10):
        """Return recent published articles"""
        return self.published().order_by('-published_at')[:limit]
    
    def by_category(self, category_slug):
        """Return articles by category slug"""
        return self.published().filter(category__slug=category_slug)
    
    def by_tag(self, tag_slug):
        """Return articles by tag slug"""
        return self.published().filter(tags__slug=tag_slug)
    
    def search(self, query):
        """Search articles by title, content, or excerpt"""
        return self.published().filter(
            models.Q(title__icontains=query) |
            models.Q(content__icontains=query) |
            models.Q(excerpt__icontains=query)
        )


class CategoryManager(models.Manager):
    """
    Custom manager for Category model
    """
    
    def active(self):
        """Return only active categories"""
        return self.filter(is_active=True)
    
    def with_article_count(self):
        """Return categories with article count"""
        return self.active().annotate(
            article_count=models.Count('articles', filter=models.Q(articles__status=ARTICLE_STATUS_PUBLISHED))
        )


class TagManager(models.Manager):
    """
    Custom manager for Tag model
    """
    
    def active(self):
        """Return only active tags"""
        return self.filter(is_active=True)
    
    def popular(self, limit=20):
        """Return popular tags by article count"""
        return self.active().annotate(
            article_count=models.Count('articles', filter=models.Q(articles__status=ARTICLE_STATUS_PUBLISHED))
        ).order_by('-article_count')[:limit]


class CommentManager(models.Manager):
    """
    Custom manager for Comment model
    """
    
    def approved(self):
        """Return only approved comments"""
        from .constants import COMMENT_STATUS_APPROVED
        return self.filter(status=COMMENT_STATUS_APPROVED)
    
    def pending(self):
        """Return only pending comments"""
        from .constants import COMMENT_STATUS_PENDING
        return self.filter(status=COMMENT_STATUS_PENDING)
    
    def for_article(self, article):
        """Return comments for a specific article"""
        return self.approved().filter(article=article)

