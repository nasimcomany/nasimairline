"""
CSV exports for membership club (openable in Excel).
No extra packages — UTF-8 BOM so Persian shows correctly in Excel.
"""
import csv
from datetime import datetime

from django.http import HttpResponse


def _csv_response(filename_prefix: str) -> HttpResponse:
    stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = (
        f'attachment; filename="{filename_prefix}_{stamp}.csv"'
    )
    response.write('\ufeff')  # Excel UTF-8 BOM
    return response


def export_tier_configs_csv(queryset):
    """Current admin-configurable tier rules (live snapshot)."""
    response = _csv_response('membership_tier_rules')
    writer = csv.writer(response)
    writer.writerow([
        'سطح', 'نام فارسی', 'نام انگلیسی',
        'حداقل رزرو کل', 'حداقل رزرو ماهانه', 'حداقل رزرو هفتگی',
        'حداقل روز عضویت', 'حداقل ماه فعال', 'حداقل پرواز انجام‌شده',
        'اولویت ۱', 'اولویت ۲', 'اولویت ۳',
        'فعال', 'ارتقا خودکار', 'آخرین بروزرسانی',
    ])
    for obj in queryset.order_by('tier'):
        writer.writerow([
            obj.get_tier_display(),
            obj.name_fa,
            obj.name_en,
            obj.min_bookings_total,
            obj.min_bookings_per_month,
            obj.min_bookings_per_week,
            obj.min_membership_days,
            obj.min_active_months,
            obj.min_completed_flights,
            obj.criteria_priority_1 or '',
            obj.criteria_priority_2 or '',
            obj.criteria_priority_3 or '',
            'بله' if obj.is_active else 'خیر',
            'بله' if obj.auto_upgrade else 'خیر',
            obj.updated_at.isoformat() if obj.updated_at else '',
        ])
    return response


def export_membership_activity_csv(queryset):
    """Member activity + current tier (reflects latest user.membership_level)."""
    response = _csv_response('membership_members_report')
    writer = csv.writer(response)
    writer.writerow([
        'ایمیل', 'نام', 'نام خانوادگی', 'کد ملی', 'موبایل',
        'سطح فعلی', 'امتیاز وفاداری',
        'تعداد رزرو کل', 'پرواز انجام‌شده',
        'رزرو ۷ روز', 'رزرو ۳۰ روز', 'رزرو ۹۰ روز',
        'ماه‌های فعال', 'میانگین رزرو ماهانه',
        'اولین رزرو', 'آخرین رزرو', 'تاریخ عضویت', 'آخرین محاسبه',
    ])
    qs = queryset.select_related('user')
    for activity in qs:
        user = activity.user
        writer.writerow([
            user.email,
            user.first_name or '',
            user.last_name or '',
            user.national_id or '',
            user.phone_number or '',
            user.get_membership_level_display() if hasattr(user, 'get_membership_level_display') else user.membership_level,
            user.loyalty_points,
            activity.total_bookings,
            activity.total_completed_flights,
            activity.bookings_last_7_days,
            activity.bookings_last_30_days,
            activity.bookings_last_90_days,
            activity.active_months_count,
            activity.average_bookings_per_month,
            activity.first_booking_date.isoformat() if activity.first_booking_date else '',
            activity.last_booking_date.isoformat() if activity.last_booking_date else '',
            user.date_joined.isoformat() if user.date_joined else '',
            activity.last_calculated_at.isoformat() if activity.last_calculated_at else '',
        ])
    return response


def export_upgrade_logs_csv(queryset):
    response = _csv_response('membership_upgrade_logs')
    writer = csv.writer(response)
    writer.writerow([
        'ایمیل', 'نام', 'نام خانوادگی',
        'سطح قبلی', 'سطح جدید', 'خودکار؟',
        'رزرو در زمان ارتقا', 'روز عضویت در زمان ارتقا',
        'دلیل', 'تاریخ',
    ])
    for log in queryset.select_related('user'):
        user = log.user
        writer.writerow([
            user.email,
            user.first_name or '',
            user.last_name or '',
            log.get_old_tier_display(),
            log.get_new_tier_display(),
            'بله' if log.is_automatic else 'خیر',
            log.total_bookings_at_upgrade,
            log.membership_days_at_upgrade,
            (log.reason or '').replace('\n', ' | '),
            log.created_at.isoformat() if log.created_at else '',
        ])
    return response


def export_users_membership_csv(queryset):
    """Selected users loyalty snapshot from Users admin."""
    response = _csv_response('users_membership_snapshot')
    writer = csv.writer(response)
    writer.writerow([
        'ایمیل', 'نام', 'نام خانوادگی', 'کد ملی', 'موبایل',
        'سطح عضویت', 'امتیاز', 'فعال؟', 'تاریخ عضویت',
        'رزرو کل', 'رزرو ۳۰ روز', 'ماه‌های فعال',
    ])
    for user in queryset:
        activity = getattr(user, 'membership_activity', None)
        writer.writerow([
            user.email,
            user.first_name or '',
            user.last_name or '',
            user.national_id or '',
            user.phone_number or '',
            user.get_membership_level_display() if hasattr(user, 'get_membership_level_display') else user.membership_level,
            user.loyalty_points,
            'بله' if user.is_active else 'خیر',
            user.date_joined.isoformat() if user.date_joined else '',
            activity.total_bookings if activity else 0,
            activity.bookings_last_30_days if activity else 0,
            activity.active_months_count if activity else 0,
        ])
    return response
