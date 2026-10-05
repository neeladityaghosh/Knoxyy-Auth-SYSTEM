# Knoxyy-Auth-SYSTEM v1.0.0

🎉 **First Official Release of Knoxyy-Auth-SYSTEM**

Knoxyy-Auth-SYSTEM is a lightweight, zero-dependency licensing server, real-time control dashboard, and client authentication library built using Python.

---

### ✨ Features in v1.0.0

- **Web Admin Dashboard**:
  - Live browser dashboard to monitor active online sessions.
  - One-click **Kick User**, **Ban / Unban**, and **Reset HWID**.
  - Interactive license generator with custom expiration (including Lifetime).
- **KeyAuth 1.3 Protocol Emulation**:
  - Out-of-the-box compatibility with desktop clients using KeyAuth protocols (`/api/1.3/`).
- **Real-time Heartbeat & Presence**:
  - 30-second ping telemetry to track connected client IPs and machine status.
- **Hardware Lock (HWID)**:
  - Binds license keys to machine hardware fingerprints to prevent unauthorized key sharing.
- **Zero External Dependencies**:
  - Built entirely using Python standard libraries (`http.server`, `sqlite3`, `json`, `hashlib`).
  - Deployable on Render, Railway, or local machines without `pip` dependencies.
- **Automation Ready**:
  - REST API endpoint (`/api/v1/admin/create_key`) for automated key delivery via Discord/Telegram bots or payment gateways.

---

### 📦 Files Included

- `server.py` — Core HTTP REST API & Web Dashboard
- `client_auth.py` — Client integration & live heartbeat worker
- `manage_licenses.py` — Admin CLI management tool
- `automation_example.py` — Bot and webhook automation integration template
- `requirements.txt` — Deployment descriptor
- `LICENSE` — MIT License
- `README.md` — Full setup and usage instructions
