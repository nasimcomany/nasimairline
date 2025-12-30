# -*- coding: utf-8 -*-
"""
Test Nira API with proper browser headers
"""
import requests

base_url = "https://apps.nasimairlines.ir"
ibe_url = f"{base_url}/ibe/Availability"

print(f"Testing with browser-like headers...")
print("=" * 60)

# Parameters
params = {
    "origin": "THR",
    "destination": "MHD",
    "departureDate": "1403-10-25",
    "roundTrip": "false",
    "adultQty": "1",
    "childQty": "0",
    "infantQty": "0"
}

# Headers to mimic a browser
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,fa;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

try:
    print(f"\nSending GET request with params: {params}")
    response = requests.get(ibe_url, params=params, headers=headers, timeout=15, allow_redirects=True)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Final URL: {response.url}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"Response Length: {len(response.text)} characters")
    
    # Check if redirected
    if response.history:
        print(f"\nRedirected {len(response.history)} times:")
        for i, resp in enumerate(response.history):
            print(f"  {i+1}. {resp.status_code} -> {resp.url}")
    
    # Show first 1000 characters
    print(f"\nFirst 1000 characters of response:")
    print("-" * 60)
    print(response.text[:1000])
    print("-" * 60)
    
    # Check for JSON in response
    if "application/json" in response.headers.get('Content-Type', '').lower():
        print("\n[OK] Response is JSON!")
        try:
            import json
            data = response.json()
            print(f"JSON Data: {json.dumps(data, indent=2)[:500]}")
        except:
            pass
    elif "<html" in response.text.lower() or "<!doctype html" in response.text.lower():
        print("\n[!] Response is HTML - This is a web page, not an API")
        print("\nPossible solutions:")
        print("1. This might be a Single Page Application (SPA) that needs JavaScript")
        print("2. The data might be loaded via AJAX after page load")
        print("3. You might need to use browser automation (Selenium/Playwright)")
        print("4. There might be a different API endpoint for JSON data")
    else:
        print("\n[?] Unknown response type")
        
except Exception as e:
    print(f"\n[ERROR] {type(e).__name__}: {e}")

