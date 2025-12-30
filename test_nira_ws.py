# -*- coding: utf-8 -*-
"""
Test Nira Web Service (Routes API)
"""
import requests

base_url = "https://apps.nasimairlines.ir"
ws_url = f"{base_url}/ws1/NRSCWS.jsp"

print(f"Testing Web Service: {ws_url}")
print("=" * 60)

# Test 1: Get origin cities (origin parameter empty)
params1 = {
    "ModuleType": "SP",
    "ModuleName": "RoutesApp",
    "origin": "",
    "OfficeUser": "nasimairline",
    "OfficePass": "onlynasimpf1"
}

print("\n[Test 1] Getting origin cities (origin='')...")
print(f"Params: {params1}")

try:
    response = requests.get(ws_url, params=params1, timeout=10)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"Response Length: {len(response.text)} characters")
    
    # Show first 1000 characters
    print(f"\nFirst 1000 characters of response:")
    print("-" * 60)
    print(response.text[:1000])
    print("-" * 60)
    
    # Check if it's JSON or XML
    if response.headers.get('Content-Type', '').lower().startswith('application/json'):
        print("\n[OK] Response is JSON")
        try:
            import json
            data = response.json()
            print(f"JSON Data: {json.dumps(data, indent=2)[:500]}")
        except:
            pass
    elif 'xml' in response.headers.get('Content-Type', '').lower() or response.text.strip().startswith('<?xml'):
        print("\n[OK] Response is XML")
    elif "<html" in response.text.lower():
        print("\n[!] Response is HTML")
    else:
        print("\n[?] Response type unknown")
        
except requests.exceptions.SSLError as e:
    print(f"\n[ERROR] SSL Error: {e}")
except requests.exceptions.ConnectionError as e:
    print(f"\n[ERROR] Connection Error: {e}")
except Exception as e:
    print(f"\n[ERROR] {type(e).__name__}: {e}")

# Test 2: Get destinations from THR
print("\n\n" + "=" * 60)
print("[Test 2] Getting destinations from THR...")

params2 = {
    "ModuleType": "SP",
    "ModuleName": "RoutesApp",
    "origin": "THR",
    "OfficeUser": "nasimairline",
    "OfficePass": "onlynasimpf1"
}

print(f"Params: {params2}")

try:
    response = requests.get(ws_url, params=params2, timeout=10)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
    print(f"Response Length: {len(response.text)} characters")
    
    # Show first 1000 characters
    print(f"\nFirst 1000 characters of response:")
    print("-" * 60)
    print(response.text[:1000])
    print("-" * 60)
    
    # Check if it's JSON or XML
    if response.headers.get('Content-Type', '').lower().startswith('application/json'):
        print("\n[OK] Response is JSON")
    elif 'xml' in response.headers.get('Content-Type', '').lower() or response.text.strip().startswith('<?xml'):
        print("\n[OK] Response is XML")
    elif "<html" in response.text.lower():
        print("\n[!] Response is HTML")
    else:
        print("\n[?] Response type unknown")
        
except Exception as e:
    print(f"\n[ERROR] {type(e).__name__}: {e}")

