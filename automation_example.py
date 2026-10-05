"""
Automation Integration Example
Shows how to automatically generate and deliver license keys from:
- A Discord / Telegram bot
- A payment webhook (e.g., Sellix, Shoppy, Stripe)
"""

import urllib.request
import json

SERVER_URL = "http://127.0.0.1:8080"

def create_license_automated(username: str, duration_days: int = 30) -> dict:
    """
    Call this function whenever a user purchases or requests a key.
    """
    endpoint = f"{SERVER_URL}/api/v1/admin/create_key"
    payload = json.dumps({
        "username": username,
        "days": duration_days
    }).encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    print("[*] Simulating automatic key creation for a new customer...")
    result = create_license_automated(username="Customer_JohnDoe", duration_days=30)
    if result.get("success"):
        print(f"[+] Key Generated: {result['key']}")
        print(f"[+] Assigned To:   {result['username']}")
        print(f"[+] Valid Until:   {result['expires_at']}")
        print("\n-> This key can now be automatically sent to the buyer via DM or email.")
    else:
        print(f"[-] Error: {result.get('error')}")
