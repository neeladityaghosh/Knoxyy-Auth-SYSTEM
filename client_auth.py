"""
Client-side Authentication & Live Heartbeat Worker
Can be imported into any application to handle:
- Initial key activation & HWID binding
- Background heartbeat pings (every 30s)
- Automatic shutdown if kicked or banned remotely
"""

import urllib.request
import urllib.parse
import json
import hashlib
import subprocess
import platform
import threading
import time
import os

SERVER_URL = "http://127.0.0.1:8080"
CACHE_FILE = ".session.dat"

def get_hwid() -> str:
    raw_id = ""
    try:
        if platform.system() == "Windows":
            out = subprocess.check_output("wmic csproduct get uuid", shell=True, stderr=subprocess.DEVNULL).decode()
            lines = [l.strip() for l in out.splitlines() if l.strip()]
            if len(lines) >= 2:
                raw_id = lines[1]
    except Exception:
        pass

    if not raw_id:
        raw_id = f"{platform.node()}-{platform.machine()}-{platform.processor()}"

    return hashlib.sha256(raw_id.encode("utf-8")).hexdigest()

def activate_license(license_key: str, server_url: str = SERVER_URL):
    endpoint = f"{server_url}/api/v1/activate"
    payload = json.dumps({
        "license_key": license_key.strip(),
        "hwid": get_hwid()
    }).encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "KNOXYY-Client/1.0"}
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("success"):
                save_session(license_key, data)
                return True, data
            return False, data.get("message", "Activation failed")
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode("utf-8"))
            return False, err.get("message", f"HTTP Error {e.code}")
        except Exception:
            return False, f"Server returned error {e.code}"
    except Exception as e:
        return False, f"Unable to reach licensing server: {e}"

def save_session(key: str, data: dict):
    cache = {
        "key": key,
        "hwid": get_hwid(),
        "username": data.get("username"),
        "expires_at": data.get("expires_at")
    }
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f)

def get_cached_session():
    if not os.path.isfile(CACHE_FILE):
        return None
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if data.get("hwid") == get_hwid():
            return data
    except Exception:
        pass
    return None

class HeartbeatManager:
    """Runs a background thread to maintain session and listen for remote kicks/bans."""
    def __init__(self, key: str, on_kicked_callback=None, interval: int = 30, server_url: str = SERVER_URL):
        self.key = key
        self.hwid = get_hwid()
        self.interval = interval
        self.server_url = server_url
        self.on_kicked = on_kicked_callback or self._default_kick_handler
        self._running = False
        self._thread = None

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False

    def _default_kick_handler(self, reason: str):
        print(f"\n[!] SESSION TERMINATED BY SERVER: {reason}")
        os._exit(1)

    def _loop(self):
        endpoint = f"{self.server_url}/api/v1/heartbeat"
        while self._running:
            time.sleep(self.interval)
            try:
                payload = json.dumps({"license_key": self.key, "hwid": self.hwid}).encode("utf-8")
                req = urllib.request.Request(endpoint, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    if not data.get("success") or data.get("action") in ("kick", "terminate"):
                        self.on_kicked(data.get("message", "Session terminated"))
                        break
            except urllib.error.HTTPError as e:
                # 403 means revoked or banned
                self.on_kicked("License revoked or banned by administrator")
                break
            except Exception:
                # Temporary connection drop, keep retrying
                pass

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python client_auth.py <LICENSE_KEY>")
        sys.exit(0)

    key = sys.argv[1]
    print(f"[*] Activating key: {key}")
    ok, res = activate_license(key)
    if ok:
        print(f"[+] Activation successful! Logged in as: {res.get('username')}")
        print("[*] Starting background heartbeat worker. Press Ctrl+C to exit.")
        hb = HeartbeatManager(key)
        hb.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[*] Exiting.")
    else:
        print(f"[-] Activation failed: {res}")
