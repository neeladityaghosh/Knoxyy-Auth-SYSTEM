"""
License Key Management CLI Tool
Generate, list, reset, and revoke licenses in the custom database.
"""

import sqlite3
import secrets
import string
from datetime import datetime, timezone, timedelta
import sys
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "licenses.db")

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
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
    return conn

def generate_key_string(prefix="KNOXYY"):
    parts = [prefix]
    for _ in range(3):
        chunk = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        parts.append(chunk)
    return "-".join(parts)

def create_license(username: str, days: int = 30):
    key = generate_key_string()
    created_at = datetime.now(timezone.utc).isoformat()
    if days == -1:
        expires_at = "LIFETIME"
    else:
        expires_at = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()

    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO licenses (key, username, hwid, created_at, expires_at, is_active)
        VALUES (?, ?, NULL, ?, ?, 1)
    """, (key, username, created_at, expires_at))
    conn.commit()
    conn.close()

    print(f"\n[+] Successfully created license!")
    print(f"    Key:        {key}")
    print(f"    User:       {username}")
    print(f"    Expires:    {expires_at}")
    return key

def list_licenses():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM licenses ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        print("\n[!] No licenses found in database.")
        return

    print(f"\n{'KEY':<24} {'USER':<15} {'STATUS':<10} {'BOUND HWID':<20} {'EXPIRES':<25}")
    print("-" * 95)
    for r in rows:
        status = "Active" if r["is_active"] == 1 else "Revoked"
        hwid = (r["hwid"][:16] + "...") if r["hwid"] else "(None - Not Activated)"
        print(f"{r['key']:<24} {r['username']:<15} {status:<10} {hwid:<20} {r['expires_at']:<25}")

def reset_hwid(key: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE licenses SET hwid = NULL WHERE key = ?", (key,))
    if cursor.rowcount > 0:
        conn.commit()
        print(f"\n[+] HWID reset for key {key}. Can now be activated on a new machine.")
    else:
        print(f"\n[!] Key not found.")
    conn.close()

def revoke_license(key: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE licenses SET is_active = 0 WHERE key = ?", (key,))
    if cursor.rowcount > 0:
        conn.commit()
        print(f"\n[+] License {key} has been revoked.")
    else:
        print(f"\n[!] Key not found.")
    conn.close()

def print_help():
    print("""
Usage:
  python manage_licenses.py create <username> [days]   Create a new license (use -1 for Lifetime)
  python manage_licenses.py list                       List all licenses
  python manage_licenses.py reset <key>                Reset HWID lock for a key
  python manage_licenses.py revoke <key>               Deactivate a key

Examples:
  python manage_licenses.py create testuser 30
  python manage_licenses.py create testuser -1
  python manage_licenses.py list
  python manage_licenses.py reset KNOXYY-ABCD-1234-EF56
""")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(0)

    cmd = sys.argv[1].lower()
    if cmd == "create" and len(sys.argv) >= 3:
        user = sys.argv[2]
        d = int(sys.argv[3]) if len(sys.argv) >= 4 else 30
        create_license(user, d)
    elif cmd == "list":
        list_licenses()
    elif cmd == "reset" and len(sys.argv) >= 3:
        reset_hwid(sys.argv[2])
    elif cmd == "revoke" and len(sys.argv) >= 3:
        revoke_license(sys.argv[2])
    else:
        print_help()
