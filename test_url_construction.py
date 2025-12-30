# -*- coding: utf-8 -*-
"""
Test URL construction
"""
import os
from dotenv import load_dotenv

load_dotenv()

base_url = os.environ.get('NIRA_BASE_URL', '')
api_url = f"{base_url}/api/Res" if base_url else None

print("=" * 60)
print("URL Construction Test")
print("=" * 60)
print(f"base_url from .env: {base_url}")
print(f"api_url constructed: {api_url}")
print(f"Full URL would be: {api_url}/FlightAvailability" if api_url else "api_url is None")

# Test if it's correct
expected = "https://apps.nasimairlines.ir/api/Res/FlightAvailability"
actual = f"{api_url}/FlightAvailability" if api_url else None

print(f"\nExpected: {expected}")
print(f"Actual: {actual}")
print(f"Match: {expected == actual}")

