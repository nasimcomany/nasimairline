# -*- coding: utf-8 -*-
"""
Test Routes API with different OfficePass formats
"""
import requests
import base64
from datetime import datetime

base_url = "https://apps.nasimairlines.ir"
ws_url = f"{base_url}/ws1/NRSCWS.jsp"

office_user = "nasimairline"

print("=" * 60)
print("Testing Routes API with different OfficePass formats")
print("=" * 60)

# Test 1: OfficePass with date/time (like we do in code)
now = datetime.now()
office_pass_pattern_1 = f"{office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
office_pass_encoded_1 = base64.b64encode(office_pass_pattern_1.encode('utf-8')).decode('utf-8')

print(f"\n[Test 1] OfficePass with date/time (current method):")
print(f"  Pattern: {office_pass_pattern_1}")
print(f"  Encoded: {office_pass_encoded_1}")

params_1 = {
    'ModuleType': 'SP',
    'ModuleName': 'RoutesApp',
    'origin': '',
    'OfficeUser': office_user,
    'OfficePass': office_pass_encoded_1,
}

try:
    response = requests.get(ws_url, params=params_1, timeout=30)
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 2: OfficePass with just date (no time)
office_pass_pattern_2 = f"{office_user}_{now.strftime('%Y-%m-%d')}"
office_pass_encoded_2 = base64.b64encode(office_pass_pattern_2.encode('utf-8')).decode('utf-8')

print(f"\n[Test 2] OfficePass with just date (no time):")
print(f"  Pattern: {office_pass_pattern_2}")
print(f"  Encoded: {office_pass_encoded_2}")

params_2 = {
    'ModuleType': 'SP',
    'ModuleName': 'RoutesApp',
    'origin': '',
    'OfficeUser': office_user,
    'OfficePass': office_pass_encoded_2,
}

try:
    response = requests.get(ws_url, params=params_2, timeout=30)
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 3: OfficePass with date and hour only (no minutes/seconds)
office_pass_pattern_3 = f"{office_user}_{now.strftime('%Y-%m-%d %H')}"
office_pass_encoded_3 = base64.b64encode(office_pass_pattern_3.encode('utf-8')).decode('utf-8')

print(f"\n[Test 3] OfficePass with date and hour only:")
print(f"  Pattern: {office_pass_pattern_3}")
print(f"  Encoded: {office_pass_encoded_3}")

params_3 = {
    'ModuleType': 'SP',
    'ModuleName': 'RoutesApp',
    'origin': '',
    'OfficeUser': office_user,
    'OfficePass': office_pass_encoded_3,
}

try:
    response = requests.get(ws_url, params=params_3, timeout=30)
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 4: Check what the browser actually sends
print("\n" + "=" * 60)
print("IMPORTANT: Please check in browser Network tab:")
print("1. Open the page with Routes API")
print("2. Click on the NRSCWS.jsp request")
print("3. Go to 'Headers' tab")
print("4. Look at the 'Query String Parameters' section")
print("5. Tell me what OfficePass value you see there")
print("=" * 60)

