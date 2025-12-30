# -*- coding: utf-8 -*-
"""
Test to understand OfficeUser and OfficePass format
"""
import requests
import base64
from datetime import datetime

base_url = "https://apps.nasimairlines.ir"
ibe_url = f"{base_url}/ibe/FlightAvailability"

print("=" * 60)
print("Testing different OfficeUser and OfficePass combinations")
print("=" * 60)

# Test 1: What we saw in the network tab
print("\n[Test 1] Using credentials from network tab:")
office_user_1 = "Shell71"
office_pass_1 = "U2hlbGw3MV8yMDI1LTEyLTMwIDE1"  # Base64 encoded

# Try to decode
try:
    decoded = base64.b64decode(office_pass_1).decode('utf-8')
    print(f"  OfficeUser: {office_user_1}")
    print(f"  OfficePass (encoded): {office_pass_1}")
    print(f"  OfficePass (decoded): {decoded}")
except:
    print(f"  OfficePass is not Base64: {office_pass_1}")

# Test 2: What's in .env file
print("\n[Test 2] Using credentials from .env file:")
office_user_2 = "nasimairline"
office_pass_2 = "onlynasimpf1"
print(f"  OfficeUser: {office_user_2}")
print(f"  OfficePass: {office_pass_2}")

# Test 3: Try to create OfficePass with date/time pattern
print("\n[Test 3] Trying to create OfficePass with date/time:")
now = datetime.now()
office_pass_3_pattern = f"{office_user_2}_{now.strftime('%Y-%m-%d %H')}"
print(f"  Pattern: {office_pass_3_pattern}")

# Encode it
office_pass_3_encoded = base64.b64encode(office_pass_3_pattern.encode('utf-8')).decode('utf-8')
print(f"  Encoded: {office_pass_3_encoded}")

# Now test actual API calls
print("\n" + "=" * 60)
print("Testing API calls with different credentials")
print("=" * 60)

# Flight search parameters
flight_data = {
    'origin': 'THR',
    'destination': 'MHD',
    'departureDate': '1403-10-25',
    'roundTrip': 'false',
    'adultQty': '1',
    'childQty': '0',
    'infantQty': '0'
}

# Test with credentials from network tab
print("\n[API Test 1] Using Shell71 credentials:")
try:
    response = requests.post(
        ibe_url,
        params={
            'OfficeUser': office_user_1,
            'OfficePass': office_pass_1
        },
        data=flight_data,
        timeout=10
    )
    print(f"  Status: {response.status_code}")
    print(f"  Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"  Response (first 500 chars): {response.text[:500]}")
    if response.status_code == 200:
        try:
            import json
            data = response.json()
            print(f"  JSON Response: {json.dumps(data, indent=2)[:500]}")
        except:
            pass
except Exception as e:
    print(f"  Error: {e}")

# Test with .env credentials
print("\n[API Test 2] Using nasimairline credentials (plain):")
try:
    response = requests.post(
        ibe_url,
        params={
            'OfficeUser': office_user_2,
            'OfficePass': office_pass_2
        },
        data=flight_data,
        timeout=10
    )
    print(f"  Status: {response.status_code}")
    print(f"  Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"  Response (first 500 chars): {response.text[:500]}")
    if response.status_code == 200:
        try:
            import json
            data = response.json()
            print(f"  JSON Response: {json.dumps(data, indent=2)[:500]}")
        except:
            pass
except Exception as e:
    print(f"  Error: {e}")

# Test with encoded password
print("\n[API Test 3] Using nasimairline credentials (encoded with date):")
try:
    response = requests.post(
        ibe_url,
        params={
            'OfficeUser': office_user_2,
            'OfficePass': office_pass_3_encoded
        },
        data=flight_data,
        timeout=10
    )
    print(f"  Status: {response.status_code}")
    print(f"  Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"  Response (first 500 chars): {response.text[:500]}")
    if response.status_code == 200:
        try:
            import json
            data = response.json()
            print(f"  JSON Response: {json.dumps(data, indent=2)[:500]}")
        except:
            pass
except Exception as e:
    print(f"  Error: {e}")

