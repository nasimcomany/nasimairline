"""
اسکریپت تست و دیباگ سیستم باشگاه مشتریان
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nasim.settings')
django.setup()

from accounts.models import User
from bookings.models import Booking
from payments.models import Payment
from accounts.membership_models import UserMembershipActivity
from accounts.membership_service import MembershipTierService

print("=" * 80)
print("🔍 دیباگ سیستم باشگاه مشتریان")
print("=" * 80)

# لیست کاربران
print("\n📋 لیست کاربران:")
users = User.objects.all().order_by('-date_joined')[:5]
for i, user in enumerate(users, 1):
    print(f"{i}. {user.email} - Tier: {user.membership_level} - تاریخ عضویت: {user.date_joined}")

# انتخاب کاربر
print("\nیک کاربر را انتخاب کنید (email را وارد کنید):")
user_email = input("Email: ").strip()

try:
    user = User.objects.get(email=user_email)
except User.DoesNotExist:
    print(f"❌ کاربر با email {user_email} پیدا نشد!")
    exit(1)

print(f"\n✅ کاربر انتخاب شد: {user.email}")
print(f"   Tier فعلی: {user.membership_level}")
print(f"   تاریخ عضویت: {user.date_joined}")

# چک کردن Bookings
print("\n" + "=" * 80)
print("📦 بررسی Bookings:")
print("=" * 80)

all_bookings = Booking.objects.filter(user=user)
print(f"تعداد کل Bookings: {all_bookings.count()}")

if all_bookings.exists():
    print("\nجزئیات Bookings:")
    for booking in all_bookings.order_by('-created_at')[:10]:
        print(f"  - {booking.booking_reference} | Status: {booking.status} | تاریخ: {booking.created_at}")
else:
    print("⚠️ هیچ Booking ای برای این کاربر یافت نشد!")

confirmed_bookings = all_bookings.filter(status__in=['CONFIRMED', 'COMPLETED'])
print(f"\nتعداد Bookings با status CONFIRMED/COMPLETED: {confirmed_bookings.count()}")

# چک کردن Payments
print("\n" + "=" * 80)
print("💳 بررسی Payments:")
print("=" * 80)

payments = Payment.objects.filter(user=user)
print(f"تعداد کل Payments: {payments.count()}")

if payments.exists():
    print("\nجزئیات Payments:")
    for payment in payments.order_by('-created_at')[:10]:
        print(f"  - {payment.transaction_id} | Status: {payment.status} | مبلغ: {payment.amount} | تاریخ: {payment.created_at}")
else:
    print("⚠️ هیچ Payment ای برای این کاربر یافت نشد!")

completed_payments = payments.filter(status='COMPLETED')
print(f"\nتعداد Payments با status COMPLETED: {completed_payments.count()}")

# چک کردن MembershipActivity
print("\n" + "=" * 80)
print("📊 بررسی Membership Activity:")
print("=" * 80)

try:
    activity = UserMembershipActivity.objects.get(user=user)
    print("✅ MembershipActivity برای این کاربر وجود دارد:")
    print(f"   - تعداد کل رزروها: {activity.total_bookings}")
    print(f"   - رزرو در 30 روز اخیر: {activity.bookings_last_30_days}")
    print(f"   - رزرو در 7 روز اخیر: {activity.bookings_last_7_days}")
    print(f"   - ماه‌های فعال: {activity.active_months_count}")
    print(f"   - آخرین بروزرسانی: {activity.last_calculated_at}")
except UserMembershipActivity.DoesNotExist:
    print("❌ MembershipActivity برای این کاربر وجود ندارد!")
    activity = None

# بروزرسانی آمار
print("\n" + "=" * 80)
print("🔄 بروزرسانی آمار:")
print("=" * 80)

if activity:
    print("در حال بروزرسانی آمار...")
    activity.update_statistics()
    activity.refresh_from_db()
    print("✅ آمار بروزرسانی شد!")
    print(f"   - تعداد کل رزروها (بعد از بروزرسانی): {activity.total_bookings}")
else:
    print("ایجاد MembershipActivity جدید...")
    activity = UserMembershipActivity.objects.create(user=user)
    activity.update_statistics()
    activity.refresh_from_db()
    print("✅ MembershipActivity ایجاد و آمار بروزرسانی شد!")
    print(f"   - تعداد کل رزروها: {activity.total_bookings}")

# چک کردن امکان ارتقا
print("\n" + "=" * 80)
print("✨ بررسی امکان ارتقا Tier:")
print("=" * 80)

print(f"Tier فعلی: {user.membership_level}")
upgraded, new_tier, old_tier = MembershipTierService.check_and_upgrade_user_tier(user, force=True)

if upgraded:
    print(f"🎉 ارتقا موفق! {old_tier} → {new_tier}")
else:
    print(f"ℹ️ ارتقایی انجام نشد. Tier فعلی: {user.membership_level}")

# نتیجه نهایی
print("\n" + "=" * 80)
print("📝 خلاصه:")
print("=" * 80)
print(f"کاربر: {user.email}")
print(f"Tier: {user.membership_level}")
print(f"تعداد Bookings (CONFIRMED/COMPLETED): {confirmed_bookings.count()}")
print(f"تعداد Payments (COMPLETED): {completed_payments.count()}")
print(f"آمار رزروها در سیستم عضویت: {activity.total_bookings}")

if confirmed_bookings.count() != activity.total_bookings:
    print("\n⚠️ توجه: تعداد Bookings با آمار سیستم عضویت مطابقت ندارد!")
    print("   احتمالاً Signal اجرا نشده است.")
    print("   برای تست، یک Booking جدید بسازید یا status یک Booking موجود را تغییر دهید.")

print("\n" + "=" * 80)
