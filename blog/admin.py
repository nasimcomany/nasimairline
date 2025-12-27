"""
Admin configuration for blog app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from .models import Article, Category, Tag, Comment, SEOData, InternalLink, ExternalLink, Backlink, IranCity, IranologyArticle


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for Category model
    """
    list_display = ['name', 'slug', 'is_active', 'order', 'article_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    list_editable = ['is_active', 'order']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('name', 'slug', 'description', 'image', 'is_active', 'order')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',),
        }),
    )
    
    def article_count(self, obj):
        """Display article count"""
        count = obj.articles.filter(status='PUBLISHED').count()
        if count > 0:
            url = reverse('admin:blog_article_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} مقاله</a>', url, count)
        return '0 مقاله'
    article_count.short_description = 'تعداد مقالات'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """
    Admin configuration for Tag model
    """
    list_display = ['name', 'slug', 'is_active', 'article_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug']
    list_editable = ['is_active']
    prepopulated_fields = {'slug': ('name',)}
    
    def article_count(self, obj):
        """Display article count"""
        return obj.articles.filter(status='PUBLISHED').count()
    article_count.short_description = 'تعداد مقالات'


class SEODataInline(admin.StackedInline):
    """
    Inline admin for SEOData
    """
    model = SEOData
    extra = 0
    fieldsets = (
        ('داده‌های ساختاریافته', {
            'fields': ('structured_data', 'schema_markup'),
            'classes': ('collapse',),
        }),
        ('تنظیمات Robots', {
            'fields': ('robots_index', 'robots_follow', 'robots_noarchive', 'robots_nosnippet'),
        }),
        ('Sitemap', {
            'fields': ('sitemap_priority', 'sitemap_changefreq'),
        }),
    )


class InternalLinkInline(admin.TabularInline):
    """
    Inline admin for Internal Links
    """
    model = InternalLink
    fk_name = 'source_article'
    extra = 1
    fields = ['target_article', 'anchor_text', 'link_position', 'is_follow']
    autocomplete_fields = ['target_article']


class ExternalLinkInline(admin.TabularInline):
    """
    Inline admin for External Links
    """
    model = ExternalLink
    extra = 1
    fields = ['url', 'anchor_text', 'domain', 'is_follow', 'is_sponsored', 'link_position']


class BacklinkInline(admin.TabularInline):
    """
    Inline admin for Backlinks (read-only)
    """
    model = Backlink
    extra = 0
    fields = ['source_url', 'source_domain', 'anchor_text', 'domain_authority', 'link_type', 'status']
    readonly_fields = ['source_url', 'source_domain', 'anchor_text', 'domain_authority', 'link_type', 'status', 'discovered_at']
    can_delete = False


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """
    Admin configuration for Article model
    """
    list_display = [
        'title', 'author', 'category', 'status', 'is_featured', 'is_pinned',
        'view_count', 'reading_time', 'word_count', 'h2_count', 
        'internal_link_count', 'external_link_count', 'published_at', 'seo_score'
    ]
    list_filter = [
        'status', 'article_type', 'is_featured', 'is_pinned', 
        'category', 'author', 'seo_priority', 'published_at', 'created_at'
    ]
    search_fields = ['title', 'slug', 'excerpt', 'content', 'meta_keywords']
    list_editable = ['status', 'is_featured', 'is_pinned']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['author', 'category', 'tags']
    readonly_fields = [
        'uuid', 'view_count', 'reading_time', 'word_count', 'content_length',
        'h1_title', 'h2_count', 'h3_count', 'h4_count',
        'internal_link_count', 'external_link_count', 'backlink_count',
        'keyword_density', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'published_at'
    
    # Use CKEditor with upload capability for content field
    formfield_overrides = {
        'RichTextUploadingField': {'widget': CKEditorUploadingWidget(config_name='seo_optimized')},
    }
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'author', 'article_type')
        }),
        ('دسته‌بندی', {
            'fields': ('category', 'tags')
        }),
        ('رسانه', {
            'fields': ('featured_image', 'image_alt')
        }),
        ('SEO - مهم برای گوگل', {
            'fields': (
                'meta_title', 'meta_description', 'meta_keywords', 
                'seo_priority', 'canonical_url', 'keyword_density'
            ),
            'description': 'این فیلدها برای ایندکس شدن در گوگل بسیار مهم هستند'
        }),
        ('Open Graph & Social Media', {
            'fields': ('og_title', 'og_description', 'og_image'),
            'classes': ('collapse',),
        }),
        ('ساختار محتوا (Headings)', {
            'fields': ('h1_title', 'h2_count', 'h3_count', 'h4_count'),
            'description': 'ساختار هدینگ‌ها برای SEO بسیار مهم است',
            'classes': ('collapse',),
        }),
        ('لینک‌ها', {
            'fields': ('internal_link_count', 'external_link_count', 'backlink_count'),
            'classes': ('collapse',),
        }),
        ('تحلیل محتوا', {
            'fields': ('word_count', 'content_length', 'reading_time'),
            'classes': ('collapse',),
        }),
        ('وضعیت و نمایش', {
            'fields': (
                'status', 'is_featured', 'is_pinned', 
                'allow_comments', 'published_at'
            )
        }),
        ('آمار', {
            'fields': ('view_count',),
            'classes': ('collapse',),
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    inlines = [SEODataInline, InternalLinkInline, ExternalLinkInline, BacklinkInline]
    
    def seo_score(self, obj):
        """Calculate and display comprehensive SEO score"""
        score = 0
        
        # Basic SEO (40 points)
        if obj.meta_title:
            score += 10
        if obj.meta_description:
            score += 10
        if obj.meta_keywords:
            score += 5
        if obj.canonical_url:
            score += 5
        if obj.excerpt:
            score += 5
        if obj.h1_title:
            score += 5
        
        # Content Quality (30 points)
        if obj.word_count >= 300:
            score += 10
        elif obj.word_count >= 200:
            score += 5
        if obj.h2_count >= 2:
            score += 10
        if obj.keyword_density >= 1.0 and obj.keyword_density <= 3.0:
            score += 10
        
        # Media & Images (15 points)
        if obj.featured_image:
            score += 10
        if obj.image_alt:
            score += 5
        
        # Links (15 points)
        if obj.internal_link_count >= 2:
            score += 10
        if obj.external_link_count >= 1:
            score += 5
        
        color = 'green' if score >= 80 else 'orange' if score >= 50 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}/100</span>',
            color, score
        )
    seo_score.short_description = 'امتیاز SEO'
    
    actions = ['make_published', 'make_draft', 'make_featured']
    
    def make_published(self, request, queryset):
        """Mark selected articles as published"""
        from django.utils import timezone
        updated = queryset.update(status='PUBLISHED', published_at=timezone.now())
        self.message_user(request, f'{updated} مقاله منتشر شد.')
    make_published.short_description = 'منتشر کردن مقالات انتخاب شده'
    
    def make_draft(self, request, queryset):
        """Mark selected articles as draft"""
        updated = queryset.update(status='DRAFT')
        self.message_user(request, f'{updated} مقاله به پیش‌نویس تبدیل شد.')
    make_draft.short_description = 'تبدیل به پیش‌نویس'
    
    def make_featured(self, request, queryset):
        """Mark selected articles as featured"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} مقاله ویژه شد.')
    make_featured.short_description = 'ویژه کردن مقالات'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Comment model
    """
    list_display = [
        'name', 'email', 'article', 'status', 'ip_address', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'article']
    search_fields = ['name', 'email', 'content', 'article__title']
    list_editable = ['status']
    readonly_fields = ['uuid', 'ip_address', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('اطلاعات نظر', {
            'fields': ('article', 'name', 'email', 'website', 'content')
        }),
        ('وضعیت', {
            'fields': ('status',)
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'parent', 'ip_address', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['approve_comments', 'reject_comments', 'mark_as_spam']
    
    def approve_comments(self, request, queryset):
        """Approve selected comments"""
        updated = queryset.update(status='APPROVED')
        self.message_user(request, f'{updated} نظر تایید شد.')
    approve_comments.short_description = 'تایید نظرات انتخاب شده'
    
    def reject_comments(self, request, queryset):
        """Reject selected comments"""
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f'{updated} نظر رد شد.')
    reject_comments.short_description = 'رد نظرات انتخاب شده'
    
    def mark_as_spam(self, request, queryset):
        """Mark selected comments as spam"""
        updated = queryset.update(status='SPAM')
        self.message_user(request, f'{updated} نظر به عنوان اسپم علامت‌گذاری شد.')
    mark_as_spam.short_description = 'علامت‌گذاری به عنوان اسپم'


@admin.register(InternalLink)
class InternalLinkAdmin(admin.ModelAdmin):
    """
    Admin configuration for InternalLink model
    """
    list_display = ['source_article', 'target_article', 'anchor_text', 'link_position', 'is_follow', 'created_at']
    list_filter = ['link_position', 'is_follow', 'created_at']
    search_fields = ['source_article__title', 'target_article__title', 'anchor_text']
    autocomplete_fields = ['source_article', 'target_article']
    readonly_fields = ['uuid', 'created_at', 'updated_at']


@admin.register(ExternalLink)
class ExternalLinkAdmin(admin.ModelAdmin):
    """
    Admin configuration for ExternalLink model
    """
    list_display = ['article', 'domain', 'anchor_text', 'is_follow', 'is_sponsored', 'link_position', 'created_at']
    list_filter = ['is_follow', 'is_sponsored', 'link_position', 'domain', 'created_at']
    search_fields = ['article__title', 'url', 'domain', 'anchor_text']
    autocomplete_fields = ['article']
    readonly_fields = ['uuid', 'created_at', 'updated_at']


@admin.register(Backlink)
class BacklinkAdmin(admin.ModelAdmin):
    """
    Admin configuration for Backlink model
    """
    list_display = [
        'target_article', 'source_domain', 'anchor_text', 
        'domain_authority', 'link_type', 'status', 'discovered_at'
    ]
    list_filter = ['link_type', 'status', 'is_follow', 'domain_authority', 'discovered_at']
    search_fields = ['target_article__title', 'source_url', 'source_domain', 'anchor_text']
    autocomplete_fields = ['target_article']
    readonly_fields = ['uuid', 'discovered_at', 'last_checked']
    date_hierarchy = 'discovered_at'
    
    actions = ['mark_as_active', 'mark_as_broken', 'mark_as_removed']
    
    def mark_as_active(self, request, queryset):
        """Mark selected backlinks as active"""
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} بک لینک فعال شد.')
    mark_as_active.short_description = 'فعال کردن بک لینک‌های انتخاب شده'
    
    def mark_as_broken(self, request, queryset):
        """Mark selected backlinks as broken"""
        updated = queryset.update(status='broken')
        self.message_user(request, f'{updated} بک لینک به عنوان شکسته علامت‌گذاری شد.')
    mark_as_broken.short_description = 'علامت‌گذاری به عنوان شکسته'
    
    def mark_as_removed(self, request, queryset):
        """Mark selected backlinks as removed"""
        updated = queryset.update(status='removed')
        self.message_user(request, f'{updated} بک لینک به عنوان حذف شده علامت‌گذاری شد.')
    mark_as_removed.short_description = 'علامت‌گذاری به عنوان حذف شده'


@admin.register(SEOData)
class SEODataAdmin(admin.ModelAdmin):
    """
    Admin configuration for SEOData model
    """
    list_display = ['article', 'robots_index', 'robots_follow', 'sitemap_priority', 'updated_at']
    list_filter = ['robots_index', 'robots_follow', 'sitemap_changefreq']
    search_fields = ['article__title']
    autocomplete_fields = ['article']


@admin.register(IranCity)
class IranCityAdmin(admin.ModelAdmin):
    """
    Admin configuration for IranCity model
    """
    list_display = ['name', 'name_en', 'province', 'province_en', 'is_active', 'order', 'article_count', 'view_count', 'created_at']
    list_filter = ['province', 'is_active', 'created_at']
    search_fields = ['name', 'name_en', 'province', 'province_en', 'description']
    list_editable = ['is_active', 'order']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['uuid', 'view_count', 'created_at', 'updated_at']
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('name', 'name_en', 'slug', 'province', 'province_en', 'description', 'is_active', 'order')
        }),
        ('رسانه', {
            'fields': ('featured_image', 'image_alt')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',),
        }),
        ('آمار', {
            'fields': ('view_count', 'article_count'),
            'classes': ('collapse',),
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def article_count(self, obj):
        """Display article count"""
        count = obj.articles.filter(status='PUBLISHED').count()
        if count > 0:
            url = reverse('admin:blog_iranologyarticle_changelist') + f'?city__id__exact={obj.id}'
            return format_html('<a href="{}">{} مقاله</a>', url, count)
        return '0 مقاله'
    article_count.short_description = 'تعداد مقالات'


@admin.register(IranologyArticle)
class IranologyArticleAdmin(admin.ModelAdmin):
    """
    Admin configuration for IranologyArticle model
    """
    list_display = [
        'title', 'city', 'author', 'status', 'is_featured',
        'view_count', 'reading_time', 'published_at'
    ]
    list_filter = [
        'status', 'is_featured', 'city',
        'author', 'published_at', 'created_at'
    ]
    search_fields = ['title', 'slug', 'excerpt', 'content', 'meta_keywords']
    list_editable = ['status', 'is_featured']
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['author', 'city']
    readonly_fields = [
        'uuid', 'view_count', 'reading_time', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'published_at'
    
    # Use CKEditor with upload capability for content field
    formfield_overrides = {
        'RichTextUploadingField': {'widget': CKEditorUploadingWidget(config_name='seo_optimized')},
    }
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'author', 'city')
        }),
        ('رسانه', {
            'fields': ('featured_image', 'image_alt')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'description': 'این فیلدها برای ایندکس شدن در گوگل بسیار مهم هستند'
        }),
        ('وضعیت و نمایش', {
            'fields': ('status', 'is_featured', 'published_at')
        }),
        ('آمار', {
            'fields': ('view_count', 'reading_time'),
            'classes': ('collapse',),
        }),
        ('اطلاعات اضافی', {
            'fields': ('uuid', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def province(self, obj):
        """Display province"""
        return obj.city.province if obj.city else '-'
    province.short_description = 'استان'
    
    actions = ['make_published', 'make_draft', 'make_featured']
    
    def make_published(self, request, queryset):
        """Mark selected articles as published"""
        from django.utils import timezone
        updated = queryset.update(status='PUBLISHED', published_at=timezone.now())
        self.message_user(request, f'{updated} مقاله منتشر شد.')
    make_published.short_description = 'منتشر کردن مقالات انتخاب شده'
    
    def make_draft(self, request, queryset):
        """Mark selected articles as draft"""
        updated = queryset.update(status='DRAFT')
        self.message_user(request, f'{updated} مقاله به پیش‌نویس تبدیل شد.')
    make_draft.short_description = 'تبدیل به پیش‌نویس'
    
    def make_featured(self, request, queryset):
        """Mark selected articles as featured"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} مقاله ویژه شد.')
    make_featured.short_description = 'ویژه کردن مقالات'
