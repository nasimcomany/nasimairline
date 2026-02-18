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
    Custom Admin Site that limits access to only blog and gallery apps
    """
    site_header = 'پنل مدیریت محدود - مقالات، چت، شکایات، گالری، مشتریان و پیامک'
    site_title = 'پنل محدود'
    index_title = 'مدیریت مقالات، چت، شکایات، گالری، مشتریان و پیامک'
    
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
        """
        Only show blog and gallery apps
        """
        app_list = super().get_app_list(request)
        
        # Filter to only show blog, support (chat), gallery, accounts (customers) and sms apps
        allowed_apps = ['blog', 'support', 'gallery', 'accounts', 'sms']
        filtered_app_list = []
        
        for app in app_list:
            if app['app_label'] in allowed_apps:
                filtered_app_list.append(app)
        
        return filtered_app_list


# Create limited admin site instance
limited_admin_site = LimitedAdminSite(name='limited_admin')

# Register User model for autocomplete fields (required for autocomplete_fields in other admins)
from accounts.models import User
from accounts.admin import UserAdmin

limited_admin_site.register(User, UserAdmin)

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

# Register support (chat + complaints) models to limited admin site
from support.models import ChatMessage, ComplaintForm
from support.admin import ChatMessageAdmin, ComplaintFormAdmin

limited_admin_site.register(ChatMessage, ChatMessageAdmin)
limited_admin_site.register(ComplaintForm, ComplaintFormAdmin)

# Register SMS models to limited admin site (ارسال پیامک به باشگاه مشتریان)
from sms.models import SmsLog
from sms.admin import SmsLogAdmin

limited_admin_site.register(SmsLog, SmsLogAdmin)

# Register accounts membership models to limited admin (لیست مشتریان برنزی/نقره‌ای/طلایی)
from accounts.models import Wallet, WalletTransaction
from accounts.admin import (
    WalletAdmin,
    WalletTransactionAdmin,
    MembershipTierConfigAdmin,
    UserMembershipActivityAdmin,
    MembershipUpgradeLogAdmin,
)
from accounts.membership_models import MembershipTierConfig, UserMembershipActivity, MembershipUpgradeLog

limited_admin_site.register(Wallet, WalletAdmin)
limited_admin_site.register(WalletTransaction, WalletTransactionAdmin)
limited_admin_site.register(MembershipTierConfig, MembershipTierConfigAdmin)
limited_admin_site.register(UserMembershipActivity, UserMembershipActivityAdmin)
limited_admin_site.register(MembershipUpgradeLog, MembershipUpgradeLogAdmin)

