"""
Data migration to create default tier configurations
"""
from django.db import migrations


def create_default_tiers(apps, schema_editor):
    """
    ایجاد تنظیمات پیش‌فرض برای tier های مختلف
    """
    MembershipTierConfig = apps.get_model('accounts', 'MembershipTierConfig')
    
    # Bronze (پیش‌فرض برای همه کاربران جدید)
    MembershipTierConfig.objects.get_or_create(
        tier='BRONZE',
        defaults={
            'name_fa': 'برنزی',
            'name_en': 'Bronze',
            'min_bookings_total': 0,
            'min_bookings_per_month': 0,
            'min_bookings_per_week': 0,
            'min_membership_days': 0,
            'min_active_months': 0,
            'min_completed_flights': 0,
            'criteria_priority_1': 'total_bookings',
            'is_active': True,
            'auto_upgrade': True
        }
    )
    
    # Silver (حداقل 5 رزرو یا 30 روز عضویت با 2 رزرو در ماه)
    MembershipTierConfig.objects.get_or_create(
        tier='SILVER',
        defaults={
            'name_fa': 'نقره‌ای',
            'name_en': 'Silver',
            'min_bookings_total': 5,
            'min_bookings_per_month': 2,
            'min_bookings_per_week': 0,
            'min_membership_days': 30,
            'min_active_months': 2,
            'min_completed_flights': 3,
            'criteria_priority_1': 'total_bookings',
            'criteria_priority_2': 'monthly_bookings',
            'is_active': True,
            'auto_upgrade': True
        }
    )
    
    # Gold (حداقل 15 رزرو یا 90 روز عضویت با 3 رزرو در ماه)
    MembershipTierConfig.objects.get_or_create(
        tier='GOLD',
        defaults={
            'name_fa': 'طلایی',
            'name_en': 'Gold',
            'min_bookings_total': 15,
            'min_bookings_per_month': 3,
            'min_bookings_per_week': 0,
            'min_membership_days': 90,
            'min_active_months': 4,
            'min_completed_flights': 10,
            'criteria_priority_1': 'total_bookings',
            'criteria_priority_2': 'monthly_bookings',
            'criteria_priority_3': 'active_months',
            'is_active': True,
            'auto_upgrade': True
        }
    )
    
    # Platinum (حداقل 30 رزرو یا 180 روز عضویت با 5 رزرو در ماه)
    MembershipTierConfig.objects.get_or_create(
        tier='PLATINUM',
        defaults={
            'name_fa': 'پلاتینیوم',
            'name_en': 'Platinum',
            'min_bookings_total': 30,
            'min_bookings_per_month': 5,
            'min_bookings_per_week': 1,
            'min_membership_days': 180,
            'min_active_months': 6,
            'min_completed_flights': 25,
            'criteria_priority_1': 'total_bookings',
            'criteria_priority_2': 'monthly_bookings',
            'criteria_priority_3': 'active_months',
            'is_active': True,
            'auto_upgrade': True
        }
    )


def reverse_create_default_tiers(apps, schema_editor):
    """
    حذف تنظیمات پیش‌فرض tier ها
    """
    MembershipTierConfig = apps.get_model('accounts', 'MembershipTierConfig')
    MembershipTierConfig.objects.filter(
        tier__in=['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_membershiptierconfig_usermembershipactivity_and_more'),
    ]

    operations = [
        migrations.RunPython(create_default_tiers, reverse_create_default_tiers),
    ]
