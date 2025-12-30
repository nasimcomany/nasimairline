# -*- coding: utf-8 -*-
"""
Test direct API call to see what's happening
"""
import requests
import base64
from datetime import datetime
from persiantools.jdatetime import JalaliDate

base_url = "https://apps.nasimairlines.ir"
api_url = f"{base_url}/api/Res/FlightAvailability"

# Office credentials
office_user = "nasimairline"
now = datetime.now()
office_pass_pattern = f"{office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')

print("=" * 60)
print("Testing direct API call")
print("=" * 60)
print(f"API URL: {api_url}")
print(f"OfficeUser: {office_user}")
print(f"OfficePass (pattern): {office_pass_pattern}")
print(f"OfficePass (encoded): {office_pass_encoded}")
print("=" * 60)

# Convert date to Jalali
departure_date = datetime(2024, 1, 15)
jalali = JalaliDate.to_jalali(departure_date.year, departure_date.month, departure_date.day)
departure_date_jalali = f"{jalali.year}-{jalali.month:02d}-{jalali.day:02d}"

print(f"Departure Date (Gregorian): {departure_date.date()}")
print(f"Departure Date (Jalali): {departure_date_jalali}")

# Query parameters
query_params = {
    'OfficeUser': office_user,
    'OfficePass': office_pass_encoded,
}

# JSON body
json_data = {
    'Origin': 'THR',
    'Destination': 'MHD',
    'Date': departure_date_jalali,
    'AdultNo': 1,
    'ChildNo': 0,
    'InfantNo': 0,
    'isForeign': None,
    'roundTrip': False,
}

print(f"\nQuery Params: {query_params}")
print(f"JSON Body: {json_data}")

# Make request
print("\n" + "=" * 60)
print("Making POST request...")
print("=" * 60)

try:
    response = requests.post(
        api_url,
        params=query_params,
        json=json_data,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*'
        },
        timeout=15
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"\nResponse Text (first 1000 chars):")
    print("-" * 60)
    print(response.text[:1000])
    print("-" * 60)
    
    if response.status_code == 200:
        try:
            import json
            data = response.json()
            print(f"\nJSON Response:")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
        except:
            print("\nResponse is not JSON")
    elif response.status_code == 404:
        print("\n[ERROR] 404 Not Found - URL might be wrong")
        print("Let's check the actual URL being called:")
        print(f"Full URL: {response.url}")
        
except requests.exceptions.SSLError as e:
    print(f"\n[ERROR] SSL Error: {e}")
except requests.exceptions.ConnectionError as e:
    print(f"\n[ERROR] Connection Error: {e}")
except Exception as e:
    print(f"\n[ERROR] {type(e).__name__}: {e}")

