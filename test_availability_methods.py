# -*- coding: utf-8 -*-
"""
Test different HTTP methods for Availability API
"""
import requests
import base64
from datetime import datetime

base_url = "https://apps.nasimairlines.ir"

# Create OfficePass with current date/time
office_user = "nasimairline"
now = datetime.now()
office_pass_pattern = f"{office_user}_{now.strftime('%Y-%m-%d %H')}"
office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')

print("=" * 60)
print("Testing different methods for FlightAvailability")
print("=" * 60)
print(f"OfficeUser: {office_user}")
print(f"OfficePass (pattern): {office_pass_pattern}")
print(f"OfficePass (encoded): {office_pass_encoded}")
print("=" * 60)

# Flight parameters
flight_params = {
    'origin': 'THR',
    'destination': 'MHD',
    'departureDate': '1403-10-25',
    'roundTrip': 'false',
    'adultQty': '1',
    'childQty': '0',
    'infantQty': '0'
}

query_params = {
    'OfficeUser': office_user,
    'OfficePass': office_pass_encoded
}

# Test 1: POST with data in body
print("\n[Test 1] POST with data in body:")
try:
    response = requests.post(
        f"{base_url}/ibe/FlightAvailability",
        params=query_params,
        data=flight_params,
        timeout=10
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:300]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 2: POST with JSON body
print("\n[Test 2] POST with JSON body:")
try:
    response = requests.post(
        f"{base_url}/ibe/FlightAvailability",
        params=query_params,
        json=flight_params,
        timeout=10
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:300]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 3: GET with all params in query string
print("\n[Test 3] GET with all params in query string:")
try:
    all_params = {**query_params, **flight_params}
    response = requests.get(
        f"{base_url}/ibe/FlightAvailability",
        params=all_params,
        timeout=10
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:300]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 4: Check what the actual request looks like in browser
# Maybe we need to check the Request Payload in Network tab
print("\n" + "=" * 60)
print("IMPORTANT: Please check in browser Network tab:")
print("1. Click on the POST FlightAvailability request")
print("2. Go to 'Headers' tab")
print("3. Look at 'Request Payload' or 'Form Data' section")
print("4. Tell me what you see there")
print("=" * 60)

