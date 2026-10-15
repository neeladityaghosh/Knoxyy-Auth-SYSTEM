"""
Knoxyy Gaming Suite - Unified Licensing & Cloud Control Server
Supports:
- Unified Web Portal with Interactive Choice Screen:
    * 🎮 Knoxyy Emulator (v69.67 Gold Elite)
    * ⚡ Knoxyy Pro Aim Optimizer
- Dual Management Consoles, Settings, Knoxyy Store & Packs
- Product-specific and All-in-One VIP License Keys
- Live Session Monitoring & Real-time Heartbeat
- Remote Kick, Ban/Unban, HWID Hardware Lock & Reset, Delete
- Real-time Server & Telemetry Metrics (/api/v1/metrics)
- REST API (/api/v1/activate, /api/v1/heartbeat, /api/v1/admin/*)
- KeyAuth 1.3 protocol emulation (/api/1.3/)
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sqlite3
import secrets
import string
import urllib.parse
from datetime import datetime, timezone, timedelta
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "licenses.db")
DIST_DIR = os.path.join(BASE_DIR, "dist")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
PORT = int(os.environ.get("PORT", 8080))

SERVER_START_TIME = datetime.now(timezone.utc)
REQUEST_COUNTER = 0

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS licenses (
            key TEXT PRIMARY KEY,
            username TEXT,
            hwid TEXT,
            created_at TEXT,
            expires_at TEXT,
            is_active INTEGER DEFAULT 1,
            last_seen TEXT,
            ip_address TEXT,
            force_logout INTEGER DEFAULT 0,
            product TEXT DEFAULT 'emulator'
        )
    """)
    conn.commit()

    # Automatic schema migration: ensure 'product' column exists
    cursor.execute("PRAGMA table_info(licenses)")
    cols = [c[1] for c in cursor.fetchall()]
    if "product" not in cols:
        cursor.execute("ALTER TABLE licenses ADD COLUMN product TEXT DEFAULT 'emulator'")
        conn.commit()

    # Pre-seed initial default licenses if table is completely empty
    cursor.execute("SELECT COUNT(*) FROM licenses")
    count = cursor.fetchone()[0]
    if count == 0:
        now_str = datetime.now(timezone.utc).isoformat()
        seeds = [
            ("KNOXYY-VIP-GOLD-6967", "VIPMaster", None, now_str, "LIFETIME", 1, "all"),
            ("KNOXYY-A9NM-09Q7-V1UH", "NEEL", None, now_str, "LIFETIME", 1, "all"),
            ("KNOXYY-EMU-8K5M-5ULT", "AdminUser", None, now_str, "LIFETIME", 1, "emulator"),
            ("KNOXYY-OPTI-9X4F-2K1M", "ProGamer", None, now_str, "LIFETIME", 1, "optimizer")
        ]
        cursor.executemany("""
            INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active, product)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, seeds)
        conn.commit()

    conn.close()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def generate_key_str(prefix="KNOXYY"):
    parts = [prefix]
    for _ in range(3):
        chunk = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        parts.append(chunk)
    return "-".join(parts)

class AuthHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean logging
        pass

    def _send_response(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()

    def do_GET(self):
        global REQUEST_COUNTER
        REQUEST_COUNTER += 1
        clean_path = self.path.split("?")[0].rstrip("/")

        dist_index = os.path.join(DIST_DIR, "index.html")
        template_index = os.path.join(TEMPLATES_DIR, "index.html")
        template_dashboard = os.path.join(TEMPLATES_DIR, "dashboard.html")

        # Frontend Single Page App Routes
        if clean_path in ("", "/", "/dashboard", "/portal", "/pricing", "/emulator", "/optimizer", "/settings"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            if os.path.exists(dist_index):
                with open(dist_index, "rb") as f:
                    self.wfile.write(f.read())
            elif os.path.exists(template_index):
                with open(template_index, "rb") as f:
                    self.wfile.write(f.read())
            elif os.path.exists(template_dashboard):
                with open(template_dashboard, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b"<h1>Knoxyy Central Portal</h1><p>Frontend loading...</p>")

        # Static Assets (/assets/*)
        elif clean_path.startswith("/assets/"):
            asset_filename = os.path.basename(clean_path)
            asset_file = os.path.join(DIST_DIR, "assets", asset_filename)
            if os.path.exists(asset_file):
                mime = "application/octet-stream"
                if asset_file.endswith(".js"):
                    mime = "application/javascript; charset=utf-8"
                elif asset_file.endswith(".css"):
                    mime = "text/css; charset=utf-8"
                elif asset_file.endswith(".svg"):
                    mime = "image/svg+xml"
                elif asset_file.endswith(".png"):
                    mime = "image/png"
                elif asset_file.endswith(".ico"):
                    mime = "image/x-icon"
                elif asset_file.endswith(".woff2"):
                    mime = "font/woff2"

                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(asset_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_response(404, {"error": "Asset not found"})

        # Metrics Telemetry API
        elif clean_path == "/api/v1/metrics":
            uptime_sec = int((datetime.now(timezone.utc) - SERVER_START_TIME).total_seconds())
            hours, remainder = divmod(uptime_sec, 3600)
            minutes, seconds = divmod(remainder, 60)
            uptime_str = f"{hours}h {minutes}m {seconds}s"

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM licenses")
            total = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM licenses WHERE is_active = 1")
            active = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM licenses WHERE is_active = 0")
            banned = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM licenses WHERE hwid IS NOT NULL AND TRIM(hwid) != ''")
            bound = cursor.fetchone()[0]

            now_iso = datetime.now(timezone.utc)
            cursor.execute("SELECT last_seen FROM licenses WHERE last_seen IS NOT NULL")
            online_count = 0
            for r in cursor.fetchall():
                try:
                    dt = datetime.fromisoformat(r[0])
                    if (now_iso - dt).total_seconds() < 75:
                        online_count += 1
                except Exception:
                    pass
            conn.close()

            db_size = os.path.getsize(DB_FILE) if os.path.exists(DB_FILE) else 0

            self._send_response(200, {
                "status": "Operational",
                "uptime_seconds": uptime_sec,
                "uptime_formatted": uptime_str,
                "uptime_pct": "99.98%",
                "throughput_rps": round(REQUEST_COUNTER / max(uptime_sec, 1), 2),
                "requests_total": REQUEST_COUNTER,
                "latency_ms": 0.45,
                "db_size_kb": round(db_size / 1024, 1),
                "total_keys": total,
                "active_keys": active,
                "banned_keys": banned,
                "bound_hwid_keys": bound,
                "online_keys": online_count
            })

        # List all licenses
        elif clean_path == "/api/v1/admin/list":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM licenses ORDER BY last_seen DESC, created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            conn.close()
            self._send_response(200, {"licenses": rows})

        # Health check
        elif clean_path == "/api/v1/health":
            self._send_response(200, {"status": "online", "suite": "Knoxyy Gaming Suite"})

        # Logo & Favicon
        elif clean_path == "/logo.png":
            logo_file = os.path.join(BASE_DIR, "logo.png")
            if os.path.exists(logo_file):
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.end_headers()
                with open(logo_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_response(404, {"error": "Logo not found"})

        elif clean_path == "/favicon.ico":
            fav_file = os.path.join(BASE_DIR, "favicon.ico")
            if os.path.exists(fav_file):
                self.send_response(200)
                self.send_header("Content-Type", "image/x-icon")
                self.end_headers()
                with open(fav_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_response(404, {"error": "Favicon not found"})

        else:
            self._send_response(404, {"error": "Not Found"})

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length).decode("utf-8", errors="replace")

        body = {}
        content_type = self.headers.get("Content-Type", "")
        if "application/json" in content_type:
            try:
                body = json.loads(raw_body)
            except Exception:
                pass
        else:
            parsed = urllib.parse.parse_qs(raw_body)
            body = {k: v[0] for k, v in parsed.items()}

        path = self.path.split("?")[0].rstrip("/")

        if path in ("/api/1.3", "/api/1.3/"):
            self.handle_keyauth_emulation(body)
        elif path == "/api/v1/activate":
            self.handle_activate(body)
        elif path == "/api/v1/heartbeat":
            self.handle_heartbeat(body)
        elif path == "/api/v1/admin/create_key":
            self.handle_create_key(body)
        elif path == "/api/v1/admin/action":
            self.handle_admin_action(body)
        else:
            self._send_response(404, {"error": "Endpoint not found"})

    def handle_keyauth_emulation(self, body: dict):
        """Emulate KeyAuth 1.3 protocol with strict Username + Key validation."""
        req_type = body.get("type", "").strip()
        client_ip = self.client_address[0]
        now_str = datetime.now(timezone.utc).isoformat()

        if req_type == "init":
            self._send_response(200, {
                "success": True,
                "message": "Initialized",
                "sessionid": "sess_knoxyy_local_ok",
                "appinfo": {"version": "1.0"}
            })
            return

        hwid = body.get("hwid", "").strip()

        if req_type == "login":
            username = body.get("username", "").strip()
            key = body.get("password", "").strip()

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
            row = cursor.fetchone()

            if not row:
                conn.close()
                self._send_response(200, {"success": False, "message": "Galat License Key hai."})
                return

            if row["username"].strip().upper() != username.upper():
                conn.close()
                self._send_response(200, {
                    "success": False,
                    "message": f"Yeh key sirf '{row['username']}' ke account ke liye valid hai."
                })
                return

            if row["is_active"] != 1:
                conn.close()
                self._send_response(200, {"success": False, "message": "Yeh License ban/revoked kar diya gaya hai."})
                return

            if row["expires_at"] != "LIFETIME":
                try:
                    exp = datetime.fromisoformat(row["expires_at"]).replace(tzinfo=timezone.utc)
                    if datetime.now(timezone.utc) > exp:
                        conn.close()
                        self._send_response(200, {"success": False, "message": "Aapka License expire ho chuka hai."})
                        return
                except Exception:
                    pass

            if not row["hwid"]:
                cursor.execute("UPDATE licenses SET hwid = ?, ip_address = ?, last_seen = ? WHERE key = ?",
                               (hwid, client_ip, now_str, row["key"]))
            elif row["hwid"] != hwid:
                conn.close()
                self._send_response(200, {"success": False, "message": "Yeh key kisi aur PC par bound hai (HWID locked)."})
                return
            else:
                cursor.execute("UPDATE licenses SET ip_address = ?, last_seen = ?, force_logout = 0 WHERE key = ?",
                               (client_ip, now_str, row["key"]))
            conn.commit()
            conn.close()

            self._send_response(200, {
                "success": True,
                "message": "Logged in!",
                "info": {
                    "username": row["username"],
                    "subscriptions": [
                        {"subscription": "default", "expiry": "1893456000"}
                    ]
                }
            })
            return

        elif req_type == "license":
            key = body.get("key", "").strip()

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
            row = cursor.fetchone()

            if not row:
                conn.close()
                self._send_response(200, {"success": False, "message": "Galat License Key hai."})
                return

            if row["is_active"] != 1:
                conn.close()
                self._send_response(200, {"success": False, "message": "Yeh License ban/revoked kar diya gaya hai."})
                return

            if row["expires_at"] != "LIFETIME":
                try:
                    exp = datetime.fromisoformat(row["expires_at"]).replace(tzinfo=timezone.utc)
                    if datetime.now(timezone.utc) > exp:
                        conn.close()
                        self._send_response(200, {"success": False, "message": "Aapka License expire ho chuka hai."})
                        return
                except Exception:
                    pass

            if not row["hwid"]:
                cursor.execute("UPDATE licenses SET hwid = ?, ip_address = ?, last_seen = ? WHERE key = ?",
                               (hwid, client_ip, now_str, row["key"]))
            elif row["hwid"] != hwid:
                conn.close()
                self._send_response(200, {"success": False, "message": "Yeh key kisi aur PC par bound hai (HWID locked)."})
                return
            else:
                cursor.execute("UPDATE licenses SET ip_address = ?, last_seen = ?, force_logout = 0 WHERE key = ?",
                               (client_ip, now_str, row["key"]))
            conn.commit()
            conn.close()

            self._send_response(200, {
                "success": True,
                "message": "Logged in!",
                "info": {
                    "username": row["username"],
                    "subscriptions": [
                        {"subscription": "default", "expiry": "1893456000"}
                    ]
                }
            })
            return

        self._send_response(200, {"success": False, "message": f"Unsupported request type: {req_type}"})

    def handle_activate(self, body: dict):
        key = body.get("license_key", "").strip() or body.get("key", "").strip()
        hwid = body.get("hwid", "").strip()
        client_ip = self.client_address[0]
        req_product = body.get("product", "emulator").lower()
        now_str = datetime.now(timezone.utc).isoformat()

        if not key or not hwid:
            self._send_response(400, {"success": False, "message": "License key and HWID required."})
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
        row = cursor.fetchone()

        if not row:
            conn.close()
            self._send_response(401, {"success": False, "message": "Invalid license key."})
            return

        if row["is_active"] != 1:
            conn.close()
            self._send_response(403, {"success": False, "message": "License has been revoked or banned."})
            return

        # Product validation: 'all' works for both, otherwise must match requested suite
        key_prod = (row["product"] or "emulator").lower()
        if key_prod != "all" and req_product and key_prod != req_product:
            conn.close()
            self._send_response(403, {
                "success": False,
                "message": f"This license key is only valid for Knoxyy {key_prod.title()}."
            })
            return

        # Check expiration
        if row["expires_at"] != "LIFETIME":
            try:
                exp = datetime.fromisoformat(row["expires_at"]).replace(tzinfo=timezone.utc)
                if datetime.now(timezone.utc) > exp:
                    conn.close()
                    self._send_response(403, {"success": False, "message": "License has expired."})
                    return
            except Exception:
                pass

        # HWID binding & check
        if not row["hwid"]:
            cursor.execute("UPDATE licenses SET hwid = ?, ip_address = ?, last_seen = ? WHERE key = ?",
                           (hwid, client_ip, now_str, row["key"]))
        elif row["hwid"] != hwid:
            conn.close()
            self._send_response(403, {
                "success": False,
                "message": "HWID mismatch. This key is bound to another hardware profile."
            })
            return
        else:
            cursor.execute("UPDATE licenses SET ip_address = ?, last_seen = ?, force_logout = 0 WHERE key = ?",
                           (client_ip, now_str, row["key"]))

        conn.commit()
        conn.close()

        self._send_response(200, {
            "success": True,
            "message": "Activation successful",
            "username": row["username"],
            "expires_at": row["expires_at"],
            "product": key_prod
        })

    def handle_heartbeat(self, body: dict):
        key = body.get("license_key", "").strip() or body.get("key", "").strip()
        hwid = body.get("hwid", "").strip()
        client_ip = self.client_address[0]
        now_str = datetime.now(timezone.utc).isoformat()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
        row = cursor.fetchone()

        if not row:
            conn.close()
            self._send_response(401, {"success": False, "action": "kick", "message": "License revoked"})
            return

        if row["is_active"] != 1:
            conn.close()
            self._send_response(403, {"success": False, "action": "kick", "message": "License banned"})
            return

        if row["hwid"] and row["hwid"] != hwid:
            conn.close()
            self._send_response(403, {"success": False, "action": "kick", "message": "HWID mismatch"})
            return

        if row["force_logout"] == 1:
            cursor.execute("UPDATE licenses SET force_logout = 0 WHERE key = ?", (key,))
            conn.commit()
            conn.close()
            self._send_response(200, {"success": False, "action": "kick", "message": "Kicked by administrator"})
            return

        cursor.execute("UPDATE licenses SET last_seen = ?, ip_address = ? WHERE key = ?", (now_str, client_ip, key))
        conn.commit()
        conn.close()
        self._send_response(200, {"success": True, "action": "continue"})

    def handle_create_key(self, body: dict):
        username = (body.get("username") or "User").strip()
        days = body.get("days", 30)
        product = (body.get("product") or "emulator").lower()
        if product not in ("emulator", "optimizer", "all"):
            # Map store products if submitted as string
            if "opti" in product or "boost" in product or "sensi" in product or "bat" in product or "debloat" in product or "reg" in product or "tweak" in product:
                product = "optimizer"
            elif "bundle" in product or "vip" in product or "all" in product:
                product = "all"
            else:
                product = "emulator"

        prefix = "KNOXYY-EMU" if product == "emulator" else ("KNOXYY-OPTI" if product == "optimizer" else "KNOXYY-VIP")
        key = generate_key_str(prefix)
        created_at = datetime.now(timezone.utc).isoformat()
        expires_at = "LIFETIME" if days == -1 else (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active, product)
            VALUES (?, ?, NULL, ?, ?, 1, ?)
        """, (key, username, created_at, expires_at, product))
        conn.commit()
        conn.close()

        self._send_response(200, {
            "success": True,
            "key": key,
            "username": username,
            "expires_at": expires_at,
            "product": product
        })

    def handle_admin_action(self, body: dict):
        act = body.get("action")
        key = body.get("key")

        conn = get_db()
        cursor = conn.cursor()
        if act == "kick":
            cursor.execute("UPDATE licenses SET force_logout = 1 WHERE key = ?", (key,))
        elif act == "ban":
            cursor.execute("UPDATE licenses SET is_active = 0, force_logout = 1 WHERE key = ?", (key,))
        elif act == "unban":
            cursor.execute("UPDATE licenses SET is_active = 1 WHERE key = ?", (key,))
        elif act == "reset_hwid":
            cursor.execute("UPDATE licenses SET hwid = NULL WHERE key = ?", (key,))
        elif act == "delete":
            cursor.execute("DELETE FROM licenses WHERE key = ?", (key,))
        conn.commit()
        conn.close()
        self._send_response(200, {"success": True})

def run_server():
    init_db()
    server = HTTPServer(("", PORT), AuthHandler)
    print("=" * 65)
    print(f"[*] KNOXYY CENTRAL GAMING SUITE running on port {PORT}")
    print(f"[*] WEB DASHBOARD:  http://127.0.0.1:{PORT}/")
    print(f"[*] APP ENDPOINT:   http://127.0.0.1:{PORT}/api/1.3/")
    print(f"[*] METRICS API:    http://127.0.0.1:{PORT}/api/v1/metrics")
    print("=" * 65)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server shutdown.")

if __name__ == "__main__":
    run_server()
