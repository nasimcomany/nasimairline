"""
Admin configuration for gallery app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import GalleryCategory, GalleryAlbum, GalleryImage, HeroSlider, HomePageSectionItem, HomePageSectionConfig

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


@admin.register(HomePageSectionItem)
class HomePageSectionItemAdmin(admin.ModelAdmin):
    """
    Admin for homepage section items (services, experience, survey image, FAQ, routes).
    Both main admin and limited admin can manage.
    """
    list_display = [
        'item_preview', 'title_fa', 'section_type', 'order', 'is_active',
        'created_by', 'created_at'
    ]
    list_filter = ['section_type', 'is_active', 'created_at']
    search_fields = ['title_fa', 'title_ar', 'title_en', 'description_fa', 'link_url']
    list_editable = ['order', 'is_active']
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'item_image_display']
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': (
                'section_type',
                'title_fa', 'title_ar', 'title_en',
                'description_fa', 'description_ar', 'description_en',
                'image', 'item_image_display', 'link_url',
            ),
            'description': (
                'SPECIAL_SERVICE / EXPERIENCE: تصویر + عنوان + لینک. '
                'SURVEY: یک آیتم با تصویر پس‌زمینه بنر و لینک دکمه. '
                'FAQ: عنوان زیر دایره + متن مودال در فیلد توضیح. '
                'POPULAR_ROUTES: عنوان مسیر، توضیح (قیمت/تاریخ)، تصویر کارت.'
            ),
        }),
        ('تنظیمات نمایش', {
            'fields': ('order', 'is_active')
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def item_preview(self, obj):
        """Preview image in list"""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '-'
    item_preview.short_description = 'تصویر'
    
    def item_image_display(self, obj):
        """Full image preview in form"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 300px; border-radius: 8px;" />',
                obj.image.url
            )
        return '-'
    item_image_display.short_description = 'پیش‌نمایش تصویر'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(HomePageSectionConfig)
class HomePageSectionConfigAdmin(admin.ModelAdmin):
    """
    Admin for section titles/copy - both main and limited admin can manage.
    """
    list_display = ['section_type', 'title1_fa', 'updated_at']
    list_filter = ['section_type']
    search_fields = ['title1_fa', 'title2_fa', 'title3_fa']
    readonly_fields = ['uuid', 'updated_at']
    
    fieldsets = (
        ('بخش', {
            'fields': ('section_type',),
            'description': (
                'HERO: خط۱ عنوان اصلی، خط۲ زیرعنوان. '
                'QUOTE: خط۱ متن فارسی/عربی، خط۲ متن انگلیسی کنار آن. '
                'MEMBERSHIP / SURVEY: خط۱ عنوان، خط۲ توضیح، خط۳ متن دکمه. '
                'FAQ / POPULAR_ROUTES / SPECIAL_SERVICE / EXPERIENCE: عناوین بخش.'
            ),
        }),
        ('عنوان خط ۱', {
            'fields': ('title1_fa', 'title1_ar', 'title1_en')
        }),
        ('عنوان خط ۲', {
            'fields': ('title2_fa', 'title2_ar', 'title2_en')
        }),
        ('عنوان خط ۳ (متن دکمه یا خط سوم)', {
            'fields': ('title3_fa', 'title3_ar', 'title3_en')
        }),
        ('اطلاعات', {
            'fields': ('uuid', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(HeroSlider)
class HeroSliderAdmin(admin.ModelAdmin):
    """
    Admin configuration for HeroSlider model
    Both admin types (superuser and limited) can manage hero slider images
    """
    list_display = [
        'slider_image_preview', 'title', 'order', 'is_active', 
        'created_by', 'created_at', 'updated_at'
    ]
    list_filter = ['is_active', 'created_at', 'created_by']
    search_fields = ['title', 'alt_text']
    list_editable = ['order', 'is_active']
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'slider_image_display']
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('title', 'image', 'slider_image_display', 'alt_text', 'link_url')
        }),
        ('تنظیمات نمایش', {
            'fields': ('order', 'is_active')
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def slider_image_preview(self, obj):
        """Display slider image preview in list"""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '-'
    slider_image_preview.short_description = 'تصویر'
    
    def slider_image_display(self, obj):
        """Display full slider image in form"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 600px; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />',
                obj.image.url
            )
        return '-'
    slider_image_display.short_description = 'پیش‌نمایش تصویر'
    
    def save_model(self, request, obj, form, change):
        """Auto-set created_by on creation"""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['activate_sliders', 'deactivate_sliders', 'delete_sliders']
    
    def has_delete_permission(self, request, obj=None):
        """Allow staff users to delete hero sliders"""
        return request.user.is_staff
    
    def delete_sliders(self, request, queryset):
        """Delete selected hero slider images"""
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} اسلایدر حذف شد.')
    delete_sliders.short_description = 'حذف اسلایدرهای انتخاب‌شده'
    
    def activate_sliders(self, request, queryset):
        """Activate selected sliders"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} اسلایدر فعال شد.')
    activate_sliders.short_description = 'فعال کردن اسلایدرهای انتخاب شده'
    
    def deactivate_sliders(self, request, queryset):
        """Deactivate selected sliders"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} اسلایدر غیرفعال شد.')
    deactivate_sliders.short_description = 'غیرفعال کردن اسلایدرهای انتخاب شده'