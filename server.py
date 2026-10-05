"""
Custom Licensing & Real-time User Control Server
Supports:
- Web Admin Dashboard (accessible via browser at /dashboard)
- KeyAuth 1.3 protocol emulation (/api/1.3/) for direct app connectivity
- Strict Username + License Key matching verification
- Live Heartbeat tracking (tracks who is online right now)
- Remote session termination / Instant Kick / Ban
- Automated Key Generation API for bots/webhooks
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sqlite3
import secrets
import string
import urllib.parse
from datetime import datetime, timezone, timedelta
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "licenses.db")
PORT = int(os.environ.get("PORT", 8080))

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
            force_logout INTEGER DEFAULT 0
        )
    """)
    conn.commit()

    # Pre-seed initial default licenses if empty
    cursor.execute("SELECT COUNT(*) FROM licenses")
    count = cursor.fetchone()[0]
    if count == 0:
        now_str = datetime.now(timezone.utc).isoformat()
        seeds = [
            ("KNOXYY-A9NM-09Q7-V1UH", "NEEL", None, now_str, "LIFETIME", 1),
            ("KNOXYY-8K5M-5ULT-Y2ZV", "AdminUser", None, now_str, "LIFETIME", 1)
        ]
        cursor.executemany("""
            INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
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

DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>KNOXYY 69 - License Control Center</title>
<style>
  body { background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 25px; }
  h1 { color: #38bdf8; margin-bottom: 5px; }
  .subtitle { color: #94a3b8; margin-bottom: 25px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px; }
  .card { background: #1e293b; border: 1px solid #334155; padding: 18px; border-radius: 8px; }
  .card .num { font-size: 28px; font-weight: bold; color: #38bdf8; }
  table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; font-size: 14px; }
  th { background: #0f172a; color: #94a3b8; font-weight: 600; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .online { background: #065f46; color: #34d399; }
  .offline { background: #374151; color: #9ca3af; }
  .revoked { background: #7f1d1d; color: #f87171; }
  button { padding: 6px 12px; border-radius: 5px; border: none; font-weight: 600; cursor: pointer; font-size: 12px; margin-right: 5px; }
  .btn-create { background: #0284c7; color: white; padding: 10px 18px; font-size: 14px; margin-bottom: 20px; }
  .btn-kick { background: #eab308; color: black; }
  .btn-ban { background: #dc2626; color: white; }
  .btn-reset { background: #475569; color: white; }
  .btn-unban { background: #16a34a; color: white; }
</style>
</head>
<body>
  <h1>KNOXYY 69 - Real-time Control Center</h1>
  <div class="subtitle">Monitor active sessions, control running instances, and automate key generation.</div>

  <div class="grid">
    <div class="card"><div>Total Licenses</div><div class="num" id="stat-total">0</div></div>
    <div class="card"><div>Active Online Now</div><div class="num" style="color: #34d399;" id="stat-online">0</div></div>
    <div class="card"><div>Banned / Revoked</div><div class="num" style="color: #f87171;" id="stat-revoked">0</div></div>
  </div>

  <button class="btn-create" onclick="createKeyPrompt()">+ Generate New License</button>

  <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>User</th>
        <th>Presence</th>
        <th>Status</th>
        <th>IP Address</th>
        <th>Hardware Lock (HWID)</th>
        <th>Expires</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="licenses-body"></tbody>
  </table>

<script>
async function loadData() {
  const res = await fetch('/api/v1/admin/list');
  const data = await res.json();
  const tbody = document.getElementById('licenses-body');
  tbody.innerHTML = '';

  let onlineCount = 0;
  let revokedCount = 0;
  const now = new Date();

  data.licenses.forEach(l => {
    let isOnline = false;
    if (l.last_seen) {
      const diff = (now - new Date(l.last_seen)) / 1000;
      if (diff < 75) isOnline = true;
    }
    if (isOnline) onlineCount++;
    if (l.is_active === 0) revokedCount++;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: bold; color: #38bdf8;">${l.key}</td>
      <td>${l.username}</td>
      <td><span class="badge ${isOnline ? 'online' : 'offline'}">${isOnline ? 'ONLINE' : 'Offline'}</span></td>
      <td><span class="badge ${l.is_active ? 'online' : 'revoked'}">${l.is_active ? 'Active' : 'Banned'}</span></td>
      <td>${l.ip_address || '-'}</td>
      <td style="font-family: monospace; font-size: 11px;">${l.hwid ? l.hwid.substring(0, 16) + '...' : '(Unbound)'}</td>
      <td>${l.expires_at}</td>
      <td>
        ${isOnline ? `<button class="btn-kick" onclick="action('kick', '${l.key}')">Kick</button>` : ''}
        ${l.is_active ? `<button class="btn-ban" onclick="action('ban', '${l.key}')">Ban</button>` : `<button class="btn-unban" onclick="action('unban', '${l.key}')">Unban</button>`}
        <button class="btn-reset" onclick="action('reset_hwid', '${l.key}')">Reset HWID</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('stat-total').innerText = data.licenses.length;
  document.getElementById('stat-online').innerText = onlineCount;
  document.getElementById('stat-revoked').innerText = revokedCount;
}

async function action(act, key) {
  if (confirm(`Execute ${act} on key ${key}?`)) {
    await fetch('/api/v1/admin/action', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: act, key: key})
    });
    loadData();
  }
}

async function createKeyPrompt() {
  const user = prompt("Enter username for this license:");
  if (!user) return;
  const days = prompt("Enter validity in days (or -1 for Lifetime):", "30");
  if (!days) return;

  const res = await fetch('/api/v1/admin/create_key', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username: user, days: parseInt(days)})
  });
  const result = await res.json();
  alert(`Key Created: ${result.key}`);
  loadData();
}

loadData();
setInterval(loadData, 5000);
</script>
</body>
</html>
"""

class AuthHandler(BaseHTTPRequestHandler):
    def _send_response(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_GET(self):
        if self.path in ("/", "/dashboard"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(DASHBOARD_HTML.encode("utf-8"))
        elif self.path == "/api/v1/admin/list":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM licenses ORDER BY last_seen DESC, created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            conn.close()
            self._send_response(200, {"licenses": rows})
        elif self.path == "/api/v1/health":
            self._send_response(200, {"status": "online"})
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

        path = self.path.rstrip("/")

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
            password_key = body.get("password", "").strip()

            if not username or not password_key:
                self._send_response(200, {
                    "success": False,
                    "message": "Dono Username aur License Key daalna zaroori hai."
                })
                return

            conn = get_db()
            cursor = conn.cursor()
            
            # STRICT CHECK: Username AND Key MUST both match the exact record!
            cursor.execute("""
                SELECT * FROM licenses 
                WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) AND TRIM(key) = TRIM(?)
            """, (username, password_key))
            row = cursor.fetchone()

            if not row:
                conn.close()
                self._send_response(200, {
                    "success": False,
                    "message": "Username aur License Key match nahi hua! Kripya sahi credentials daalein."
                })
                return

            if row["is_active"] != 1:
                conn.close()
                self._send_response(200, {"success": False, "message": "Yeh License ban/revoked kar diya gaya hai."})
                return

            # Check expiration
            if row["expires_at"] != "LIFETIME":
                try:
                    exp = datetime.fromisoformat(row["expires_at"]).replace(tzinfo=timezone.utc)
                    if datetime.now(timezone.utc) > exp:
                        conn.close()
                        self._send_response(200, {"success": False, "message": "Aapka License expire ho chuka hai."})
                        return
                except Exception:
                    pass

            # HWID lock check
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

            # Return success
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

            # Expiration
            if row["expires_at"] != "LIFETIME":
                try:
                    exp = datetime.fromisoformat(row["expires_at"]).replace(tzinfo=timezone.utc)
                    if datetime.now(timezone.utc) > exp:
                        conn.close()
                        self._send_response(200, {"success": False, "message": "Aapka License expire ho chuka hai."})
                        return
                except Exception:
                    pass

            # HWID lock
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
        key = body.get("license_key", "").strip()
        hwid = body.get("hwid", "").strip()
        client_ip = self.client_address[0]

        if not key or not hwid:
            self._send_response(400, {"success": False, "message": "Key and HWID required"})
            return

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM licenses WHERE key = ?", (key,))
        row = cursor.fetchone()

        if not row:
            conn.close()
            self._send_response(401, {"success": False, "message": "Invalid license key"})
            return

        if row["is_active"] != 1:
            conn.close()
            self._send_response(403, {"success": False, "message": "License has been deactivated/banned"})
            return

        if not row["hwid"]:
            cursor.execute("UPDATE licenses SET hwid = ?, ip_address = ?, last_seen = ? WHERE key = ?",
                           (hwid, client_ip, datetime.now(timezone.utc).isoformat(), key))
            conn.commit()
        elif row["hwid"] != hwid:
            conn.close()
            self._send_response(403, {"success": False, "message": "License registered to another machine"})
            return
        else:
            cursor.execute("UPDATE licenses SET ip_address = ?, last_seen = ?, force_logout = 0 WHERE key = ?",
                           (client_ip, datetime.now(timezone.utc).isoformat(), key))
            conn.commit()

        conn.close()
        self._send_response(200, {
            "success": True,
            "username": row["username"],
            "expires_at": row["expires_at"]
        })

    def handle_heartbeat(self, body: dict):
        key = body.get("license_key", "").strip()
        hwid = body.get("hwid", "").strip()
        client_ip = self.client_address[0]
        now_str = datetime.now(timezone.utc).isoformat()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_active, force_logout FROM licenses WHERE key = ? AND hwid = ?", (key, hwid))
        row = cursor.fetchone()

        if not row or row["is_active"] != 1:
            conn.close()
            self._send_response(403, {"success": False, "action": "terminate", "message": "License revoked"})
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
        username = body.get("username", "user")
        days = body.get("days", 30)

        key = generate_key_str()
        created_at = datetime.now(timezone.utc).isoformat()
        expires_at = "LIFETIME" if days == -1 else (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active)
            VALUES (?, ?, NULL, ?, ?, 1)
        """, (key, username, created_at, expires_at))
        conn.commit()
        conn.close()

        self._send_response(200, {"success": True, "key": key, "username": username, "expires_at": expires_at})

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
        conn.commit()
        conn.close()
        self._send_response(200, {"success": True})

def run_server():
    init_db()
    server = HTTPServer(("", PORT), AuthHandler)
    print("=" * 60)
    print(f"[*] KNOXYY 69 Auth Server running on port {PORT}")
    print(f"[*] WEB DASHBOARD:  http://127.0.0.1:{PORT}/dashboard")
    print(f"[*] APP ENDPOINT:   http://127.0.0.1:{PORT}/api/1.3/")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server shutdown.")

if __name__ == "__main__":
    run_server()
