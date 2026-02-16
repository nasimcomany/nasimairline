"""
پنل ادمین ارسال پیامک - باشگاه مشتریان و ارسال به شماره‌های دلخواه
"""
from django.contrib import admin
from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.contrib import messages
from .models import SmsLog
from .services import send_sms_mellipayamak

User = get_user_model()

# سطوح مشتریان باشگاه (برنزی، نقره‌ای، طلایی، پلاتینیوم)
TIER_CHOICES = [
    ('BRONZE', 'برنزی'),
    ('SILVER', 'نقره‌ای'),
    ('GOLD', 'طلایی'),
    ('PLATINUM', 'پلاتینیوم'),
]


class SmsLogAdminForm(forms.ModelForm):
    """فرم ارسال پیامک با امکان انتخاب سطح و شماره‌های دلخواه"""
    
    tiers = forms.MultipleChoiceField(
        choices=TIER_CHOICES,
        required=False,
        widget=forms.CheckboxSelectMultiple,
        label=_('سطح‌های عضویت (برای ارسال به باشگاه مشتریان)')
    )
    
    class Meta:
        model = SmsLog
        fields = [
            'recipient_type', 'tiers', 'custom_numbers_raw',
            'message',
        ]
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4, 'placeholder': 'متن پیامک را وارد کنید...'}),
            'custom_numbers_raw': forms.Textarea(attrs={
                'rows': 5,
                'placeholder': 'شماره‌ها را با کاما یا خط جدید جدا کنید\nمثال: 09123456789, 09121111111'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.tiers:
            self.initial['tiers'] = self.instance.tiers
    
    def clean(self):
        data = super().clean()
        recipient_type = data.get('recipient_type')
        if recipient_type == SmsLog.RECIPIENT_TIER and not data.get('tiers'):
            raise forms.ValidationError(
                _('برای ارسال به باشگاه مشتریان، حداقل یک سطح عضویت انتخاب کنید.')
            )
        if recipient_type == SmsLog.RECIPIENT_CUSTOM and not (data.get('custom_numbers_raw') or '').strip():
            raise forms.ValidationError(
                _('برای ارسال به شماره دلخواه، حداقل یک شماره وارد کنید.')
            )
        return data


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'recipient_type', 'get_tiers_display',
        'sent_count', 'total_recipients', 'status',
        'created_by', 'created_at'
    ]
    list_filter = ['recipient_type', 'status', 'created_at']
    search_fields = ['message', 'custom_numbers_raw', 'error_message']
    readonly_fields = ['status', 'sent_count', 'total_recipients', 'error_message', 'created_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    form = SmsLogAdminForm
    
    def get_fieldsets(self, request, obj=None):
        base_fieldsets = (
            (_('گیرندگان'), {
                'fields': ('recipient_type', 'tiers', 'custom_numbers_raw'),
                'description': _(
                    'ارسال به مشتریان برنزی/نقره‌ای/طلایی: نوع را "مشتریان باشگاه" انتخاب کنید و سطح‌ها را مشخص کنید. '
                    'ارسال به شماره دلخواه: نوع را "شماره‌های دلخواه" انتخاب و شماره‌ها را در کادر وارد کنید.'
                ),
            }),
            (_('متن پیامک'), {
                'fields': ('message',),
            }),
        )
        if obj and obj.pk:
            return base_fieldsets + (
                (_('نتیجه ارسال'), {
                    'fields': ('status', 'sent_count', 'total_recipients', 'error_message'),
                }),
                (_('تاریخ'), {
                    'fields': ('created_at',),
                    'classes': ('collapse',),
                }),
            )
        return base_fieldsets
    
    def get_tiers_display(self, obj):
        if obj.tiers:
            names = dict(TIER_CHOICES)
            return ', '.join(names.get(t, t) for t in obj.tiers)
        return '-'
    get_tiers_display.short_description = 'سطح‌ها'
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj=None, **kwargs)
        # برای add، فیلدهای نتیجه را مخفی کنیم
        return form
    
    def add_view(self, request, form_url='', extra_context=None):
        """در add، از فرم ساده استفاده می‌کنیم و پس از ذخیره ارسال می‌کنیم"""
        return super().add_view(request, form_url, extra_context)
    
    def save_model(self, request, obj, form, change):
        if change:
            super().save_model(request, obj, form, change)
            return
        
        # حالت افزودن جدید - ارسال پیامک
        obj.created_by = request.user
        obj.status = SmsLog.STATUS_PENDING
        obj.total_recipients = 0
        obj.sent_count = 0
        
        # جمع‌آوری شماره‌های گیرنده
        phones = []
        
        if obj.recipient_type == SmsLog.RECIPIENT_TIER:
            tiers = form.cleaned_data.get('tiers') or obj.tiers or []
            if not tiers:
                obj.status = SmsLog.STATUS_FAILED
                obj.error_message = "لطفاً حداقل یک سطح عضویت انتخاب کنید."
                obj.save()
                messages.error(request, obj.error_message)
                return
            
            obj.tiers = list(tiers)
            users = User.objects.filter(
                membership_level__in=tiers,
                phone_number__isnull=False
            ).exclude(phone_number='')
            phones = [u.phone_number for u in users if u.phone_number]
            
        else:  # CUSTOM
            raw = form.cleaned_data.get('custom_numbers_raw') or obj.custom_numbers_raw or ''
            obj.custom_numbers_raw = raw
            if not raw.strip():
                obj.status = SmsLog.STATUS_FAILED
                obj.error_message = "لطفاً حداقل یک شماره وارد کنید."
                obj.save()
                messages.error(request, obj.error_message)
                return
            
            from .services import normalize_phone_for_sms
            for p in raw.replace(',', ' ').replace('،', ' ').split():
                p = p.strip()
                if p:
                    n = normalize_phone_for_sms(p)
                    if n and n not in phones:
                        phones.append(n)
        
        obj.total_recipients = len(phones)
        
        if not phones:
            obj.status = SmsLog.STATUS_FAILED
            obj.error_message = "هیچ شماره معتبری یافت نشد. (مشتریان انتخاب‌شده ممکن است شماره تلفن نداشته باشند)"
            obj.save()
            messages.error(request, obj.error_message)
            return
        
        if not obj.message or not obj.message.strip():
            obj.status = SmsLog.STATUS_FAILED
            obj.error_message = "متن پیامک نمی‌تواند خالی باشد."
            obj.save()
            messages.error(request, obj.error_message)
            return
        
        # ارسال پیامک
        success, sent_count, err = send_sms_mellipayamak(phones, obj.message)
        obj.sent_count = sent_count
        
        if success and sent_count == obj.total_recipients:
            obj.status = SmsLog.STATUS_SENT
            obj.error_message = ''
            messages.success(request, f"پیامک با موفقیت به {sent_count} شماره ارسال شد.")
        elif success and sent_count > 0:
            obj.status = SmsLog.STATUS_PARTIAL
            obj.error_message = err or ''
            messages.warning(request, f"تعداد {sent_count} از {obj.total_recipients} پیامک ارسال شد. {err}")
        else:
            obj.status = SmsLog.STATUS_FAILED
            obj.error_message = err or "خطا در ارسال"
            messages.error(request, f"ارسال ناموفق: {obj.error_message}")
        
        obj.save()
