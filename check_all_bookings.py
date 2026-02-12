"""
Check all bookings
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nasim.settings')
django.setup()

from bookings.models import Booking
from payments.models import Payment

print("=" * 80)
print("Bookings:")
print("=" * 80)

all_bookings = Booking.objects.all().order_by('-created_at')[:20]
print(f"Total count: {Booking.objects.count()}")

if all_bookings.exists():
    for booking in all_bookings:
        user_email = booking.user.email if booking.user else "No user"
        print(f"\n- Ref: {booking.booking_reference}")
        print(f"  User: {user_email}")
        print(f"  Status: {booking.status}")
        print(f"  Date: {booking.created_at}")
else:
    print("No bookings found!")

print("\n" + "=" * 80)
print("Payments:")
print("=" * 80)

all_payments = Payment.objects.all().order_by('-created_at')[:20]
print(f"Total count: {Payment.objects.count()}")

if all_payments.exists():
    for payment in all_payments:
        user_email = payment.user.email if payment.user else "No user"
        print(f"\n- Transaction: {payment.transaction_id}")
        print(f"  User: {user_email}")
        print(f"  Status: {payment.status}")
        print(f"  Amount: {payment.amount}")
        print(f"  Date: {payment.created_at}")
else:
    print("No payments found!")

print("\n" + "=" * 80)
