"""
Admin configuration for gallery app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import GalleryCategory, GalleryAlbum, GalleryImage

User = get_user_model()


class GalleryImageInline(admin.TabularInline):
    """
    Inline admin for GalleryImage in Album
    """
    model = GalleryImage
    fk_name = 'album'
    extra = 1
    fields = ['title', 'image', 'status', 'is_featured', 'order']
    readonly_fields = ['view_count', 'download_count']


@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for GalleryCategory model
    """
    list_display = [
        'name', 'slug', 'status', 'is_featured', 'order', 
        'image_count', 'created_at'
    ]
    list_filter = ['status', 'is_featured', 'created_at']
    search_fields = ['name', 'slug', 'description']
    list_editable = ['status', 'is_featured', 'order']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('name', 'slug', 'description', 'image', 'status', 'is_featured', 'order')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',),
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def image_count(self, obj):
        """Display image count"""
        count = obj.images.filter(status='PUBLISHED').count()
        if count > 0:
            url = reverse('admin:gallery_galleryimage_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} تصویر</a>', url, count)
        return '0 تصویر'
    image_count.short_description = 'تعداد تصاویر'


@admin.register(GalleryAlbum)
class GalleryAlbumAdmin(admin.ModelAdmin):
    """
    Admin configuration for GalleryAlbum model
    """
    list_display = [
        'title', 'author', 'category', 'status', 'is_featured',
        'view_count', 'image_count', 'published_at'
    ]
    list_filter = [
        'status', 'is_featured', 'category', 'author', 'published_at', 'created_at'
    ]
    search_fields = ['title', 'slug', 'description']
    list_editable = ['status', 'is_featured']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['author', 'category']
    readonly_fields = ['uuid', 'view_count', 'created_at', 'updated_at', 'published_at']
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('title', 'slug', 'description', 'author', 'category', 'cover_image')
        }),
        ('وضعیت و نمایش', {
            'fields': ('status', 'is_featured', 'published_at')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',),
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    inlines = [GalleryImageInline]
    
    def image_count(self, obj):
        """Display image count in album"""
        count = obj.images.filter(status='PUBLISHED').count()
        return count
    image_count.short_description = 'تعداد تصاویر'
    
    actions = ['make_published', 'make_draft', 'make_featured']
    
    def make_published(self, request, queryset):
        """Mark selected albums as published"""
        from django.utils import timezone
        updated = queryset.update(status='PUBLISHED', published_at=timezone.now())
        self.message_user(request, f'{updated} آلبوم منتشر شد.')
    make_published.short_description = 'منتشر کردن آلبوم‌های انتخاب شده'
    
    def make_draft(self, request, queryset):
        """Mark selected albums as draft"""
        updated = queryset.update(status='DRAFT')
        self.message_user(request, f'{updated} آلبوم به پیش‌نویس تبدیل شد.')
    make_draft.short_description = 'تبدیل به پیش‌نویس'
    
    def make_featured(self, request, queryset):
        """Mark selected albums as featured"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} آلبوم ویژه شد.')
    make_featured.short_description = 'ویژه کردن آلبوم‌ها'


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    """
    Admin configuration for GalleryImage model
    """
    list_display = [
        'thumbnail_preview', 'title', 'author', 'category', 'album',
        'status', 'is_featured', 'is_pinned', 'view_count', 
        'download_count', 'published_at'
    ]
    list_filter = [
        'status', 'is_featured', 'is_pinned', 'media_type',
        'category', 'album', 'author', 'published_at', 'created_at'
    ]
    search_fields = ['title', 'slug', 'description', 'alt_text']
    list_editable = ['status', 'is_featured', 'is_pinned']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['author', 'category', 'album']
    readonly_fields = [
        'uuid', 'view_count', 'download_count', 'file_size',
        'width', 'height', 'created_at', 'updated_at', 'published_at',
        'image_preview', 'thumbnail_preview'
    ]
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('title', 'slug', 'description', 'author', 'media_type')
        }),
        ('تصویر', {
            'fields': ('image', 'image_preview', 'thumbnail', 'thumbnail_preview', 'alt_text')
        }),
        ('دسته‌بندی', {
            'fields': ('category', 'album')
        }),
        ('اطلاعات فنی', {
            'fields': ('file_size', 'width', 'height'),
            'classes': ('collapse',),
        }),
        ('وضعیت و نمایش', {
            'fields': ('status', 'is_featured', 'is_pinned', 'published_at')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',),
        }),
        ('آمار', {
            'fields': ('view_count', 'download_count'),
            'classes': ('collapse',),
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def image_preview(self, obj):
        """Display image preview"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'پیش‌نمایش تصویر'
    
    def thumbnail_preview(self, obj):
        """Display thumbnail preview in list"""
        if obj.thumbnail:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.thumbnail.url
            )
        elif obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.image.url
            )
        return '-'
    thumbnail_preview.short_description = 'تصویر'
    
    actions = ['make_published', 'make_draft', 'make_featured']
    
    def make_published(self, request, queryset):
        """Mark selected images as published"""
        from django.utils import timezone
        updated = queryset.update(status='PUBLISHED', published_at=timezone.now())
        self.message_user(request, f'{updated} تصویر منتشر شد.')
    make_published.short_description = 'منتشر کردن تصاویر انتخاب شده'
    
    def make_draft(self, request, queryset):
        """Mark selected images as draft"""
        updated = queryset.update(status='DRAFT')
        self.message_user(request, f'{updated} تصویر به پیش‌نویس تبدیل شد.')
    make_draft.short_description = 'تبدیل به پیش‌نویس'
    
    def make_featured(self, request, queryset):
        """Mark selected images as featured"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} تصویر ویژه شد.')
    make_featured.short_description = 'ویژه کردن تصاویر'
