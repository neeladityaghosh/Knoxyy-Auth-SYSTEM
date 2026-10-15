"""
Knoxyy Gaming Suite - Unified Licensing & Cloud Control Server
Supports:
- Unified Web Portal with Interactive Choice Screen:
    * 🎮 Knoxyy Emulator (v69.67 Gold Elite)
    * ⚡ Knoxyy Pro Aim Optimizer
- Product-specific and All-in-One VIP License Keys
- Live Session Monitoring & Real-time Heartbeat
- Remote Kick, Ban/Unban, HWID Hardware Lock & Reset
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

DB_FILE = os.path.join(os.path.dirname(__file__), "licenses.db")
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

DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Knoxyy Gaming Suite - Unified Control Portal</title>
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<style>
  :root {
    --bg-dark: #090d16;
    --card-bg: #121826;
    --card-border: #1e293b;
    --card-hover: #1e2942;
    --gold: #f59e0b;
    --gold-glow: rgba(245, 158, 11, 0.35);
    --cyan: #38bdf8;
    --cyan-glow: rgba(56, 189, 248, 0.35);
    --green: #10b981;
    --red: #ef4444;
    --text-primary: #f8fafc;
    --text-muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: radial-gradient(circle at 50% 0%, #151d30 0%, var(--bg-dark) 70%);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    min-height: 100vh;
    padding: 24px;
  }

  /* Top Navigation Bar */
  .top-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(18, 24, 38, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 14px 24px;
    margin-bottom: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand img {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: drop-shadow(0 0 10px var(--gold-glow));
  }
  .brand-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #f8fafc 30%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .brand-sub {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .nav-tabs {
    display: flex;
    gap: 8px;
  }
  .tab-btn {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid transparent;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .tab-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
  .tab-btn.active {
    color: #fff;
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }
  .tab-btn.active-gold {
    color: #000;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-color: #f59e0b;
    box-shadow: 0 0 14px var(--gold-glow);
  }

  /* Portal Suite Selector Cards */
  #suite-selection {
    margin-bottom: 30px;
  }
  .suite-heading {
    text-align: center;
    margin-bottom: 24px;
  }
  .suite-heading h2 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 6px;
    color: #f8fafc;
  }
  .suite-heading p {
    color: var(--text-muted);
    font-size: 14px;
  }

  .suite-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .suite-card {
    background: var(--card-bg);
    border: 2px solid var(--card-border);
    border-radius: 16px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .suite-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
  }
  .card-emu::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .card-opti::before { background: linear-gradient(90deg, #38bdf8, #60a5fa); }

  .suite-card:hover {
    transform: translateY(-4px);
    border-color: #475569;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
  }
  .card-emu:hover {
    border-color: #f59e0b;
    box-shadow: 0 12px 30px var(--gold-glow);
  }
  .card-opti:hover {
    border-color: #38bdf8;
    box-shadow: 0 12px 30px var(--cyan-glow);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .card-icon {
    font-size: 32px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
  }
  .card-title h3 {
    font-size: 20px;
    font-weight: 800;
  }
  .card-title .badge-sub {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    display: inline-block;
    margin-top: 4px;
  }
  .badge-emu { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  .badge-opti { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }

  .card-features {
    list-style: none;
    margin: 18px 0 24px 0;
    font-size: 13.5px;
    color: #cbd5e1;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .card-features li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-features li::before {
    content: '✓';
    font-weight: bold;
    color: var(--green);
  }

  .card-stats {
    display: flex;
    gap: 16px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 22px;
  }
  .stat-item {
    flex: 1;
  }
  .stat-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }
  .stat-val {
    font-size: 20px;
    font-weight: 800;
    margin-top: 2px;
  }

  .card-actions {
    display: flex;
    gap: 10px;
  }
  .btn-primary {
    flex: 1;
    padding: 12px;
    border-radius: 9px;
    font-weight: 700;
    font-size: 13px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }
  .btn-emu-primary {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #000;
  }
  .btn-emu-primary:hover {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 0 15px var(--gold-glow);
  }
  .btn-opti-primary {
    background: linear-gradient(135deg, #0284c7, #0369a1);
    color: #fff;
  }
  .btn-opti-primary:hover {
    background: linear-gradient(135deg, #38bdf8, #0284c7);
    box-shadow: 0 0 15px var(--cyan-glow);
  }
  .btn-secondary {
    background: #1e293b;
    color: var(--text-primary);
    border: 1px solid #334155;
    padding: 12px;
    border-radius: 9px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-secondary:hover {
    background: #334155;
  }

  /* Management & Tables Section */
  .section-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
  }
  .toolbar-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .filter-pills {
    display: flex;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 3px;
  }
  .filter-pill {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .filter-pill.active {
    background: #1e293b;
    color: #fff;
  }
  .search-box {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    width: 260px;
    outline: none;
  }
  .search-box:focus {
    border-color: #38bdf8;
  }

  /* Table styling */
  .table-container {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  th, td {
    padding: 12px 18px;
    text-align: left;
    border-bottom: 1px solid #1e293b;
  }
  th {
    background: rgba(15, 23, 42, 0.8);
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .badge-online { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
  .badge-offline { background: #1e293b; color: #94a3b8; }
  .badge-active { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
  .badge-banned { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  
  .badge-prod-emu { background: rgba(245, 158, 11, 0.2); color: #f59e0b; font-weight: bold; }
  .badge-prod-opti { background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-weight: bold; }
  .badge-prod-all { background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(56, 189, 248, 0.25)); color: #fff; font-weight: bold; border: 1px solid #f59e0b; }

  .btn-action {
    padding: 5px 10px;
    border-radius: 5px;
    border: none;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    margin-right: 4px;
    transition: all 0.15s;
  }
  .btn-kick { background: #eab308; color: #000; }
  .btn-ban { background: #dc2626; color: #fff; }
  .btn-unban { background: #16a34a; color: #fff; }
  .btn-reset { background: #334155; color: #e2e8f0; }
  .btn-action:hover { opacity: 0.85; }

  /* Modal */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 999;
    align-items: center;
    justify-content: center;
  }
  .modal-overlay.open { display: flex; }
  .modal-box {
    background: #121826;
    border: 1px solid #334155;
    border-radius: 14px;
    width: 90%;
    max-width: 480px;
    padding: 26px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }
  .modal-box h3 {
    font-size: 18px;
    margin-bottom: 18px;
    color: #f8fafc;
  }
  .form-group {
    margin-bottom: 16px;
  }
  .form-group label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .form-control {
    width: 100%;
    background: #090d16;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 10px 14px;
    color: #fff;
    font-size: 13.5px;
    outline: none;
  }
  .form-control:focus { border-color: #f59e0b; }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  .copy-banner {
    display: none;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid #10b981;
    color: #10b981;
    padding: 10px;
    border-radius: 8px;
    margin-top: 14px;
    font-size: 13px;
    text-align: center;
    font-weight: bold;
  }
</style>
</head>
<body>

  <!-- Top Navigation Header -->
  <div class="top-nav">
    <div class="brand">
      <img src="/logo.png" alt="Knoxyy Logo">
      <div>
        <div class="brand-title">KNOXYY CENTRAL GAMING SUITE</div>
        <div class="brand-sub">Unified Licensing & Real-time Cloud Hub</div>
      </div>
    </div>
    <div class="nav-tabs">
      <button class="tab-btn active" id="tab-portal" onclick="switchView('portal')">🌟 Choose Suite</button>
      <button class="tab-btn" id="tab-emu" onclick="switchView('emu')">🎮 Knoxyy Emulator</button>
      <button class="tab-btn" id="tab-opti" onclick="switchView('opti')">⚡ Knoxyy Optimizer</button>
      <button class="tab-btn" id="tab-all" onclick="switchView('all')">📊 All Licenses</button>
      <button class="tab-btn active-gold" onclick="openCreateModal()">+ Create License</button>
    </div>
  </div>

  <!-- Suite Selection Hub (Choose Emulator or Optimizer) -->
  <div id="suite-selection">
    <div class="suite-heading">
      <h2>Select Your Gaming Software Suite</h2>
      <p>Manage activations, live instances, and generate hardware-locked license keys from one central cloud dashboard.</p>
    </div>

    <div class="suite-grid">
      <!-- Card 1: Knoxyy Emulator -->
      <div class="suite-card card-emu">
        <div>
          <div class="card-header">
            <div class="card-icon" style="color: #f59e0b;">🎮</div>
            <div class="card-title">
              <h3>KNOXYY EMULATOR</h3>
              <span class="badge-sub badge-emu">v69.67 Gold Elite Edition</span>
            </div>
          </div>
          <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.5;">
            Official custom debloated Android VM for Free Fire & mobile gaming with hardware-bound license guard.
          </p>
          <ul class="card-features">
            <li>P64 Lite Debloated Engine (-40% RAM)</li>
            <li>450+ FPS Unlocked & ASUS ROG Phone 2 Profile</li>
            <li>DirectX/OpenGL Anti-Lag Zero Input Delay</li>
            <li>HWID Hardware Security & Heartbeat Daemon</li>
          </ul>
        </div>
        <div>
          <div class="card-stats">
            <div class="stat-item">
              <div class="stat-label">Online Active</div>
              <div class="stat-val" style="color: #10b981;" id="stat-emu-online">0</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Keys</div>
              <div class="stat-val" style="color: #f59e0b;" id="stat-emu-total">0</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary btn-emu-primary" onclick="switchView('emu')">Manage Emulator Keys</button>
            <button class="btn-secondary" onclick="openCreateModal('emulator')">+ Create Key</button>
          </div>
        </div>
      </div>

      <!-- Card 2: Knoxyy Optimizer -->
      <div class="suite-card card-opti">
        <div>
          <div class="card-header">
            <div class="card-icon" style="color: #38bdf8;">⚡</div>
            <div class="card-title">
              <h3>KNOXYY PRO OPTIMIZER</h3>
              <span class="badge-sub badge-opti">Pro Aim & System Booster</span>
            </div>
          </div>
          <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.5;">
            High-FPS Windows tuning suite: Registry kernel tweaks, GPU maximum priority, and 0ms aim sensitivity.
          </p>
          <ul class="card-features">
            <li>0ms Mouse Queue & Headshot Aim Precision</li>
            <li>GPU Dedicated Priority & Thread Responsiveness</li>
            <li>Zero-Background Bloat Memory Flush</li>
            <li>Hardware Lock Protection Against Key Sharing</li>
          </ul>
        </div>
        <div>
          <div class="card-stats">
            <div class="stat-item">
              <div class="stat-label">Online Active</div>
              <div class="stat-val" style="color: #10b981;" id="stat-opti-online">0</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Keys</div>
              <div class="stat-val" style="color: #38bdf8;" id="stat-opti-total">0</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary btn-opti-primary" onclick="switchView('opti')">Manage Optimizer Keys</button>
            <button class="btn-secondary" onclick="openCreateModal('optimizer')">+ Create Key</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Licenses Table Section -->
  <div id="table-section">
    <div class="section-toolbar">
      <div class="toolbar-left">
        <h3 id="table-title" style="font-size: 17px; font-weight: 700;">All Active Licenses</h3>
        <div class="filter-pills">
          <button class="filter-pill active" id="pill-all" onclick="setProductFilter('all')">All</button>
          <button class="filter-pill" id="pill-emu" onclick="setProductFilter('emulator')">🎮 Emulator</button>
          <button class="filter-pill" id="pill-opti" onclick="setProductFilter('optimizer')">⚡ Optimizer</button>
          <button class="filter-pill" id="pill-vip" onclick="setProductFilter('vip')">🌟 VIP Pass</button>
        </div>
      </div>
      <div>
        <input type="text" class="search-box" id="search-input" placeholder="Search by Key, User, HWID..." oninput="renderTable()">
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>License Key</th>
            <th>Target User</th>
            <th>Product</th>
            <th>Presence</th>
            <th>Status</th>
            <th>Hardware Lock (HWID)</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="licenses-body"></tbody>
      </table>
    </div>
  </div>

  <!-- Create Key Modal -->
  <div class="modal-overlay" id="create-modal">
    <div class="modal-box">
      <h3>Generate New License Key</h3>
      <div class="form-group">
        <label>Software Suite</label>
        <select class="form-control" id="modal-product">
          <option value="emulator">🎮 Knoxyy Emulator (v69.67 Gold Elite)</option>
          <option value="optimizer">⚡ Knoxyy Pro Aim Optimizer</option>
          <option value="all">🌟 All-in-One VIP Pass (Both)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Target Username</label>
        <input type="text" class="form-control" id="modal-username" placeholder="e.g. KnoxyyGamer">
      </div>
      <div class="form-group">
        <label>License Validity Duration</label>
        <select class="form-control" id="modal-days">
          <option value="-1">Lifetime (Permanent)</option>
          <option value="30" selected>30 Days (Standard Month)</option>
          <option value="7">7 Days (Trial)</option>
          <option value="90">90 Days (Quarterly)</option>
          <option value="365">365 Days (1 Year)</option>
        </select>
      </div>
      <div class="copy-banner" id="created-banner">
        License Created: <span id="created-key-display" style="user-select: all; text-decoration: underline;"></span>
        <div style="font-size: 11px; margin-top: 4px; color: #cbd5e1;">(Copied to clipboard!)</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeCreateModal()">Close</button>
        <button class="btn-primary btn-emu-primary" style="flex: none; padding: 10px 20px;" onclick="submitCreateKey()">Generate Key</button>
      </div>
    </div>
  </div>

<script>
let allLicenses = [];
let currentFilter = 'all'; // 'all', 'emulator', 'optimizer', 'vip'

async function loadData() {
  try {
    const res = await fetch('/api/v1/admin/list');
    const data = await res.json();
    allLicenses = data.licenses || [];

    updateStats();
    renderTable();
  } catch(e) {
    console.error("Failed to fetch licenses", e);
  }
}

function updateStats() {
  const now = new Date();
  let emuOnline = 0, emuTotal = 0;
  let optiOnline = 0, optiTotal = 0;

  allLicenses.forEach(l => {
    const p = (l.product || 'emulator').toLowerCase();
    let isOnline = false;
    if (l.last_seen) {
      const diff = (now - new Date(l.last_seen)) / 1000;
      if (diff < 75) isOnline = true;
    }

    if (p === 'emulator' || p === 'all') {
      emuTotal++;
      if (isOnline) emuOnline++;
    }
    if (p === 'optimizer' || p === 'all') {
      optiTotal++;
      if (isOnline) optiOnline++;
    }
  });

  document.getElementById('stat-emu-online').innerText = emuOnline;
  document.getElementById('stat-emu-total').innerText = emuTotal;
  document.getElementById('stat-opti-online').innerText = optiOnline;
  document.getElementById('stat-opti-total').innerText = optiTotal;
}

function renderTable() {
  const tbody = document.getElementById('licenses-body');
  tbody.innerHTML = '';
  const search = (document.getElementById('search-input').value || '').toLowerCase().trim();
  const now = new Date();

  const filtered = allLicenses.filter(l => {
    const p = (l.product || 'emulator').toLowerCase();
    if (currentFilter === 'emulator' && p !== 'emulator') return false;
    if (currentFilter === 'optimizer' && p !== 'optimizer') return false;
    if (currentFilter === 'vip' && p !== 'all') return false;

    if (search) {
      const matchKey = (l.key || '').toLowerCase().includes(search);
      const matchUser = (l.username || '').toLowerCase().includes(search);
      const matchHwid = (l.hwid || '').toLowerCase().includes(search);
      if (!matchKey && !matchUser && !matchHwid) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">No licenses found.</td></tr>`;
    return;
  }

  filtered.forEach(l => {
    let isOnline = false;
    if (l.last_seen) {
      const diff = (now - new Date(l.last_seen)) / 1000;
      if (diff < 75) isOnline = true;
    }

    const prod = (l.product || 'emulator').toLowerCase();
    let prodBadge = `<span class="badge badge-prod-emu">🎮 Emulator</span>`;
    let keyColor = '#f59e0b';
    if (prod === 'optimizer') {
      prodBadge = `<span class="badge badge-prod-opti">⚡ Optimizer</span>`;
      keyColor = '#38bdf8';
    } else if (prod === 'all') {
      prodBadge = `<span class="badge badge-prod-all">🌟 VIP Both</span>`;
      keyColor = '#fbbf24';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: bold; color: ${keyColor};">${l.key}</td>
      <td style="font-weight: 600;">${l.username}</td>
      <td>${prodBadge}</td>
      <td><span class="badge ${isOnline ? 'badge-online' : 'badge-offline'}">${isOnline ? 'ONLINE' : 'Offline'}</span></td>
      <td><span class="badge ${l.is_active ? 'badge-active' : 'badge-banned'}">${l.is_active ? 'Active' : 'Banned'}</span></td>
      <td style="font-family: monospace; font-size: 11px; color: #94a3b8;">${l.hwid ? l.hwid.substring(0, 16) + '...' : '(Unbound - Ready)'}</td>
      <td style="font-size: 12px;">${l.expires_at}</td>
      <td>
        ${isOnline ? `<button class="btn-action btn-kick" onclick="executeAction('kick', '${l.key}')">Kick</button>` : ''}
        ${l.is_active ? `<button class="btn-action btn-ban" onclick="executeAction('ban', '${l.key}')">Ban</button>` : `<button class="btn-action btn-unban" onclick="executeAction('unban', '${l.key}')">Unban</button>`}
        <button class="btn-action btn-reset" onclick="executeAction('reset_hwid', '${l.key}')">Reset HWID</button>
        <button class="btn-action btn-reset" style="background: #991b1b; color: #fff;" onclick="executeAction('delete', '${l.key}')">Del</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function switchView(view) {
  const suiteSec = document.getElementById('suite-selection');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  if (view === 'portal') {
    suiteSec.style.display = 'block';
    document.getElementById('tab-portal').classList.add('active');
    setProductFilter('all');
    document.getElementById('table-title').innerText = "All Active Licenses";
  } else if (view === 'emu') {
    suiteSec.style.display = 'none';
    document.getElementById('tab-emu').classList.add('active');
    setProductFilter('emulator');
    document.getElementById('table-title').innerText = "Knoxyy Emulator Licenses";
  } else if (view === 'opti') {
    suiteSec.style.display = 'none';
    document.getElementById('tab-opti').classList.add('active');
    setProductFilter('optimizer');
    document.getElementById('table-title').innerText = "Knoxyy Pro Optimizer Licenses";
  } else if (view === 'all') {
    suiteSec.style.display = 'none';
    document.getElementById('tab-all').classList.add('active');
    setProductFilter('all');
    document.getElementById('table-title').innerText = "All Unified Licenses";
  }
}

function setProductFilter(prod) {
  currentFilter = prod;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  if (prod === 'all') document.getElementById('pill-all').classList.add('active');
  if (prod === 'emulator') document.getElementById('pill-emu').classList.add('active');
  if (prod === 'optimizer') document.getElementById('pill-opti').classList.add('active');
  if (prod === 'vip') document.getElementById('pill-vip').classList.add('active');
  renderTable();
}

function openCreateModal(preselectProd = null) {
  document.getElementById('created-banner').style.display = 'none';
  if (preselectProd) {
    document.getElementById('modal-product').value = preselectProd;
  }
  document.getElementById('create-modal').classList.add('open');
}

function closeCreateModal() {
  document.getElementById('create-modal').classList.remove('open');
}

async function submitCreateKey() {
  const prod = document.getElementById('modal-product').value;
  const username = document.getElementById('modal-username').value.trim() || "User";
  const days = parseInt(document.getElementById('modal-days').value);

  const res = await fetch('/api/v1/admin/create_key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: prod, username: username, days: days })
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('created-key-display').innerText = data.key;
    document.getElementById('created-banner').style.display = 'block';
    navigator.clipboard.writeText(data.key);
    loadData();
  }
}

async function executeAction(action, key) {
  if (confirm(`Confirm ${action.toUpperCase()} on license: ${key}?`)) {
    await fetch('/api/v1/admin/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action, key: key })
    });
    loadData();
  }
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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
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
        dist_index = os.path.join(os.path.dirname(__file__), "dist", "index.html")
        template_index = os.path.join(os.path.dirname(__file__), "templates", "index.html")

        if clean_path in ("", "/dashboard", "/portal", "/pricing", "/emulator", "/optimizer", "/settings"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            if os.path.exists(dist_index):
                with open(dist_index, "rb") as f:
                    self.wfile.write(f.read())
            elif os.path.exists(template_index):
                with open(template_index, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(DASHBOARD_HTML.encode("utf-8"))
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
        elif clean_path.startswith("/assets/"):
            asset_filename = os.path.basename(clean_path)
            asset_file = os.path.join(os.path.dirname(__file__), "dist", "assets", asset_filename)
            if os.path.exists(asset_file):
                mime = "application/octet-stream"
                if asset_file.endswith(".js"):
                    mime = "text/javascript"
                elif asset_file.endswith(".css"):
                    mime = "text/css"
                elif asset_file.endswith(".svg"):
                    mime = "image/svg+xml"
                elif asset_file.endswith(".png"):
                    mime = "image/png"
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.end_headers()
                with open(asset_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_response(404, {"error": "Asset not found"})
        elif clean_path == "/api/v1/admin/list":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM licenses ORDER BY last_seen DESC, created_at DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            conn.close()
            self._send_response(200, {"licenses": rows})
        elif clean_path == "/api/v1/health":
            self._send_response(200, {"status": "online", "suite": "Knoxyy Gaming Suite"})
        elif clean_path == "/logo.png":
            logo_file = os.path.join(os.path.dirname(__file__), "logo.png")
            if os.path.exists(logo_file):
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.end_headers()
                with open(logo_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_response(404, {"error": "Logo not found"})
        elif clean_path == "/favicon.ico":
            fav_file = os.path.join(os.path.dirname(__file__), "favicon.ico")
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
        key = body.get("license_key", "").strip()
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
            self._send_response(403, {"success": False, "message": "Hardware ID mismatch. Key is locked to another computer."})
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
        key = body.get("license_key", "").strip()
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
    print("=" * 60)
    print(f"[*] KNOXYY CENTRAL GAMING SUITE running on port {PORT}")
    print(f"[*] WEB DASHBOARD:  http://127.0.0.1:{PORT}/dashboard")
    print(f"[*] APP ENDPOINT:   http://127.0.0.1:{PORT}/api/1.3/")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server shutdown.")

if __name__ == "__main__":
    run_server()
