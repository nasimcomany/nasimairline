# -*- coding: utf-8 -*-
"""
Simple script to test different Nira system URLs
"""
import requests
from requests.exceptions import ConnectionError, Timeout

# List of possible URLs to test
test_urls = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:9000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    # If you know the server address, add it here:
    # "https://nira.nasimair.com",
    # "http://192.168.1.100:8080",
]

print("Searching for Nira system...\n")

found = False
for base_url in test_urls:
    # Test IBE path
    ibe_url = f"{base_url}/ibe/Availability"
    ws_url = f"{base_url}/ws1/NRSCWS.jsp"
    
    print(f"Testing: {base_url}")
    
    try:
        # Test IBE
        response = requests.get(ibe_url, params={"origin": "THR"}, timeout=2)
        if response.status_code != 404 and "html" not in response.headers.get('content-type', '').lower():
            print(f"[OK] Found! IBE URL: {ibe_url}")
            found = True
            break
    except (ConnectionError, Timeout):
        pass
    
    try:
        # Test Web Service
        response = requests.get(ws_url, params={"ModuleType": "SP", "ModuleName": "RoutesApp"}, timeout=2)
        if response.status_code != 404:
            print(f"[OK] Found! Web Service URL: {ws_url}")
            found = True
            break
    except (ConnectionError, Timeout):
        pass
    
    print(f"   [X] Not found\n")

if not found:
    print("\n[!] Nira system not found!")
    print("\nSolutions:")
    print("1. Ask the web service manager where Nira system is installed")
    print("2. If you installed it yourself, you should know the address")
    print("3. If not installed yet, you need to install it first")
else:
    print(f"\n[OK] Found address: {base_url}")
    print(f"\nPut this in .env file:")
    print(f"NIRA_BASE_URL={base_url}")
