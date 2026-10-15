"""
╔═══════════════════════════════════════════════════════════╗
║          KNOXYY CENTRAL — UNIFIED GAMING SUITE            ║
║                  Cloud Licensing Server                    ║
╠═══════════════════════════════════════════════════════════╣
║  Products:  🎮 Knoxyy Emulator v69.67 Gold Elite          ║
║             ⚡ Knoxyy Pro Aim Optimizer                    ║
║                                                           ║
║  Features:                                                ║
║   • Unified Web Portal with Suite-Choice Hub              ║
║   • Product-specific + All-in-One VIP License Keys        ║
║   • Live Session Monitoring & Real-time Heartbeat         ║
║   • Remote Kick, Ban/Unban, HWID Lock & Reset             ║
║   • REST API  →  /api/v1/  (activate, heartbeat, admin)   ║
║   • KeyAuth 1.3 Protocol Emulation  →  /api/1.3/          ║
╚═══════════════════════════════════════════════════════════╝
"""

# ──────────────────────────────────────────────────────────
#  Standard library imports
# ──────────────────────────────────────────────────────────
import json
import os
import secrets
import sqlite3
import string
import urllib.parse
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer

# ──────────────────────────────────────────────────────────
#  Configuration
# ──────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DB_FILE     = os.path.join(BASE_DIR, "licenses.db")
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR  = os.path.join(BASE_DIR, "static")
PORT        = int(os.environ.get("PORT", 8080))

# ──────────────────────────────────────────────────────────
#  Default seed keys  (only inserted once on first run)
# ──────────────────────────────────────────────────────────
_SEED_LICENSES = [
    ("KNOXYY-VIP-GOLD-6967",   "VIPMaster",  "LIFETIME",  "all"),
    ("KNOXYY-A9NM-09Q7-V1UH",  "NEEL",       "LIFETIME",  "all"),
    ("KNOXYY-EMU-8K5M-5ULT",   "AdminUser",  "LIFETIME",  "emulator"),
    ("KNOXYY-OPTI-9X4F-2K1M",  "ProGamer",   "LIFETIME",  "optimizer"),
]


# ══════════════════════════════════════════════════════════
#  DATABASE LAYER
# ══════════════════════════════════════════════════════════

def init_db() -> None:
    """Create/migrate the SQLite database and seed default keys."""
    conn = sqlite3.connect(DB_FILE)
    cur  = conn.cursor()

    # Create table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS licenses (
            key          TEXT PRIMARY KEY,
            username     TEXT,
            hwid         TEXT,
            created_at   TEXT,
            expires_at   TEXT,
            is_active    INTEGER DEFAULT 1,
            last_seen    TEXT,
            ip_address   TEXT,
            force_logout INTEGER DEFAULT 0,
            product      TEXT    DEFAULT 'emulator'
        )
    """)
    conn.commit()

    # Schema migration — add 'product' column if missing
    cur.execute("PRAGMA table_info(licenses)")
    existing_cols = {row[1] for row in cur.fetchall()}
    if "product" not in existing_cols:
        cur.execute("ALTER TABLE licenses ADD COLUMN product TEXT DEFAULT 'emulator'")
        conn.commit()

    # Seed only if table is empty
    cur.execute("SELECT COUNT(*) FROM licenses")
    if cur.fetchone()[0] == 0:
        now = datetime.now(timezone.utc).isoformat()
        cur.executemany(
            "INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active, product) "
            "VALUES (?, ?, NULL, ?, ?, 1, ?)",
            [(k, u, now, exp, prod) for k, u, exp, prod in _SEED_LICENSES]
        )
        conn.commit()

    conn.close()


def get_db() -> sqlite3.Connection:
    """Return an open, Row-factory-enabled database connection."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


# ══════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════

def generate_key(prefix: str = "KNOXYY") -> str:
    """Generate a random license key like  PREFIX-XXXX-XXXX-XXXX."""
    charset = string.ascii_uppercase + string.digits
    chunks  = ["".join(secrets.choice(charset) for _ in range(4)) for _ in range(3)]
    return "-".join([prefix] + chunks)


def key_prefix_for(product: str) -> str:
    mapping = {"emulator": "KNOXYY-EMU", "optimizer": "KNOXYY-OPTI", "all": "KNOXYY-VIP"}
    return mapping.get(product, "KNOXYY")


def is_expired(expires_at: str) -> bool:
    """Return True if the license has passed its expiry date."""
    if expires_at == "LIFETIME":
        return False
    try:
        exp = datetime.fromisoformat(expires_at).replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) > exp
    except Exception:
        return False


def read_template(name: str) -> bytes:
    """Load an HTML template from the templates/ directory."""
    path = os.path.join(TEMPLATE_DIR, name)
    with open(path, "rb") as f:
        return f.read()


def read_static(name: str) -> bytes | None:
    """Load a static file; return None if not found."""
    path = os.path.join(STATIC_DIR, name)
    if os.path.isfile(path):
        with open(path, "rb") as f:
            return f.read()
    # Fallback to base dir (favicon.ico, logo.png live there)
    path2 = os.path.join(BASE_DIR, name)
    if os.path.isfile(path2):
        with open(path2, "rb") as f:
            return f.read()
    return None


# ══════════════════════════════════════════════════════════
#  HTTP HANDLER
# ══════════════════════════════════════════════════════════

class AuthHandler(BaseHTTPRequestHandler):

    # ── Logging ────────────────────────────────────────────
    def log_message(self, fmt, *args):  # silence default logs
        pass

    # ── Response helpers ────────────────────────────────────
    def _json(self, status: int, data: dict) -> None:
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type",  "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _html(self, body: bytes, status: int = 200) -> None:
        self.send_response(status)
        self.send_header("Content-Type",  "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _binary(self, body: bytes, mime: str) -> None:
        self.send_response(200)
        self.send_header("Content-Type",   mime)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ── CORS pre-flight ─────────────────────────────────────
    def do_OPTIONS(self) -> None:
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # ══ GET ════════════════════════════════════════════════
    def do_GET(self) -> None:
        path = self.path.split("?")[0].rstrip("/")

        # ── Dashboard / Portal ──────────────────────────────
        if path in ("", "/", "/dashboard", "/portal"):
            try:
                self._html(read_template("dashboard.html"))
            except FileNotFoundError:
                self._html(b"<h1>Template not found</h1>", 500)
            return

        # ── Static files ────────────────────────────────────
        static_map = {
            "/favicon.ico": "image/x-icon",
            "/logo.png":    "image/png",
        }
        if path in static_map:
            data = read_static(path.lstrip("/"))
            if data:
                self._binary(data, static_map[path])
            else:
                self._json(404, {"error": "File not found"})
            return

        # ── Admin: list all licenses ─────────────────────────
        if path == "/api/v1/admin/list":
            self._handle_list()
            return

        self._json(404, {"error": "Endpoint not found"})

    # ══ POST ═══════════════════════════════════════════════
    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        raw    = self.rfile.read(length).decode("utf-8", errors="replace") if length else ""

        ctype  = self.headers.get("Content-Type", "")
        if "application/json" in ctype:
            try:
                body = json.loads(raw) if raw else {}
            except json.JSONDecodeError:
                body = {}
        else:
            body = {k: v[0] for k, v in urllib.parse.parse_qs(raw).items()}

        path = self.path.split("?")[0].rstrip("/")
        route_map = {
            "/api/1.3":                  self._handle_keyauth,
            "/api/1.3/":                 self._handle_keyauth,
            "/api/v1/activate":          self._handle_activate,
            "/api/v1/heartbeat":         self._handle_heartbeat,
            "/api/v1/admin/create_key":  self._handle_create_key,
            "/api/v1/admin/action":      self._handle_admin_action,
        }
        handler = route_map.get(path)
        if handler:
            handler(body)
        else:
            self._json(404, {"error": "Endpoint not found"})

    # ══════════════════════════════════════════════════════
    #  ROUTE HANDLERS
    # ══════════════════════════════════════════════════════

    # ── List all licenses ───────────────────────────────────
    def _handle_list(self) -> None:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("SELECT * FROM licenses ORDER BY created_at DESC")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        self._json(200, {"licenses": rows})

    # ── KeyAuth 1.3 emulation ───────────────────────────────
    def _handle_keyauth(self, body: dict) -> None:
        req_type  = body.get("type", "").strip()
        client_ip = self.client_address[0]
        now_str   = datetime.now(timezone.utc).isoformat()
        hwid      = body.get("hwid", "").strip()

        if req_type == "init":
            self._json(200, {
                "success": True,
                "message": "Initialized",
                "sessionid": "sess_knoxyy_ok",
                "appinfo":  {"version": "1.0"}
            })
            return

        if req_type == "login":
            username = body.get("username", "").strip()
            key      = body.get("password",  "").strip()
            return self._keyauth_login(username, key, hwid, client_ip, now_str)

        if req_type == "license":
            key = body.get("key", "").strip()
            return self._keyauth_license(key, hwid, client_ip, now_str)

        self._json(200, {"success": False, "message": f"Unsupported type: {req_type}"})

    def _keyauth_login(self, username, key, hwid, ip, now_str):
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
        row = cur.fetchone()

        if not row:
            conn.close()
            return self._json(200, {"success": False, "message": "Galat License Key hai."})
        if row["username"].strip().upper() != username.upper():
            conn.close()
            return self._json(200, {"success": False, "message": f"Key sirf '{row['username']}' ke liye valid hai."})
        if row["is_active"] != 1:
            conn.close()
            return self._json(200, {"success": False, "message": "License ban/revoked kar di gayi hai."})
        if is_expired(row["expires_at"]):
            conn.close()
            return self._json(200, {"success": False, "message": "License expire ho chuki hai."})

        if not row["hwid"]:
            cur.execute("UPDATE licenses SET hwid=?, ip_address=?, last_seen=? WHERE key=?",
                        (hwid, ip, now_str, key))
        elif row["hwid"] != hwid:
            conn.close()
            return self._json(200, {"success": False, "message": "Key kisi aur PC par bound hai."})
        else:
            cur.execute("UPDATE licenses SET ip_address=?, last_seen=?, force_logout=0 WHERE key=?",
                        (ip, now_str, key))
        conn.commit(); conn.close()

        self._json(200, {
            "success": True,
            "message": "Logged in!",
            "info": {
                "username": row["username"],
                "subscriptions": [{"subscription": "default", "expiry": "1893456000"}]
            }
        })

    def _keyauth_license(self, key, hwid, ip, now_str):
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
        row = cur.fetchone()

        if not row:
            conn.close()
            return self._json(200, {"success": False, "message": "Galat License Key hai."})
        if row["is_active"] != 1:
            conn.close()
            return self._json(200, {"success": False, "message": "License ban/revoked."})
        if is_expired(row["expires_at"]):
            conn.close()
            return self._json(200, {"success": False, "message": "License expire ho chuki hai."})

        if not row["hwid"]:
            cur.execute("UPDATE licenses SET hwid=?, ip_address=?, last_seen=? WHERE key=?",
                        (hwid, ip, now_str, key))
        elif row["hwid"] != hwid:
            conn.close()
            return self._json(200, {"success": False, "message": "HWID mismatch — key already bound."})
        else:
            cur.execute("UPDATE licenses SET ip_address=?, last_seen=?, force_logout=0 WHERE key=?",
                        (ip, now_str, key))
        conn.commit(); conn.close()

        self._json(200, {
            "success": True,
            "message": "Logged in!",
            "info": {
                "username": row["username"],
                "subscriptions": [{"subscription": "default", "expiry": "1893456000"}]
            }
        })

    # ── Activate ────────────────────────────────────────────
    def _handle_activate(self, body: dict) -> None:
        key         = body.get("license_key", "").strip()
        hwid        = body.get("hwid",        "").strip()
        req_product = body.get("product",     "emulator").lower()
        client_ip   = self.client_address[0]
        now_str     = datetime.now(timezone.utc).isoformat()

        if not key or not hwid:
            return self._json(400, {"success": False, "message": "license_key and hwid are required."})

        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
        row = cur.fetchone()

        if not row:
            conn.close()
            return self._json(401, {"success": False, "message": "Invalid license key."})
        if row["is_active"] != 1:
            conn.close()
            return self._json(403, {"success": False, "message": "License has been revoked or banned."})

        # Product gate
        key_prod = (row["product"] or "emulator").lower()
        if key_prod != "all" and req_product and key_prod != req_product:
            conn.close()
            return self._json(403, {
                "success": False,
                "message": f"This key is only valid for Knoxyy {key_prod.title()}."
            })

        if is_expired(row["expires_at"]):
            conn.close()
            return self._json(403, {"success": False, "message": "License has expired."})

        # HWID binding
        if not row["hwid"]:
            cur.execute("UPDATE licenses SET hwid=?, ip_address=?, last_seen=? WHERE key=?",
                        (hwid, client_ip, now_str, key))
        elif row["hwid"] != hwid:
            conn.close()
            return self._json(403, {"success": False, "message": "HWID mismatch — key already bound to another PC."})
        else:
            cur.execute("UPDATE licenses SET ip_address=?, last_seen=?, force_logout=0 WHERE key=?",
                        (client_ip, now_str, key))
        conn.commit(); conn.close()

        self._json(200, {
            "success":    True,
            "message":    "Activation successful",
            "username":   row["username"],
            "expires_at": row["expires_at"],
            "product":    key_prod,
        })

    # ── Heartbeat ────────────────────────────────────────────
    def _handle_heartbeat(self, body: dict) -> None:
        key       = body.get("license_key", "").strip()
        hwid      = body.get("hwid",        "").strip()
        client_ip = self.client_address[0]
        now_str   = datetime.now(timezone.utc).isoformat()

        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT * FROM licenses WHERE TRIM(key) = TRIM(?)", (key,))
        row = cur.fetchone()

        if not row:
            conn.close()
            return self._json(401, {"success": False, "action": "kick", "message": "License not found."})
        if row["is_active"] != 1:
            conn.close()
            return self._json(403, {"success": False, "action": "kick", "message": "License banned."})
        if row["hwid"] and row["hwid"] != hwid:
            conn.close()
            return self._json(403, {"success": False, "action": "kick", "message": "HWID mismatch."})
        if row["force_logout"] == 1:
            cur.execute("UPDATE licenses SET force_logout=0 WHERE key=?", (key,))
            conn.commit(); conn.close()
            return self._json(200, {"success": False, "action": "kick", "message": "Kicked by administrator."})

        cur.execute("UPDATE licenses SET last_seen=?, ip_address=? WHERE key=?", (now_str, client_ip, key))
        conn.commit(); conn.close()
        self._json(200, {"success": True, "action": "continue"})

    # ── Admin: create key ────────────────────────────────────
    def _handle_create_key(self, body: dict) -> None:
        username = (body.get("username") or "User").strip()
        days     = body.get("days", 30)
        product  = (body.get("product") or "emulator").lower()

        if product not in ("emulator", "optimizer", "all"):
            product = "emulator"

        try:
            days = int(days)
        except (TypeError, ValueError):
            days = 30

        key        = generate_key(key_prefix_for(product))
        created_at = datetime.now(timezone.utc).isoformat()
        expires_at = "LIFETIME" if days == -1 else (
            datetime.now(timezone.utc) + timedelta(days=days)
        ).isoformat()

        conn = get_db(); cur = conn.cursor()
        cur.execute(
            "INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active, product) "
            "VALUES (?, ?, NULL, ?, ?, 1, ?)",
            (key, username, created_at, expires_at, product)
        )
        conn.commit(); conn.close()

        self._json(200, {
            "success":    True,
            "key":        key,
            "username":   username,
            "expires_at": expires_at,
            "product":    product,
        })

    # ── Admin: action (kick/ban/unban/reset/delete) ──────────
    def _handle_admin_action(self, body: dict) -> None:
        action = body.get("action", "")
        key    = body.get("key",    "")

        conn = get_db(); cur = conn.cursor()
        action_sql = {
            "kick":       ("UPDATE licenses SET force_logout=1 WHERE key=?",          (key,)),
            "ban":        ("UPDATE licenses SET is_active=0, force_logout=1 WHERE key=?", (key,)),
            "unban":      ("UPDATE licenses SET is_active=1 WHERE key=?",             (key,)),
            "reset_hwid": ("UPDATE licenses SET hwid=NULL WHERE key=?",               (key,)),
            "delete":     ("DELETE FROM licenses WHERE key=?",                         (key,)),
        }
        if action in action_sql:
            sql, params = action_sql[action]
            cur.execute(sql, params)
            conn.commit()
        conn.close()
        self._json(200, {"success": True})


# ══════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════

def run_server() -> None:
    init_db()
    server = HTTPServer(("", PORT), AuthHandler)
    line   = "=" * 58
    print(line)
    print(f"  🎮  KNOXYY CENTRAL GAMING SUITE — Port {PORT}")
    print(f"  🌐  Dashboard : http://127.0.0.1:{PORT}/")
    print(f"  🔑  Activate  : POST /api/v1/activate")
    print(f"  💓  Heartbeat : POST /api/v1/heartbeat")
    print(f"  🛡  KeyAuth   : POST /api/1.3/")
    print(f"  📋  List Keys : GET  /api/v1/admin/list")
    print(line)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  [✓] Server shutdown gracefully.")


if __name__ == "__main__":
    run_server()
