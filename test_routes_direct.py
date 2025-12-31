# -*- coding: utf-8 -*-
"""
Direct test of Routes API
"""
import requests
import base64
from datetime import datetime

base_url = "https://apps.nasimairlines.ir"
ws_url = f"{base_url}/ws1/NRSCWS.jsp"

office_user = "Shell78"

# Create OfficePass exactly like in code
now = datetime.now()
office_pass_pattern = f"{office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
office_pass_encoded = base64.b64encode(office_pass_pattern.encode('utf-8')).decode('utf-8')

print("=" * 60)
print("Testing Routes API directly")
print("=" * 60)
print(f"OfficeUser: {office_user}")
print(f"OfficePass Pattern: {office_pass_pattern}")
print(f"OfficePass Encoded: {office_pass_encoded}")
print("=" * 60)

# Test with Origin (capital O) - empty
params = {
    'ModuleType': 'SP',
    'ModuleName': 'RoutesApp',
    'Origin': '',  # Empty with capital O
    'OfficeUser': office_user,
    'OfficePass': office_pass_encoded,
}

print(f"\nParams: {params}")
print(f"\nMaking GET request...")

try:
    response = requests.get(ws_url, params=params, timeout=60)
    print(f"Status: {response.status_code}")
    print(f"URL: {response.url}")
    print(f"\nResponse length: {len(response.text)}")
    print(f"Response (first 500 bytes):")
    print(response.text[:500].encode('utf-8', errors='ignore').decode('utf-8', errors='ignore'))
    
    if response.status_code == 200:
        try:
            import json
            data = response.json()
            if isinstance(data, dict) and 'NRSRoutesApp' in data:
                print(f"\n[SUCCESS] Got {len(data['NRSRoutesApp'])} cities!")
                print(f"First city: {json.dumps(data['NRSRoutesApp'][0], ensure_ascii=False) if data['NRSRoutesApp'] else 'None'}")
            elif isinstance(data, str) and data == "SIGN":
                print("\n[ERROR] Got SIGN - authentication failed")
                print("This means OfficePass is incorrect or expired")
            else:
                print(f"\n[RESPONSE] {json.dumps(data, ensure_ascii=False, indent=2)[:500]}")
        except ValueError as e:
            print(f"\n[RESPONSE] Not JSON: {str(e)}")
            print(f"Response text: {response.text[:200]}")
except Exception as e:
    print(f"\n[ERROR] {type(e).__name__}: {e}")

