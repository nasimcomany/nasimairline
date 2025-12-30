# -*- coding: utf-8 -*-
"""
Check .env settings
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("Checking .env settings for Nira API")
print("=" * 60)

nira_base_url = os.environ.get('NIRA_BASE_URL', '')
nira_office_user = os.environ.get('NIRA_OFFICE_USER', '')
nira_office_pass = os.environ.get('NIRA_OFFICE_PASS', '')

print(f"NIRA_BASE_URL: {nira_base_url}")
print(f"NIRA_OFFICE_USER: {nira_office_user}")
print(f"NIRA_OFFICE_PASS: {'*' * len(nira_office_pass) if nira_office_pass else '(empty)'}")

if not nira_base_url:
    print("\n[ERROR] NIRA_BASE_URL is not set!")
if not nira_office_user:
    print("[ERROR] NIRA_OFFICE_USER is not set!")
if not nira_office_pass:
    print("[ERROR] NIRA_OFFICE_PASS is not set!")

if nira_base_url and nira_office_user:
    api_url = f"{nira_base_url}/api/Res/FlightAvailability"
    print(f"\nAPI URL would be: {api_url}")
    print(f"OfficeUser: {nira_office_user}")

