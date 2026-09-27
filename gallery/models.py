"""
Models for gallery app - Professional image and media management
"""
import uuid
import os
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.urls import reverse
from ckeditor_uploader.fields import RichTextUploadingField
from .managers import GalleryCategoryManager, GalleryImageManager, GalleryAlbumManager
from .constants import (
    GALLERY_CATEGORY_STATUS_CHOICES,
    GALLERY_CATEGORY_ACTIVE,
    IMAGE_STATUS_CHOICES,
    IMAGE_STATUS_PUBLISHED,
    ALBUM_STATUS_CHOICES,
    ALBUM_STATUS_PUBLISHED,
    MEDIA_TYPE_CHOICES,
    MEDIA_TYPE_IMAGE,
)
from .validators import (
    validate_image_size,
    validate_image_format,
    validate_video_size,
    validate_document_size,
)

User = get_user_model()


class GalleryCategory(models.Model):
    """
    Category model for organizing gallery items
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    name = models.CharField(
        _('نام'),
        max_length=100,
        unique=True,
        db_index=True,
    )
    
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=100,
        unique=True,
        db_index=True,
        help_text=_('اسلاگ یکتا برای URL'),
    )
    
    description = models.TextField(
        _('توضیحات'),
        null=True,
        blank=True,
    )
    
    image = models.ImageField(
        _('تصویر شاخص'),
        upload_to='gallery/categories/',
        null=True,
        blank=True,
        help_text=_('تصویر نماینده دسته‌بندی'),
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=GALLERY_CATEGORY_STATUS_CHOICES,
        default=GALLERY_CATEGORY_ACTIVE,
        db_index=True,
    )
    
    order = models.PositiveIntegerField(
        _('ترتیب نمایش'),
        default=0,
        db_index=True,
    )
    
    is_featured = models.BooleanField(
        _('ویژه'),
        default=False,
        db_index=True,
    )
    
    # SEO Fields
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
        help_text=_('عنوان برای SEO'),
    )
    
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
        help_text=_('توضیحات برای SEO'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    objects = GalleryCategoryManager()
    
    class Meta:
        verbose_name = _('دسته‌بندی گالری')
        verbose_name_plural = _('دسته‌بندی‌های گالری')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug', 'status']),
            models.Index(fields=['status', 'order']),
            models.Index(fields=['is_featured', 'status']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Get absolute URL for category"""
        return reverse('gallery:category-detail', kwargs={'slug': self.slug})


class GalleryAlbum(models.Model):
    """
    Album model for grouping related images
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    title = models.CharField(
        _('عنوان'),
        max_length=200,
        db_index=True,
    )
    
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=200,
        unique=True,
        db_index=True,
        help_text=_('اسلاگ یکتا برای URL'),
    )
    
    description = RichTextUploadingField(
        _('توضیحات'),
        null=True,
        blank=True,
        help_text=_('توضیحات کامل آلبوم'),
    )
    
    category = models.ForeignKey(
        GalleryCategory,
        on_delete=models.SET_NULL,
        related_name='albums',
        verbose_name=_('دسته‌بندی'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    cover_image = models.ImageField(
        _('تصویر جلد'),
        upload_to='gallery/albums/',
        null=True,
        blank=True,
        help_text=_('تصویر نماینده آلبوم'),
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='gallery_albums',
        verbose_name=_('نویسنده'),
        db_index=True,
    )
    
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=ALBUM_STATUS_CHOICES,
        default=ALBUM_STATUS_PUBLISHED,
        db_index=True,
    )
    
    is_featured = models.BooleanField(
        _('ویژه'),
        default=False,
        db_index=True,
    )
    
    view_count = models.PositiveIntegerField(
        _('تعداد بازدید'),
        default=0,
        db_index=True,
    )
    
    # SEO Fields
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
    )
    
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
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
    
    objects = GalleryAlbumManager()
    
    class Meta:
        verbose_name = _('آلبوم گالری')
        verbose_name_plural = _('آلبوم‌های گالری')
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug', 'status']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['is_featured', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug and set published_at"""
        if not self.slug:
            self.slug = slugify(self.title)
        
        if self.status == ALBUM_STATUS_PUBLISHED and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Get absolute URL for album"""
        return reverse('gallery:album-detail', kwargs={'slug': self.slug})


class GalleryImage(models.Model):
    """
    Image model for gallery - Professional image management
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    title = models.CharField(
        _('عنوان'),
        max_length=200,
        db_index=True,
    )
    
    slug = models.SlugField(
        _('اسلاگ'),
        max_length=200,
        unique=True,
        db_index=True,
        help_text=_('اسلاگ یکتا برای URL'),
    )
    
    description = RichTextUploadingField(
        _('توضیحات'),
        null=True,
        blank=True,
        help_text=_('توضیحات کامل تصویر'),
    )
    
    # Media File
    image = models.ImageField(
        _('تصویر'),
        upload_to='gallery/images/',
        validators=[validate_image_size, validate_image_format],
        help_text=_('تصویر اصلی (حداکثر 10MB)'),
    )
    
    thumbnail = models.ImageField(
        _('تصویر کوچک'),
        upload_to='gallery/thumbnails/',
        null=True,
        blank=True,
        help_text=_('تصویر کوچک (خودکار تولید می‌شود)'),
    )
    
    # Categorization
    category = models.ForeignKey(
        GalleryCategory,
        on_delete=models.SET_NULL,
        related_name='images',
        verbose_name=_('دسته‌بندی'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    album = models.ForeignKey(
        GalleryAlbum,
        on_delete=models.SET_NULL,
        related_name='images',
        verbose_name=_('آلبوم'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='gallery_images',
        verbose_name=_('نویسنده'),
        db_index=True,
    )
    
    # Media Information
    media_type = models.CharField(
        _('نوع رسانه'),
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        default=MEDIA_TYPE_IMAGE,
        db_index=True,
    )
    
    file_size = models.PositiveIntegerField(
        _('حجم فایل (بایت)'),
        default=0,
        help_text=_('حجم فایل به بایت'),
    )
    
    width = models.PositiveIntegerField(
        _('عرض'),
        default=0,
        help_text=_('عرض تصویر به پیکسل'),
    )
    
    height = models.PositiveIntegerField(
        _('ارتفاع'),
        default=0,
        help_text=_('ارتفاع تصویر به پیکسل'),
    )
    
    # Status & Visibility
    status = models.CharField(
        _('وضعیت'),
        max_length=20,
        choices=IMAGE_STATUS_CHOICES,
        default=IMAGE_STATUS_PUBLISHED,
        db_index=True,
    )
    
    is_featured = models.BooleanField(
        _('ویژه'),
        default=False,
        db_index=True,
    )
    
    is_pinned = models.BooleanField(
        _('ثابت'),
        default=False,
        db_index=True,
    )
    
    order = models.PositiveIntegerField(
        _('ترتیب نمایش'),
        default=0,
        db_index=True,
        help_text=_('ترتیب نمایش در آلبوم'),
    )
    
    view_count = models.PositiveIntegerField(
        _('تعداد بازدید'),
        default=0,
        db_index=True,
    )
    
    download_count = models.PositiveIntegerField(
        _('تعداد دانلود'),
        default=0,
        db_index=True,
    )
    
    # SEO Fields
    alt_text = models.CharField(
        _('متن جایگزین'),
        max_length=200,
        null=True,
        blank=True,
        help_text=_('متن جایگزین برای SEO و دسترسی‌پذیری'),
    )
    
    meta_title = models.CharField(
        _('عنوان متا'),
        max_length=60,
        null=True,
        blank=True,
    )
    
    meta_description = models.CharField(
        _('توضیحات متا'),
        max_length=160,
        null=True,
        blank=True,
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
    )
    
    objects = GalleryImageManager()
    
    class Meta:
        verbose_name = _('تصویر گالری')
        verbose_name_plural = _('تصاویر گالری')
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug', 'status']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['album', 'status']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['is_featured', 'status']),
            models.Index(fields=['media_type', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug, extract image info, and optimize"""
        from .utils import generate_slug, get_image_dimensions, calculate_file_size, optimize_image, generate_thumbnail
        from django.utils import timezone
        
        # Generate slug
        if not self.slug:
            self.slug = generate_slug(self.title)
        
        # Extract image information
        if self.image:
            # Get dimensions
            width, height = get_image_dimensions(self.image)
            self.width = width
            self.height = height
            
            # Get file size
            self.file_size = calculate_file_size(self.image)
            
            # Optimize image
            if hasattr(self.image, 'path'):
                optimize_image(self.image.path)
                
                # Generate thumbnail
                if not self.thumbnail:
                    thumbnail_path = self.image.path.replace('images', 'thumbnails')
                    os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
                    generate_thumbnail(self.image.path, thumbnail_path)
                    self.thumbnail.name = thumbnail_path.replace(
                        os.path.dirname(thumbnail_path) + '/',
                        'gallery/thumbnails/'
                    )
        
        # Set published_at
        if self.status == IMAGE_STATUS_PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Get absolute URL for image"""
        return reverse('gallery:image-detail', kwargs={'slug': self.slug})
    
    def increment_view(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def increment_download(self):
        """Increment download count"""
        self.download_count += 1
        self.save(update_fields=['download_count'])


SECTION_TYPE_CHOICES = [
    ('SPECIAL_SERVICE', _('خدمات ویژه')),
    ('EXPERIENCE', _('پرواز با هواپیمایی نسیم')),
    ('HERO', _('متن هیرو (بالای صفحه)')),
    ('QUOTE', _('نقل‌قول زیر هیرو')),
    ('MEMBERSHIP', _('بنر عضویت')),
    ('SURVEY', _('بنر نظرسنجی / تصویر بزرگ')),
    ('FAQ', _('سوالات متداول')),
    ('POPULAR_ROUTES', _('مسیرهای پرطرفدار')),
]


class HomePageSectionItem(models.Model):
    """
    Homepage section items (images + titles + optional body text + link).
    Both main admin and limited admin can manage these.
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    section_type = models.CharField(
        _('نوع بخش'),
        max_length=20,
        choices=SECTION_TYPE_CHOICES,
        db_index=True,
        help_text=_(
            'SPECIAL_SERVICE / EXPERIENCE / SURVEY (تصویر بنر) / FAQ / POPULAR_ROUTES'
        ),
    )
    
    title_fa = models.CharField(
        _('عنوان فارسی'),
        max_length=200,
    )
    
    title_ar = models.CharField(
        _('عنوان عربی'),
        max_length=200,
        blank=True,
    )
    
    title_en = models.CharField(
        _('عنوان انگلیسی'),
        max_length=200,
        blank=True,
    )

    description_fa = models.TextField(
        _('متن / توضیح فارسی'),
        blank=True,
        help_text=_('متن بدنه، قیمت کارت مسیر، یا محتوای مودال FAQ'),
    )
    description_ar = models.TextField(
        _('متن / توضیح عربی'),
        blank=True,
    )
    description_en = models.TextField(
        _('متن / توضیح انگلیسی'),
        blank=True,
    )
    
    image = models.ImageField(
        _('تصویر'),
        upload_to='homepage_sections/',
        validators=[validate_image_size, validate_image_format],
        help_text=_('تصویر المان'),
        null=True,
        blank=True,
    )
    
    link_url = models.CharField(
        _('لینک'),
        max_length=500,
        blank=True,
        help_text=_(
            'مسیر داخلی: /tickets | لینک خارجی: https://example.com | '
            'اسکرول: #search-form | چت: chat:luggage_tracking'
        ),
    )
    
    order = models.PositiveIntegerField(
        _('ترتیب نمایش'),
        default=0,
        db_index=True,
    )
    
    is_active = models.BooleanField(
        _('فعال'),
        default=True,
        db_index=True,
    )
    
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='homepage_section_items',
        verbose_name=_('ایجاد شده توسط'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    class Meta:
        verbose_name = _('المان بخش صفحه اصلی')
        verbose_name_plural = _('المان‌های بخش صفحه اصلی')
        ordering = ['section_type', 'order', '-created_at']
        indexes = [
            models.Index(fields=['section_type', 'is_active']),
            models.Index(fields=['order', 'section_type']),
        ]
    
    def __str__(self):
        return f"{self.get_section_type_display()} - {self.title_fa} (ترتیب: {self.order})"


class HomePageSectionConfig(models.Model):
    """
    Section-level titles/copy for homepage blocks (multilingual).
    HERO: title1=headline, title2=subtitle
    SURVEY/MEMBERSHIP: title1=heading, title2=body, title3=button label
    FAQ/QUOTE/POPULAR_ROUTES/SPECIAL_SERVICE/EXPERIENCE: section headings
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    section_type = models.CharField(
        _('نوع بخش'),
        max_length=20,
        choices=SECTION_TYPE_CHOICES,
        unique=True,
        db_index=True,
    )
    
    title1_fa = models.CharField(_('عنوان خط ۱ (فارسی)'), max_length=300, blank=True)
    title1_ar = models.CharField(_('عنوان خط ۱ (عربی)'), max_length=300, blank=True)
    title1_en = models.CharField(_('عنوان خط ۱ (انگلیسی)'), max_length=300, blank=True)
    title2_fa = models.CharField(_('عنوان خط ۲ (فارسی)'), max_length=500, blank=True)
    title2_ar = models.CharField(_('عنوان خط ۲ (عربی)'), max_length=500, blank=True)
    title2_en = models.CharField(_('عنوان خط ۲ (انگلیسی)'), max_length=500, blank=True)
    title3_fa = models.CharField(_('عنوان خط ۳ (فارسی)'), max_length=300, blank=True)
    title3_ar = models.CharField(_('عنوان خط ۳ (عربی)'), max_length=300, blank=True)
    title3_en = models.CharField(_('عنوان خط ۳ (انگلیسی)'), max_length=300, blank=True)
    
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    
    class Meta:
        verbose_name = _('تنظیمات عنوان بخش صفحه اصلی')
        verbose_name_plural = _('تنظیمات عناوین بخش صفحه اصلی')
    
    def __str__(self):
        return f"{self.get_section_type_display()}"


class HeroSlider(models.Model):
    """
    Hero Slider model for homepage banner images
    Both admin types can manage these images
    """
    uuid = models.UUIDField(
        _('شناسه یکتا'),
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    
    title = models.CharField(
        _('عنوان'),
        max_length=200,
        help_text=_('عنوان توضیحی برای تصویر'),
    )
    
    image = models.ImageField(
        _('تصویر'),
        upload_to='hero_slider/',
        validators=[validate_image_size, validate_image_format],
        help_text=_('تصویر اصلی اسلایدر (حداکثر 10MB، توصیه می‌شود: 1920x1080)'),
    )
    
    alt_text = models.CharField(
        _('متن جایگزین'),
        max_length=200,
        null=True,
        blank=True,
        help_text=_('متن جایگزین برای SEO و دسترسی‌پذیری'),
    )
    
    order = models.PositiveIntegerField(
        _('ترتیب نمایش'),
        default=0,
        db_index=True,
        help_text=_('ترتیب نمایش در اسلایدر (عدد کمتر = اولویت بیشتر)'),
    )
    
    is_active = models.BooleanField(
        _('فعال'),
        default=True,
        db_index=True,
        help_text=_('فعال/غیرفعال بودن تصویر در اسلایدر'),
    )
    
    link_url = models.URLField(
        _('لینک'),
        null=True,
        blank=True,
        help_text=_('لینک اختیاری برای هدایت کاربر پس از کلیک'),
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('تاریخ به‌روزرسانی'), auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='hero_sliders',
        verbose_name=_('ایجاد شده توسط'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    class Meta:
        verbose_name = _('اسلایدر صفحه اصلی')
        verbose_name_plural = _('اسلایدرهای صفحه اصلی')
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['is_active', 'order']),
            models.Index(fields=['order', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} (ترتیب: {self.order})"
    
    def save(self, *args, **kwargs):
        """Auto-generate alt text if not provided"""
        if not self.alt_text:
            self.alt_text = self.title
        super().save(*args, **kwargs)