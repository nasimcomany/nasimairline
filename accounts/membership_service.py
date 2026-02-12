"""
Membership Tier Upgrade Service
سرویس محاسبه و ارتقا خودکار tier کاربران
"""
from django.utils import timezone
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class MembershipTierService:
    """
    سرویس مدیریت tier های باشگاه مشتریان
    """
    TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
    TIER_RANK = {tier: idx for idx, tier in enumerate(TIER_ORDER)}
    
    @staticmethod
    def check_and_upgrade_user_tier(user, force=False):
        """
        بررسی و ارتقا tier کاربر
        
        Args:
            user: شی User
            force: اگر True باشه حتی اگر auto_upgrade غیرفعال باشه هم ارتقا میده
        
        Returns:
            tuple: (upgraded: bool, new_tier: str, old_tier: str)
        """
        from .membership_models import (
            MembershipTierConfig,
            UserMembershipActivity,
            MembershipUpgradeLog
        )
        
        # بروزرسانی آمار کاربر
        activity, _ = UserMembershipActivity.objects.get_or_create(user=user)
        activity.update_statistics()
        
        current_tier = user.membership_level
        old_tier = current_tier
        
        # گرفتن تمام tier های فعال به ترتیب واقعی از بالا به پایین
        tier_configs = list(MembershipTierConfig.objects.filter(is_active=True))
        tier_configs.sort(
            key=lambda cfg: MembershipTierService.TIER_RANK.get(cfg.tier, -1),
            reverse=True
        )
        
        if not tier_configs:
            logger.warning("No active membership tier configs found")
            return False, current_tier, old_tier
        
        # محاسبه بالاترین tier ای که کاربر شرایطش رو داره
        eligible_tier = None
        eligible_config = None
        upgrade_reason_parts = []
        
        for config in tier_configs:
            if MembershipTierService._check_tier_eligibility(user, activity, config):
                eligible_tier = config.tier
                eligible_config = config
                upgrade_reason_parts = MembershipTierService._get_eligibility_reasons(
                    user, activity, config
                )
                break
        
        # اگر tier جدید پیدا نشد، کاربر برنزی می‌مونه
        if not eligible_tier:
            # اگر کاربر tier بالاتری داشته، پایین نمی‌یاریم
            return False, current_tier, old_tier
        
        current_rank = MembershipTierService.TIER_RANK.get(current_tier, 0)
        eligible_rank = MembershipTierService.TIER_RANK.get(eligible_tier, 0)

        # اگر tier جدید همون tier فعلی یا پایین‌تر باشه، ارتقایی نداریم
        # (هیچوقت auto-downgrade نکن)
        if eligible_rank <= current_rank:
            return False, current_tier, old_tier
        
        # اگر auto_upgrade غیرفعال باشه و force نباشه، ارتقا نمی‌دیم
        if not eligible_config.auto_upgrade and not force:
            logger.info(f"Auto-upgrade disabled for tier {eligible_tier}")
            return False, current_tier, old_tier
        
        # ارتقا tier
        with transaction.atomic():
            user.membership_level = eligible_tier
            user.save(update_fields=['membership_level', 'updated_at'])
            
            # ثبت لاگ ارتقا
            upgrade_log = MembershipUpgradeLog.objects.create(
                user=user,
                old_tier=old_tier,
                new_tier=eligible_tier,
                reason='\n'.join(upgrade_reason_parts),
                total_bookings_at_upgrade=activity.total_bookings,
                membership_days_at_upgrade=activity.calculate_membership_duration_days(),
                is_automatic=not force
            )
            
            logger.info(
                f"User {user.email} upgraded from {old_tier} to {eligible_tier}"
            )
        
        return True, eligible_tier, old_tier
    
    @staticmethod
    def _check_tier_eligibility(user, activity, config):
        """
        بررسی اینکه آیا کاربر شرایط یک tier رو داره یا نه
        
        Returns:
            bool: True اگر کاربر واجد شرایط باشه
        """
        # لیست معیارهای فعال (غیر صفر)
        criteria = []
        
        # 1. تعداد کل رزرو
        if config.min_bookings_total > 0:
            if activity.total_bookings < config.min_bookings_total:
                return False
            criteria.append('total_bookings')
        
        # 2. رزرو ماهانه
        if config.min_bookings_per_month > 0:
            if activity.bookings_last_30_days < config.min_bookings_per_month:
                return False
            criteria.append('monthly_bookings')
        
        # 3. رزرو هفتگی
        if config.min_bookings_per_week > 0:
            if activity.bookings_last_7_days < config.min_bookings_per_week:
                return False
            criteria.append('weekly_bookings')
        
        # 4. مدت عضویت
        if config.min_membership_days > 0:
            membership_days = activity.calculate_membership_duration_days()
            if membership_days < config.min_membership_days:
                return False
            criteria.append('membership_duration')
        
        # 5. ماه‌های فعال
        if config.min_active_months > 0:
            if activity.active_months_count < config.min_active_months:
                return False
            criteria.append('active_months')
        
        # 6. پروازهای انجام شده
        if config.min_completed_flights > 0:
            if activity.total_completed_flights < config.min_completed_flights:
                return False
            criteria.append('completed_flights')
        
        # اگر هیچ معیاری فعال نباشه، واجد شرایط نیست
        if not criteria:
            return False
        
        # بررسی اولویت‌ها
        # اگر معیار اولویت 1 فعال نباشه، واجد شرایط نیست
        priority_1 = config.criteria_priority_1
        if priority_1 and priority_1 not in criteria:
            return False
        
        return True
    
    @staticmethod
    def _get_eligibility_reasons(user, activity, config):
        """
        گرفتن دلیل واجد شرایط بودن کاربر
        
        Returns:
            list: لیست دلایل
        """
        reasons = []
        
        if config.min_bookings_total > 0 and activity.total_bookings >= config.min_bookings_total:
            reasons.append(
                f"✅ تعداد کل رزرو: {activity.total_bookings} (حداقل: {config.min_bookings_total})"
            )
        
        if config.min_bookings_per_month > 0 and activity.bookings_last_30_days >= config.min_bookings_per_month:
            reasons.append(
                f"✅ رزرو در ماه: {activity.bookings_last_30_days} (حداقل: {config.min_bookings_per_month})"
            )
        
        if config.min_bookings_per_week > 0 and activity.bookings_last_7_days >= config.min_bookings_per_week:
            reasons.append(
                f"✅ رزرو در هفته: {activity.bookings_last_7_days} (حداقل: {config.min_bookings_per_week})"
            )
        
        membership_days = activity.calculate_membership_duration_days()
        if config.min_membership_days > 0 and membership_days >= config.min_membership_days:
            reasons.append(
                f"✅ روزهای عضویت: {membership_days} (حداقل: {config.min_membership_days})"
            )
        
        if config.min_active_months > 0 and activity.active_months_count >= config.min_active_months:
            reasons.append(
                f"✅ ماه‌های فعال: {activity.active_months_count} (حداقل: {config.min_active_months})"
            )
        
        if config.min_completed_flights > 0 and activity.total_completed_flights >= config.min_completed_flights:
            reasons.append(
                f"✅ پروازهای انجام شده: {activity.total_completed_flights} (حداقل: {config.min_completed_flights})"
            )
        
        return reasons
    
    @staticmethod
    def batch_update_all_users():
        """
        بروزرسانی tier تمام کاربران
        این متد رو می‌شه توی یک task یا cronjob اجرا کرد
        
        Returns:
            dict: آمار ارتقاها
        """
        from accounts.models import User
        
        stats = {
            'total_users': 0,
            'upgraded_users': 0,
            'errors': 0,
            'upgrades_by_tier': {}
        }
        
        users = User.objects.filter(is_active=True)
        stats['total_users'] = users.count()
        
        for user in users:
            try:
                upgraded, new_tier, old_tier = MembershipTierService.check_and_upgrade_user_tier(user)
                if upgraded:
                    stats['upgraded_users'] += 1
                    if new_tier not in stats['upgrades_by_tier']:
                        stats['upgrades_by_tier'][new_tier] = 0
                    stats['upgrades_by_tier'][new_tier] += 1
            except Exception as e:
                logger.error(f"Error upgrading user {user.email}: {str(e)}")
                stats['errors'] += 1
        
        return stats
