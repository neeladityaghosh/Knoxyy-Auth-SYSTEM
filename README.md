# KNOXYY 69 - Real-time Licensing & Control System

A complete, self-contained licensing server, web control dashboard, and automation API with **zero external dependencies**.

---

## What's Included

1. **`server.py`**:
   - Built-in **Web Admin Dashboard** at `http://127.0.0.1:8080/dashboard`
   - Real-time online tracking via heartbeat (green/gray badges)
   - One-click **Kick User**, **Ban / Unban**, **Reset HWID**
   - Automated REST API for bots and webhooks
2. **`client_auth.py`**:
   - Activation & hardware fingerprinting (HWID)
   - Background heartbeat thread (pings every 30s)
   - Instant response to remote **Kick** and **Ban** commands
3. **`manage_licenses.py`**:
   - CLI management tool to generate keys, list licenses, and inspect databases
4. **`automation_example.py`**:
   - Example Python code to plug key generation into a Discord bot, Telegram bot, or payment webhook

---

## How to Run & Control Users

### 1. Launch the Server
```powershell
python custom_auth_system\server.py
```

### 2. Open the Web Dashboard
Open your web browser and go to:
👉 **`http://127.0.0.1:8080/dashboard`**

From this dashboard, you can:
- View all licenses and expiration dates.
- See which users are **ONLINE** right now.
- Click **Kick** to immediately close a running client app.
- Click **Ban** to revoke access permanently.
- Click **Reset HWID** to allow a user to switch PCs.
- Click **+ Generate New License** directly in the browser.

### 3. Automated Key Creation (Bots / Webhooks)
Whenever someone buys or requests a key, trigger the automation API:
```powershell
python custom_auth_system\automation_example.py
```
This sends a JSON request to `http://127.0.0.1:8080/api/v1/admin/create_key` and automatically returns a freshly created key ready to be delivered to the customer.
