"""
CSV exports for membership club (openable in Excel).
No extra packages — UTF-8 BOM so Persian shows correctly in Excel.
"""
import csv
from datetime import datetime, timedelta

from django.db.models import Count, Sum
from django.http import HttpResponse
from django.utils import timezone


def _csv_response(filename_prefix: str) -> HttpResponse:
    stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = (
        f'attachment; filename="{filename_prefix}_{stamp}.csv"'
    )
    response.write('\ufeff')  # Excel UTF-8 BOM
    return response


def _day_bounds(day=None):
    """Return (start, end) datetime for a local calendar day."""
    now = timezone.localtime(timezone.now())
    if day is None:
        day = now.date()
    start = timezone.make_aware(datetime.combine(day, datetime.min.time()))
    end = start + timedelta(days=1)
    return day, start, end


def _ensure_all_membership_rows():
    """Every registered user gets a membership activity row before full export."""
    from accounts.models import User
    from accounts.membership_models import UserMembershipActivity

    existing = set(
        UserMembershipActivity.objects.values_list('user_id', flat=True)
    )
    missing_ids = (
        User.objects.exclude(id__in=existing)
        .filter(is_staff=False, is_superuser=False)
        .values_list('id', flat=True)
    )
    UserMembershipActivity.objects.bulk_create(
        [UserMembershipActivity(user_id=uid) for uid in missing_ids],
        ignore_conflicts=True,
    )


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


def export_full_daily_membership_behavior_csv(day=None):
    """
    Full report for ALL club members with today's on-site behavior analysis.
    Built from real DB events (login, booking, payment, support, chat, wallet, upgrades).
    """
    from accounts.models import User, WalletTransaction
    from accounts.membership_models import UserMembershipActivity, MembershipUpgradeLog
    from bookings.models import Booking
    from payments.models import Payment

    try:
        from support.models import Ticket, ChatMessage
    except Exception:  # pragma: no cover
        Ticket = None
        ChatMessage = None

    _ensure_all_membership_rows()
    report_day, start, end = _day_bounds(day)

    users = (
        User.objects.filter(is_staff=False, is_superuser=False)
        .select_related('membership_activity', 'wallet')
        .order_by('-date_joined')
    )

    bookings_today = dict(
        Booking.objects.filter(created_at__gte=start, created_at__lt=end)
        .values('user_id')
        .annotate(c=Count('id'))
        .values_list('user_id', 'c')
    )
    from accounts.membership_booking_query import membership_booking_q
    bookings_confirmed_today = dict(
        Booking.objects.filter(
            created_at__gte=start,
            created_at__lt=end,
        )
        .filter(membership_booking_q())
        .values('user_id')
        .annotate(c=Count('id'))
        .values_list('user_id', 'c')
    )
    payments_today = {
        row['user_id']: row
        for row in Payment.objects.filter(created_at__gte=start, created_at__lt=end)
        .values('user_id')
        .annotate(c=Count('id'), total=Sum('amount'))
    }
    payments_ok_today = {
        row['user_id']: row
        for row in Payment.objects.filter(
            created_at__gte=start,
            created_at__lt=end,
            status='COMPLETED',
        )
        .values('user_id')
        .annotate(c=Count('id'), total=Sum('amount'))
    }
    upgrades_today = dict(
        MembershipUpgradeLog.objects.filter(created_at__gte=start, created_at__lt=end)
        .values('user_id')
        .annotate(c=Count('id'))
        .values_list('user_id', 'c')
    )
    wallet_tx_today = dict(
        WalletTransaction.objects.filter(created_at__gte=start, created_at__lt=end)
        .values('wallet__user_id')
        .annotate(c=Count('id'))
        .values_list('wallet__user_id', 'c')
    )

    tickets_today = {}
    chat_today = {}
    if Ticket is not None:
        tickets_today = dict(
            Ticket.objects.filter(created_at__gte=start, created_at__lt=end, user_id__isnull=False)
            .values('user_id')
            .annotate(c=Count('id'))
            .values_list('user_id', 'c')
        )
    if ChatMessage is not None:
        chat_today = dict(
            ChatMessage.objects.filter(created_at__gte=start, created_at__lt=end, user_id__isnull=False)
            .values('user_id')
            .annotate(c=Count('id'))
            .values_list('user_id', 'c')
        )

    response = _csv_response(f'membership_daily_full_{report_day.isoformat()}')
    writer = csv.writer(response)
    writer.writerow([
        'تاریخ گزارش',
        'ایمیل', 'نام', 'نام خانوادگی', 'کد ملی', 'موبایل',
        'سطح باشگاه', 'امتیاز وفاداری', 'حساب فعال؟',
        'تاریخ عضویت', 'روزهای عضویت',
        'آخرین ورود', 'آی‌پی آخرین ورود', 'امروز وارد شده؟',
        'رزرو امروز', 'رزرو تأییدشده امروز',
        'پرداخت امروز (تعداد)', 'مبلغ پرداخت امروز',
        'پرداخت موفق امروز (تعداد)', 'مبلغ پرداخت موفق امروز',
        'تیکت پشتیبانی امروز', 'پیام چت امروز',
        'تراکنش کیف‌پول امروز', 'ارتقا سطح امروز',
        'رزرو کل', 'پرواز انجام‌شده',
        'رزرو ۷ روز', 'رزرو ۳۰ روز', 'رزرو ۹۰ روز',
        'ماه‌های فعال', 'میانگین رزرو ماهانه',
        'اولین رزرو', 'آخرین رزرو',
        'وضعیت رفتاری امروز',
    ])

    for user in users.iterator(chunk_size=200):
        activity = getattr(user, 'membership_activity', None)
        uid = user.id
        last_login = timezone.localtime(user.last_login) if user.last_login else None
        logged_in_today = bool(last_login and start <= last_login < end)

        b_today = bookings_today.get(uid, 0)
        b_ok = bookings_confirmed_today.get(uid, 0)
        pay = payments_today.get(uid) or {}
        pay_ok = payments_ok_today.get(uid) or {}
        tix = tickets_today.get(uid, 0)
        chats = chat_today.get(uid, 0)
        wtx = wallet_tx_today.get(uid, 0)
        upg = upgrades_today.get(uid, 0)

        behavior_bits = []
        if logged_in_today:
            behavior_bits.append('ورود')
        if b_today:
            behavior_bits.append(f'رزرو×{b_today}')
        if pay_ok.get('c'):
            behavior_bits.append(f'پرداخت‌موفق×{pay_ok.get("c")}')
        elif pay.get('c'):
            behavior_bits.append(f'پرداخت×{pay.get("c")}')
        if tix:
            behavior_bits.append(f'تیکت×{tix}')
        if chats:
            behavior_bits.append(f'چت×{chats}')
        if wtx:
            behavior_bits.append(f'کیف‌پول×{wtx}')
        if upg:
            behavior_bits.append(f'ارتقا×{upg}')
        behavior = ' | '.join(behavior_bits) if behavior_bits else 'بدون فعالیت ثبت‌شده امروز'

        membership_days = 0
        if user.date_joined:
            membership_days = (timezone.now() - user.date_joined).days

        writer.writerow([
            report_day.isoformat(),
            user.email,
            user.first_name or '',
            user.last_name or '',
            user.national_id or '',
            user.phone_number or '',
            user.get_membership_level_display() if hasattr(user, 'get_membership_level_display') else user.membership_level,
            user.loyalty_points,
            'بله' if user.is_active else 'خیر',
            user.date_joined.isoformat() if user.date_joined else '',
            membership_days,
            last_login.isoformat() if last_login else '',
            user.last_login_ip or '',
            'بله' if logged_in_today else 'خیر',
            b_today,
            b_ok,
            pay.get('c') or 0,
            pay.get('total') or 0,
            pay_ok.get('c') or 0,
            pay_ok.get('total') or 0,
            tix,
            chats,
            wtx,
            upg,
            activity.total_bookings if activity else 0,
            activity.total_completed_flights if activity else 0,
            activity.bookings_last_7_days if activity else 0,
            activity.bookings_last_30_days if activity else 0,
            activity.bookings_last_90_days if activity else 0,
            activity.active_months_count if activity else 0,
            activity.average_bookings_per_month if activity else 0,
            activity.first_booking_date.isoformat() if activity and activity.first_booking_date else '',
            activity.last_booking_date.isoformat() if activity and activity.last_booking_date else '',
            behavior,
        ])

    return response


def export_daily_club_summary_csv(day=None):
    """One-row-per-day style summary of club/site behavior for the report day."""
    from accounts.models import User, WalletTransaction
    from accounts.membership_models import MembershipUpgradeLog
    from bookings.models import Booking
    from payments.models import Payment

    try:
        from support.models import Ticket, ChatMessage
    except Exception:  # pragma: no cover
        Ticket = None
        ChatMessage = None

    report_day, start, end = _day_bounds(day)
    members = User.objects.filter(is_staff=False, is_superuser=False)

    logins_today = members.filter(last_login__gte=start, last_login__lt=end).count()
    new_members = members.filter(date_joined__gte=start, date_joined__lt=end).count()
    bookings = Booking.objects.filter(created_at__gte=start, created_at__lt=end).count()
    from accounts.membership_booking_query import membership_booking_q
    bookings_ok = (
        Booking.objects.filter(created_at__gte=start, created_at__lt=end)
        .filter(membership_booking_q())
        .count()
    )
    payments = Payment.objects.filter(created_at__gte=start, created_at__lt=end).aggregate(
        c=Count('id'), total=Sum('amount')
    )
    payments_ok = Payment.objects.filter(
        created_at__gte=start, created_at__lt=end, status='COMPLETED'
    ).aggregate(c=Count('id'), total=Sum('amount'))
    upgrades = MembershipUpgradeLog.objects.filter(created_at__gte=start, created_at__lt=end).count()
    wallet_tx = WalletTransaction.objects.filter(created_at__gte=start, created_at__lt=end).count()
    tickets = Ticket.objects.filter(created_at__gte=start, created_at__lt=end).count() if Ticket else 0
    chats = (
        ChatMessage.objects.filter(created_at__gte=start, created_at__lt=end, user_id__isnull=False).count()
        if ChatMessage else 0
    )

    by_level = list(
        members.values('membership_level').annotate(c=Count('id')).order_by('membership_level')
    )

    response = _csv_response(f'membership_daily_summary_{report_day.isoformat()}')
    writer = csv.writer(response)
    writer.writerow(['عنوان', 'مقدار'])
    writer.writerow(['تاریخ گزارش', report_day.isoformat()])
    writer.writerow(['کل اعضای باشگاه (غیرپرسنل)', members.count()])
    writer.writerow(['ثبت‌نام امروز', new_members])
    writer.writerow(['ورود امروز', logins_today])
    writer.writerow(['رزرو امروز', bookings])
    writer.writerow(['رزرو تأییدشده امروز', bookings_ok])
    writer.writerow(['پرداخت امروز (تعداد)', payments.get('c') or 0])
    writer.writerow(['پرداخت امروز (مبلغ)', payments.get('total') or 0])
    writer.writerow(['پرداخت موفق امروز (تعداد)', payments_ok.get('c') or 0])
    writer.writerow(['پرداخت موفق امروز (مبلغ)', payments_ok.get('total') or 0])
    writer.writerow(['تیکت پشتیبانی امروز', tickets])
    writer.writerow(['پیام چت امروز (کاربران)', chats])
    writer.writerow(['تراکنش کیف‌پول امروز', wallet_tx])
    writer.writerow(['ارتقا سطح امروز', upgrades])
    writer.writerow([])
    writer.writerow(['توزیع سطح عضویت', 'تعداد'])
    for row in by_level:
        writer.writerow([row['membership_level'], row['c']])
    return response
