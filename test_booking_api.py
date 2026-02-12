"""
Test booking API endpoint
"""
import os
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nasim.settings')
django.setup()

# Test data
test_data = {
    "flight_data": {
        "flightNumber": "IR6650",
        "origin": "THR",
        "destination": "MHD"
    },
    "passengers": [
        {
            "type": "adult",
            "gender": "male",
            "isForeign": False,
            "firstName": "Test",
            "lastName": "User",
            "nationalId": "0440702003",
            "birthDate": "1990-01-01"
        }
    ],
    "contact_info": {
        "phone": "09123456789",
        "email": "test@test.com"
    },
    "total_amount": 1000000,
    "cabin_class": "ECONOMY",
    "payment_ref_id": "TEST123"
}

print("=" * 80)
print("Testing booking API...")
print("=" * 80)

try:
    # Test API endpoint
    url = "http://localhost:8000/api/bookings/bookings/create_after_payment/"
    
    print(f"\nSending POST to: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    response = requests.post(url, json=test_data)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("\n✅ SUCCESS! Booking created!")
        
        # Check in database
        from bookings.models import Booking
        bookings = Booking.objects.all()
        print(f"\nTotal bookings in DB: {bookings.count()}")
        
        if bookings.exists():
            last_booking = bookings.last()
            print(f"Last booking: {last_booking.booking_reference}")
            print(f"Status: {last_booking.status}")
            print(f"User: {last_booking.user}")
    else:
        print("\n❌ FAILED!")
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")

print("\n" + "=" * 80)
