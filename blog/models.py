"""
Models for blog app - Professional SEO-focused content management
"""
import uuid
import re
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.urls import reverse
from ckeditor_uploader.fields import RichTextUploadingField
from .managers import ArticleManager, CategoryManager, TagManager, CommentManager
from .constants import (
    ARTICLE_STATUS_CHOICES,
    ARTICLE_STATUS_PUBLISHED,
    ARTICLE_STATUS_DRAFT,
    ARTICLE_TYPE_CHOICES,
    ARTICLE_TYPE_BLOG,
    SEO_PRIORITY_CHOICES,
    SEO_PRIORITY_NORMAL,
    COMMENT_STATUS_CHOICES,
    COMMENT_STATUS_PENDING,
)
from .validators import (
    validate_slug,
    validate_meta_description,
    validate_meta_title,
)

User = get_user_model()


class Category(models.Model):
    """
    Category model for organizing articles
    """
    name = models.CharField(_('نام'), max_length=100, unique=True, db_index=True)
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=100,
        unique=True,
        db_index=True,
        validators=[validate_slug],
        help_text=_('اسلاگ یکتا برای URL'),
    )
    description = models.TextField(_('توضیحات'), null=True, blank=True)
    
    # SEO Fields
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
        validators=[validate_meta_title],
        help_text=_('عنوان برای SEO (حداکثر 60 کاراکتر)'),
    )
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
        validators=[validate_meta_description],
        help_text=_('توضیحات برای SEO (حداکثر 160 کاراکتر)'),
    )
    meta_keywords = models.CharField(
        _('کلمات کلیدی متا'),
        max_length=255,
        null=True,
        blank=True,
        help_text=_('کلمات کلیدی جدا شده با کاما'),
    )
    
    # Display
    image = models.ImageField(
        _('تصویر'),
        upload_to='blog/categories/',
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(_('فعال'), default=True, db_index=True)
    order = models.PositiveIntegerField(_('ترتیب نمایش'), default=0, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = CategoryManager()
    
    class Meta:
        verbose_name = _('دسته‌بندی')
        verbose_name_plural = _('دسته‌بندی‌ها')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug', 'is_active']),
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Public SPA path for this category"""
        return f'/magazine/category/{self.slug}/'


class Tag(models.Model):
    """
    Tag model for tagging articles
    """
    name = models.CharField(_('نام'), max_length=50, unique=True, db_index=True)
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=50,
        unique=True,
        db_index=True,
        validators=[validate_slug],
    )
    description = models.TextField(_('توضیحات'), null=True, blank=True)
    
    # SEO Fields
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
        validators=[validate_meta_description],
    )
    
    is_active = models.BooleanField(_('فعال'), default=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    
    objects = TagManager()
    
    class Meta:
        verbose_name = _('تگ')
        verbose_name_plural = _('تگ‌ها')
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug', 'is_active']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Public SPA path for this tag (magazine filter)"""
        return f'/magazine/?tag={self.slug}'


class Article(models.Model):
    """
    Article model - Professional SEO-optimized content management
    """
    # UUID for external references
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    # Basic Information
    title = models.CharField(_('عنوان'), max_length=200, db_index=True)
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=200,
        unique=True,
        db_index=True,
        validators=[validate_slug],
        help_text=_('اسلاگ یکتا برای URL'),
    )
    excerpt = models.TextField(
        _('خلاصه'),
        max_length=500,
        help_text=_('خلاصه مقاله (حداکثر 500 کاراکتر)'),
    )
    content = RichTextUploadingField(
        _('محتوای کامل'),
        config_name='seo_optimized',
        help_text=_(
            'ویرایشگر حرفه‌ای SEO: H1–H6، Justify، لینک داخلی/خارجی، تصویر، جدول، لیست، راست‌چین RTL'
        ),
    )
    
    # Heading Structure for SEO
    h1_title = models.CharField(
        _('عنوان H1'),
        max_length=200,
        null=True,
        blank=True,
        help_text=_('عنوان اصلی مقاله (H1) - برای SEO بسیار مهم است'),
    )
    h2_count = models.PositiveIntegerField(
        _('تعداد H2'),
        default=0,
        help_text=_('تعداد هدینگ‌های H2 در محتوا'),
    )
    h3_count = models.PositiveIntegerField(
        _('تعداد H3'),
        default=0,
        help_text=_('تعداد هدینگ‌های H3 در محتوا'),
    )
    h4_count = models.PositiveIntegerField(
        _('تعداد H4'),
        default=0,
        help_text=_('تعداد هدینگ‌های H4 در محتوا'),
    )
    
    # Link Statistics
    internal_link_count = models.PositiveIntegerField(
        _('تعداد لینک داخلی'),
        default=0,
        help_text=_('تعداد لینک‌های داخلی در مقاله'),
    )
    external_link_count = models.PositiveIntegerField(
        _('تعداد لینک خارجی'),
        default=0,
        help_text=_('تعداد لینک‌های خارجی در مقاله'),
    )
    backlink_count = models.PositiveIntegerField(
        _('تعداد بک لینک'),
        default=0,
        help_text=_('تعداد بک لینک‌های دریافت شده'),
    )
    
    # SEO Analysis
    keyword_density = models.DecimalField(
        _('چگالی کلمه کلیدی'),
        max_digits=5,
        decimal_places=2,
        default=0.0,
        help_text=_('چگالی کلمه کلیدی اصلی (درصد)'),
    )
    content_length = models.PositiveIntegerField(
        _('طول محتوا'),
        default=0,
        help_text=_('تعداد کاراکترهای محتوا'),
    )
    word_count = models.PositiveIntegerField(
        _('تعداد کلمات'),
        default=0,
        help_text=_('تعداد کلمات در محتوا'),
    )
    
    # Author
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='articles',
        verbose_name=_('نویسنده'),
        db_index=True,
    )
    
    # Categorization
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='articles',
        verbose_name=_('دسته‌بندی'),
        null=True,
        blank=True,
        db_index=True,
    )
    tags = models.ManyToManyField(
        Tag,
        related_name='articles',
        verbose_name=_('تگ‌ها'),
        blank=True,
    )
    
    # Article Type
    article_type = models.CharField(
        _('نوع مقاله'),
        max_length=20,
        choices=ARTICLE_TYPE_CHOICES,
        default=ARTICLE_TYPE_BLOG,
        db_index=True,
    )
    
    # Media
    featured_image = models.ImageField(
        _('تصویر شاخص'),
        upload_to='blog/articles/',
        null=True,
        blank=True,
        help_text=_('تصویر اصلی مقاله'),
    )
    image_alt = models.CharField(
        _('متن جایگزین تصویر'),
        max_length=200,
        null=True,
        blank=True,
        help_text=_('متن جایگزین برای SEO'),
    )
    
    # SEO Fields - Critical for Google indexing
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
        validators=[validate_meta_title],
        help_text=_('عنوان برای SEO (حداکثر 60 کاراکتر)'),
    )
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
        validators=[validate_meta_description],
        help_text=_('توضیحات برای SEO (حداکثر 160 کاراکتر)'),
    )
    meta_keywords = models.CharField(
        _('کلمات کلیدی متا'),
        max_length=255,
        null=True,
        blank=True,
        help_text=_('کلمات کلیدی جدا شده با کاما'),
    )
    seo_priority = models.CharField(
        _('اولویت SEO'),
        max_length=20,
        choices=SEO_PRIORITY_CHOICES,
        default=SEO_PRIORITY_NORMAL,
        db_index=True,
    )
    
    # Open Graph & Social Media
    og_title = models.CharField(
        _('عنوان Open Graph'),
        max_length=60,
        null=True,
        blank=True,
        help_text=_('عنوان برای شبکه‌های اجتماعی'),
    )
    og_description = models.CharField(
        _('توضیحات Open Graph'),
        max_length=160,
        null=True,
        blank=True,
        help_text=_('توضیحات برای شبکه‌های اجتماعی'),
    )
    og_image = models.ImageField(
        _('تصویر Open Graph'),
        upload_to='blog/og-images/',
        null=True,
        blank=True,
        help_text=_('تصویر برای اشتراک‌گذاری در شبکه‌های اجتماعی'),
    )
    
    # Canonical URL
    canonical_url = models.URLField(
        _('Canonical URL'),
        null=True,
        blank=True,
        help_text=_('URL کانونیکال برای جلوگیری از محتوای تکراری'),
    )
    
    # Status & Visibility
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=ARTICLE_STATUS_CHOICES,
        default=ARTICLE_STATUS_DRAFT,
        db_index=True,
    )
    is_featured = models.BooleanField(_('ویژه'), default=False, db_index=True)
    is_pinned = models.BooleanField(_('ثابت'), default=False)
    allow_comments = models.BooleanField(_('اجازه نظر'), default=True)
    
    # Statistics
    view_count = models.PositiveIntegerField(_('تعداد بازدید'), default=0, db_index=True)
    reading_time = models.PositiveIntegerField(
        _('زمان مطالعه (دقیقه)'),
        default=0,
        help_text=_('زمان تقریبی مطالعه مقاله'),
    )
    
    # Additional Metadata
    metadata = models.JSONField(
        _('اطلاعات اضافی'),
        default=dict,
        blank=True,
        help_text=_('اطلاعات اضافی به صورت JSON'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    published_at = models.DateTimeField(
        _('تاریخ انتشار'),
        null=True,
        blank=True,
        db_index=True,
        help_text=_('تاریخ و زمان انتشار مقاله'),
    )
    
    objects = ArticleManager()
    
    class Meta:
        verbose_name = _('مقاله')
        verbose_name_plural = _('مقالات')
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug', 'status']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['is_featured', 'status']),
            models.Index(fields=['view_count']),
            models.Index(fields=['seo_priority', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug, excerpt, and reading time"""
        from .utils import generate_slug, generate_excerpt, calculate_reading_time, generate_meta_description
        
        # Generate slug if not provided
        if not self.slug:
            self.slug = generate_slug(self.title)
        
        # Generate excerpt if not provided
        if not self.excerpt and self.content:
            self.excerpt = generate_excerpt(self.content, 200)
        
        # Calculate reading time
        if self.content:
            self.reading_time = calculate_reading_time(self.content)
        
        # Generate meta description if not provided
        if not self.meta_description and self.content:
            self.meta_description = generate_meta_description(self.content)
        
        # Set published_at when status changes to published
        if self.status == ARTICLE_STATUS_PUBLISHED and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Public SPA path for magazine article"""
        return f'/magazine/{self.slug}/'
    
    def get_canonical_url(self):
        """Get canonical URL (absolute when possible)"""
        from .url_helpers import absolute_public_url
        if self.canonical_url:
            return self.canonical_url
        return absolute_public_url(self.get_absolute_url())
    
    def get_og_image_url(self):
        """Get Open Graph image URL"""
        from .utils import generate_og_image_url
        return generate_og_image_url(self)
    
    def increment_view(self):
        """Increment view count"""
        from .utils import increment_view_count
        increment_view_count(self)
    
    def get_related_articles(self, limit=5):
        """Get related articles"""
        from .utils import get_related_articles
        return get_related_articles(self, limit)


class Comment(models.Model):
    """
    Comment model for article comments
    """
    # UUID for external references
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('مقاله'),
        db_index=True,
    )
    
    # Commenter Information
    name = models.CharField(_('نام'), max_length=100)
    email = models.EmailField(_('ایمیل'), db_index=True)
    website = models.URLField(_('وب‌سایت'), null=True, blank=True)
    
    # Comment Content
    content = models.TextField(_('متن نظر'))
    
    # Status
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=COMMENT_STATUS_CHOICES,
        default=COMMENT_STATUS_PENDING,
        db_index=True,
    )
    
    # IP Tracking
    ip_address = models.GenericIPAddressField(
        _('آی‌پی'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    # Parent Comment (for nested comments)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name=_('نظر والد'),
        null=True,
        blank=True,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = CommentManager()
    
    class Meta:
        verbose_name = _('نظر')
        verbose_name_plural = _('نظرات')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['article', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"Comment by {self.name} on {self.article.title}"


class SEOData(models.Model):
    """
    SEO Data model for storing additional SEO information
    """
    article = models.OneToOneField(
        Article,
        on_delete=models.CASCADE,
        related_name='seo_data',
        verbose_name=_('مقاله'),
    )
    
    # Structured Data (JSON-LD)
    structured_data = models.JSONField(
        _('داده‌های ساختاریافته'),
        default=dict,
        blank=True,
        help_text=_('داده‌های JSON-LD برای Google'),
    )
    
    # Schema.org markup
    schema_markup = models.TextField(
        _('Schema.org Markup'),
        null=True,
        blank=True,
        help_text=_('Schema.org markup برای SEO'),
    )
    
    # Robots Meta
    robots_index = models.BooleanField(_('اجازه ایندکس'), default=True)
    robots_follow = models.BooleanField(_('اجازه فالو'), default=True)
    robots_noarchive = models.BooleanField(_('عدم بایگانی'), default=False)
    robots_nosnippet = models.BooleanField(_('عدم نمایش خلاصه'), default=False)
    
    # Sitemap Priority
    sitemap_priority = models.DecimalField(
        _('اولویت در Sitemap'),
        max_digits=2,
        decimal_places=1,
        default=0.5,
        help_text=_('اولویت از 0.0 تا 1.0'),
    )
    sitemap_changefreq = models.CharField(
        _('فرکانس تغییر در Sitemap'),
        max_length=20,
        default='weekly',
        choices=[
            ('always', _('همیشه')),
            ('hourly', _('ساعتی')),
            ('daily', _('روزانه')),
            ('weekly', _('هفتگی')),
            ('monthly', _('ماهانه')),
            ('yearly', _('سالانه')),
            ('never', _('هرگز')),
        ],
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('اطلاعات SEO')
        verbose_name_plural = _('اطلاعات SEO')
    
    def __str__(self):
        return f"SEO Data for {self.article.title}"


class InternalLink(models.Model):
    """
    Internal link model for SEO - Links to other articles/pages
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    source_article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='internal_links',
        verbose_name=_('مقاله مبدأ'),
        db_index=True,
    )
    
    target_article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='internal_backlinks',
        verbose_name=_('مقاله مقصد'),
        db_index=True,
    )
    
    anchor_text = models.CharField(
        _('متن لنگر'),
        max_length=200,
        help_text=_('متن لینک که کاربر می‌بیند'),
    )
    
    link_position = models.CharField(
        _('موقعیت لینک'),
        max_length=20,
        choices=[
            ('content', _('در محتوا')),
            ('excerpt', _('در خلاصه')),
            ('related', _('در مقالات مرتبط')),
        ],
        default='content',
    )
    
    is_follow = models.BooleanField(
        _('Follow Link'),
        default=True,
        help_text=_('آیا لینک follow باشد یا nofollow'),
    )
    
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('لینک داخلی')
        verbose_name_plural = _('لینک‌های داخلی')
        unique_together = [['source_article', 'target_article', 'anchor_text']]
        indexes = [
            models.Index(fields=['source_article', 'target_article']),
            models.Index(fields=['is_follow']),
        ]
    
    def __str__(self):
        return f"{self.source_article.title} → {self.target_article.title}"


class ExternalLink(models.Model):
    """
    External link model for SEO - Links to external websites
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='external_links',
        verbose_name=_('مقاله'),
        db_index=True,
    )
    
    url = models.URLField(
        _('آدرس URL'),
        max_length=500,
        help_text=_('آدرس کامل لینک خارجی'),
    )
    
    anchor_text = models.CharField(
        _('متن لنگر'),
        max_length=200,
        help_text=_('متن لینک که کاربر می‌بیند'),
    )
    
    domain = models.CharField(
        _('دامنه'),
        max_length=200,
        db_index=True,
        help_text=_('دامنه لینک خارجی'),
    )
    
    is_follow = models.BooleanField(
        _('Follow Link'),
        default=False,
        help_text=_('لینک‌های خارجی معمولاً nofollow هستند'),
    )
    
    is_sponsored = models.BooleanField(
        _('لینک اسپانسر شده'),
        default=False,
        help_text=_('آیا لینک اسپانسر شده است'),
    )
    
    link_position = models.CharField(
        _('موقعیت لینک'),
        max_length=20,
        choices=[
            ('content', _('در محتوا')),
            ('excerpt', _('در خلاصه')),
            ('footer', _('در فوتر')),
        ],
        default='content',
    )
    
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('لینک خارجی')
        verbose_name_plural = _('لینک‌های خارجی')
        indexes = [
            models.Index(fields=['article', 'domain']),
            models.Index(fields=['is_follow', 'is_sponsored']),
        ]
    
    def __str__(self):
        return f"{self.article.title} → {self.domain}"


class Backlink(models.Model):
    """
    Backlink model for SEO - External sites linking to our articles
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    target_article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='backlinks',
        verbose_name=_('مقاله مقصد'),
        db_index=True,
    )
    
    source_url = models.URLField(
        _('آدرس منبع'),
        max_length=500,
        unique=True,
        help_text=_('آدرس کامل صفحه‌ای که به ما لینک داده'),
    )
    
    source_domain = models.CharField(
        _('دامنه منبع'),
        max_length=200,
        db_index=True,
        help_text=_('دامنه سایت منبع'),
    )
    
    anchor_text = models.CharField(
        _('متن لنگر'),
        max_length=200,
        null=True,
        blank=True,
        help_text=_('متن لینک در صفحه منبع'),
    )
    
    domain_authority = models.PositiveIntegerField(
        _('Domain Authority'),
        null=True,
        blank=True,
        help_text=_('Domain Authority سایت منبع (0-100)'),
    )
    
    is_follow = models.BooleanField(
        _('Follow Link'),
        default=True,
        help_text=_('آیا لینک follow است'),
    )
    
    link_type = models.CharField(
        _('نوع لینک'),
        max_length=20,
        choices=[
            ('dofollow', _('DoFollow')),
            ('nofollow', _('NoFollow')),
            ('sponsored', _('Sponsored')),
            ('ugc', _('User Generated Content')),
        ],
        default='dofollow',
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=[
            ('active', _('فعال')),
            ('broken', _('شکسته')),
            ('removed', _('حذف شده')),
        ],
        default='active',
        db_index=True,
    )
    
    discovered_at = models.DateTimeField(
        _('تاریخ کشف'),
        auto_now_add=True,
    )
    last_checked = models.DateTimeField(
        _('آخرین بررسی'),
        auto_now=True,
    )
    
    notes = models.TextField(
        _('یادداشت‌ها'),
        null=True,
        blank=True,
        help_text=_('یادداشت‌های مربوط به این بک لینک'),
    )
    
    class Meta:
        verbose_name = _('بک لینک')
        verbose_name_plural = _('بک لینک‌ها')
        indexes = [
            models.Index(fields=['target_article', 'status']),
            models.Index(fields=['source_domain', 'domain_authority']),
            models.Index(fields=['link_type', 'is_follow']),
        ]
    
    def __str__(self):
        return f"{self.source_domain} → {self.target_article.title}"


class IranCity(models.Model):
    """
    Model for Iranian cities - used in Iranology section
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    name = models.CharField(_('نام شهر'), max_length=100, unique=True, db_index=True)
    name_en = models.CharField(_('نام انگلیسی'), max_length=100, null=True, blank=True)
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=100,
        unique=True,
        db_index=True,
        validators=[validate_slug],
        help_text=_('اسلاگ یکتا برای URL'),
    )
    
    # Province/State
    province = models.CharField(_('استان'), max_length=100, db_index=True)
    province_en = models.CharField(_('استان (انگلیسی)'), max_length=100, null=True, blank=True)
    
    # Description
    description = models.TextField(_('توضیحات'), null=True, blank=True)
    
    # Images
    featured_image = models.ImageField(
        _('تصویر شاخص'),
        upload_to='blog/iran-cities/',
        null=True,
        blank=True,
        help_text=_('تصویر اصلی شهر'),
    )
    image_alt = models.CharField(
        _('متن جایگزین تصویر'),
        max_length=200,
        null=True,
        blank=True,
    )
    
    # SEO Fields
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
        validators=[validate_meta_title],
    )
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
        validators=[validate_meta_description],
    )
    meta_keywords = models.CharField(
        _('کلمات کلیدی متا'),
        max_length=255,
        null=True,
        blank=True,
    )
    
    # Display
    is_active = models.BooleanField(_('فعال'), default=True, db_index=True)
    order = models.PositiveIntegerField(_('ترتیب نمایش'), default=0, db_index=True)
    
    # Statistics
    view_count = models.PositiveIntegerField(_('تعداد بازدید'), default=0, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('شهر ایران')
        verbose_name_plural = _('شهرهای ایران')
        ordering = ['order', 'province', 'name']
        indexes = [
            models.Index(fields=['slug', 'is_active']),
            models.Index(fields=['province', 'is_active']),
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.province}"
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Public SPA path for Iran city page"""
        return f'/iranology/{self.slug}/'
    
    def increment_view(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class IranologyArticle(models.Model):
    """
    Article model specifically for Iranology section - linked to cities
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    # Link to city
    city = models.ForeignKey(
        IranCity,
        on_delete=models.CASCADE,
        related_name='articles',
        verbose_name=_('شهر'),
        db_index=True,
    )
    
    # Basic Information
    title = models.CharField(_('عنوان'), max_length=200, db_index=True)
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=200,
        unique=True,
        db_index=True,
        validators=[validate_slug],
        help_text=_('اسلاگ یکتا برای URL'),
    )
    excerpt = models.TextField(
        _('خلاصه'),
        max_length=500,
        help_text=_('خلاصه مقاله (حداکثر 500 کاراکتر)'),
    )
    content = RichTextUploadingField(
        _('محتوای کامل'),
        config_name='seo_optimized',
        help_text=_('محتوای کامل مقاله با ویرایشگر حرفه‌ای SEO'),
    )
    
    # Author
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='iranology_articles',
        verbose_name=_('نویسنده'),
        db_index=True,
    )
    
    # Media
    featured_image = models.ImageField(
        _('تصویر شاخص'),
        upload_to='blog/iranology-articles/',
        null=True,
        blank=True,
        help_text=_('تصویر اصلی مقاله'),
    )
    image_alt = models.CharField(
        _('متن جایگزین تصویر'),
        max_length=200,
        null=True,
        blank=True,
    )
    
    # SEO Fields
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
        validators=[validate_meta_title],
    )
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
        validators=[validate_meta_description],
    )
    meta_keywords = models.CharField(
        _('کلمات کلیدی متا'),
        max_length=255,
        null=True,
        blank=True,
    )
    
    # Status & Visibility
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=ARTICLE_STATUS_CHOICES,
        default=ARTICLE_STATUS_DRAFT,
        db_index=True,
    )
    is_featured = models.BooleanField(_('ویژه'), default=False, db_index=True)
    
    # Statistics
    view_count = models.PositiveIntegerField(_('تعداد بازدید'), default=0, db_index=True)
    reading_time = models.PositiveIntegerField(
        _('زمان مطالعه (دقیقه)'),
        default=0,
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    published_at = models.DateTimeField(
        _('تاریخ انتشار'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    class Meta:
        verbose_name = _('مقاله ایران‌شناسی')
        verbose_name_plural = _('مقالات ایران‌شناسی')
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug', 'status']),
            models.Index(fields=['city', 'status']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['is_featured', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.city.name}"
    
    def save(self, *args, **kwargs):
        """Auto-generate slug, excerpt, and reading time"""
        from .utils import generate_slug, generate_excerpt, calculate_reading_time, generate_meta_description
        
        # Generate slug if not provided
        if not self.slug:
            self.slug = generate_slug(self.title)
        
        # Generate excerpt if not provided
        if not self.excerpt and self.content:
            self.excerpt = generate_excerpt(self.content, 200)
        
        # Calculate reading time
        if self.content:
            self.reading_time = calculate_reading_time(self.content)
        
        # Generate meta description if not provided
        if not self.meta_description and self.content:
            self.meta_description = generate_meta_description(self.content)
        
        # Set published_at when status changes to published
        if self.status == ARTICLE_STATUS_PUBLISHED and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Public SPA path for Iranology article"""
        return f'/iranology/{self.city.slug}/{self.slug}/'
    
    def increment_view(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
