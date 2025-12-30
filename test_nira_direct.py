# -*- coding: utf-8 -*-
"""
Test direct connection to Nira system
"""
import requests

# Test URL
base_url = "https://apps.nasimairlines.ir"
ibe_url = f"{base_url}/ibe/Availability"

print(f"Testing direct connection to: {ibe_url}")
print("=" * 60)

# Test with parameters
params = {
    "origin": "THR",
    "destination": "MHD",
    "departureDate": "1403-10-25",
    "roundTrip": "false",
    "adultQty": "1",
    "childQty": "0",
    "infantQty": "0"
}

try:
    print(f"\nSending request with params: {params}")
    response = requests.get(ibe_url, params=params, timeout=10)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"Response Length: {len(response.text)} characters")
    
    # Show first 500 characters
    print(f"\nFirst 500 characters of response:")
    print("-" * 60)
    print(response.text[:500])
    print("-" * 60)
    
    # Check if it's HTML
    if "html" in response.headers.get('Content-Type', '').lower() or "<html" in response.text.lower():
        print("\n[!] Response is HTML - might be a login page or redirect")
    else:
        print("\n[OK] Response is not HTML")
        
except requests.exceptions.SSLError as e:
    print(f"\n[ERROR] SSL Error: {e}")
    print("Try with verify=False (not recommended for production)")
except requests.exceptions.ConnectionError as e:
    print(f"\n[ERROR] Connection Error: {e}")
except Exception as e:
    print(f"\n[ERROR] {type(e).__name__}: {e}")

