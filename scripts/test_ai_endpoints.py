#!/usr/bin/env python3
import os
import json
import urllib.request
import urllib.error

BASE = os.environ.get('VITE_API_BASE_URL', 'http://localhost:8000').rstrip('/')

TESTS = [
    ('GET', '/health', None),
    ('POST', '/predict', {"from_city": "Kigali", "to_city": "Musanze", "distance_km": 90, "transport_type": "bus", "demand": "medium"}),
    ('POST', '/chat', {"message": "Hello, what is the fare from Kigali to Musanze?", "history": []}),
    ('POST', '/recommend-trip', {"from_city": "Kigali", "to_city": "Musanze", "distance_km": 90, "transport_type": "bus", "demand": "medium", "budget_usd": 300, "duration_days": 3, "travelers": 2, "interests": ["Wildlife & Safaris", "Culture & History"]}),
    ('POST', '/detect', {"text": "Muraho neza"}),
    ('POST', '/translate', {"text": "Muraho", "source_lang": "auto", "target_lang": "en"}),
]


def call(method, path, payload):
    url = BASE + path
    headers = {}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode('utf-8')
        headers['Content-Type'] = 'application/json'

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.getcode()
            body = resp.read().decode('utf-8')
            try:
                js = json.loads(body)
                body_pretty = json.dumps(js, indent=2, ensure_ascii=False)
            except Exception:
                body_pretty = body
            print(f"--- {method} {path} ---")
            print("Status:", status)
            print(body_pretty)
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode('utf-8')
        except Exception:
            body = ''
        print(f"--- {method} {path} ---")
        print("HTTPError:", e.code, getattr(e, 'reason', ''))
        print(body)
    except urllib.error.URLError as e:
        print(f"--- {method} {path} ---")
        print("URLError:", getattr(e, 'reason', e))
    except Exception as e:
        print(f"--- {method} {path} ---")
        print("Error:", str(e))


if __name__ == '__main__':
    print('Using base URL:', BASE)
    for method, path, payload in TESTS:
        call(method, path, payload)
        print('\n')
