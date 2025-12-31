# -*- coding: utf-8 -*-
import requests
import base64
import json
from datetime import datetime

office_user = "Shell78"
now = datetime.now()
pattern = f"{office_user}_{now.strftime('%Y-%m-%d %H:%M:%S')}"
encoded = base64.b64encode(pattern.encode()).decode()

params = {
    'ModuleType': 'SP',
    'ModuleName': 'RoutesApp',
    'Origin': '',
    'OfficeUser': office_user,
    'OfficePass': encoded,
}

r = requests.get('https://apps.nasimairlines.ir/ws1/NRSCWS.jsp', params=params, timeout=60)
print(f"Status: {r.status_code}")
print(f"Response length: {len(r.text)}")

try:
    data = r.json()
    if isinstance(data, dict) and 'NRSRoutesApp' in data:
        print(f"SUCCESS: Got {len(data['NRSRoutesApp'])} cities")
        print(json.dumps(data, ensure_ascii=False, indent=2)[:300])
    elif isinstance(data, str):
        print(f"Response: {data}")
    else:
        print(f"Response: {json.dumps(data, ensure_ascii=False)[:200]}")
except:
    print(f"Response text: {r.text[:200]}")

