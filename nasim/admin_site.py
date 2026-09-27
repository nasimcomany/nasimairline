"""
Custom Admin Site for limiting access to specific apps
"""
from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

User = get_user_model()


class LimitedAdminSite(AdminSite):
    """
    Custom Admin Site for content editors (blog, gallery, support, sms).
    No access to accounts / wallets / memberships / user management.
    """
    site_header = 'پنل مدیریت محدود - مقالات، چت، شکایات، گالری و پیامک'
    site_title = 'پنل محدود'
    index_title = 'مدیریت مقالات، چت، شکایات، گالری و پیامک'

    def has_permission(self, request):
        """
        Check if user has permission to access this admin site
        Only users with is_staff=True can access
        """
        return request.user.is_active and request.user.is_staff

    def each_context(self, request):
        """
        Add custom context to admin pages
        """
        context = super().each_context(request)
        context['is_limited_admin'] = True
        return context

    def get_app_list(self, request):
        """Only show content apps — never accounts / users / wallets."""
        app_list = super().get_app_list(request)
        allowed_apps = ['blog', 'support', 'gallery', 'sms']
        return [app for app in app_list if app['app_label'] in allowed_apps]


# Create limited admin site instance
limited_admin_site = LimitedAdminSite(name='limited_admin')

# Register User model for autocomplete fields (required for autocomplete_fields in other admins)
from accounts.models import User
from accounts.admin import UserAdmin
from django.utils.translation import gettext_lazy as _


class LimitedUserAdmin(UserAdmin):
    """
    Registered only so Article/author autocomplete keeps working.
    Limited admins must NOT manage user accounts from this panel.
    """
    list_display = [
        'email', 'username', 'first_name', 'last_name',
        'is_active', 'is_staff', 'date_joined',
    ]
    list_filter = ['is_active', 'is_staff', 'account_status', 'membership_level']
    readonly_fields = [
        'uuid', 'date_joined', 'last_login', 'created_at', 'updated_at',
        'is_superuser', 'is_staff', 'is_active', 'account_status',
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone_number']

    def has_module_permission(self, request):
        return False

    def has_view_permission(self, request, obj=None):
        # Autocomplete only (e.g. انتخاب نویسنده مقاله) — not the users list page
        if request.user.is_superuser:
            return True
        match = getattr(request, 'resolver_match', None)
        return bool(match and match.url_name == 'autocomplete')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


limited_admin_site.register(User, LimitedUserAdmin)

# Register blog models to limited admin site
from blog.models import (
    Article, Category, Tag, Comment, SEOData,
    InternalLink, ExternalLink, Backlink,
    IranCity, IranologyArticle
)
from blog.admin import (
    CategoryAdmin, TagAdmin, ArticleAdmin, 
    CommentAdmin, SEODataAdmin,
    InternalLinkAdmin, ExternalLinkAdmin, BacklinkAdmin,
    IranCityAdmin, IranologyArticleAdmin
)

limited_admin_site.register(Article, ArticleAdmin)
limited_admin_site.register(Category, CategoryAdmin)
limited_admin_site.register(Tag, TagAdmin)
limited_admin_site.register(Comment, CommentAdmin)
limited_admin_site.register(SEOData, SEODataAdmin)
limited_admin_site.register(InternalLink, InternalLinkAdmin)
limited_admin_site.register(ExternalLink, ExternalLinkAdmin)
limited_admin_site.register(Backlink, BacklinkAdmin)
limited_admin_site.register(IranCity, IranCityAdmin)
limited_admin_site.register(IranologyArticle, IranologyArticleAdmin)

# Register gallery models to limited admin site
from gallery.models import GalleryCategory, GalleryAlbum, GalleryImage, HeroSlider, HomePageSectionItem, HomePageSectionConfig
from gallery.admin import (
    GalleryCategoryAdmin, GalleryAlbumAdmin, GalleryImageAdmin, HeroSliderAdmin,
    HomePageSectionItemAdmin, HomePageSectionConfigAdmin
)

limited_admin_site.register(GalleryCategory, GalleryCategoryAdmin)
limited_admin_site.register(GalleryAlbum, GalleryAlbumAdmin)
limited_admin_site.register(GalleryImage, GalleryImageAdmin)
limited_admin_site.register(HeroSlider, HeroSliderAdmin)
limited_admin_site.register(HomePageSectionItem, HomePageSectionItemAdmin)
limited_admin_site.register(HomePageSectionConfig, HomePageSectionConfigAdmin)

# Register support (chat + complaints + survey + cabin safety + safety hazard) models to limited admin site
from support.models import ChatMessage, ComplaintForm, SurveyForm, CabinSafetyReportForm, SafetyHazardReportForm
from support.admin import ChatMessageAdmin, ComplaintFormAdmin, SurveyFormAdmin, CabinSafetyReportFormAdmin, SafetyHazardReportFormAdmin

limited_admin_site.register(ChatMessage, ChatMessageAdmin)
limited_admin_site.register(ComplaintForm, ComplaintFormAdmin)
limited_admin_site.register(SurveyForm, SurveyFormAdmin)
limited_admin_site.register(CabinSafetyReportForm, CabinSafetyReportFormAdmin)
limited_admin_site.register(SafetyHazardReportForm, SafetyHazardReportFormAdmin)

# Register SMS models to limited admin site (ارسال پیامک به باشگاه مشتریان)
from sms.models import SmsLog
from sms.admin import SmsLogAdmin

limited_admin_site.register(SmsLog, SmsLogAdmin)

