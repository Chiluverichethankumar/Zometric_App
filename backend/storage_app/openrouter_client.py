

import os
import requests
import json
from django.conf import settings

def get_openrouter_client():
    api_key = getattr(settings, "OPENROUTER_API_KEY", None)
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set in .env")
    
    def call_nova(prompt="Hello from Django + Nova 2 Lite!", max_tokens=1000):
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Zometric Django App",
            },
            data=json.dumps({
                "model": "amazon/nova-2-lite-v1:free",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
            })
        )
        if response.status_code != 200:
            raise ValueError(f"OpenRouter error: {response.text}")
        return response.json()
    
    return call_nova
