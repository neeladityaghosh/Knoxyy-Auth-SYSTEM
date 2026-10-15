import React, { useState, useMemo } from 'react';
import { Search, Plus, ShieldCheck, Activity, Zap, Server, Check, Radio, UserX, KeyRound, ShieldAlert, Trash2 } from 'lucide-react';

export default function OptimizerDashboardView({
  licenses = [],
  onOpenCreate,
  onAction,
  metrics,
  showToast,
  density = 'comfortable'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter licenses specifically for Knoxyy Optimizer + All/VIP
  const optimizerLicenses = useMemo(() => {
    return licenses.filter(lic => {
      const p = (lic.product || 'emulator').toLowerCase();
      return p === 'optimizer' || p === 'all' || p === 'vip';
    });
  }, [licenses]);

  const filteredLicenses = useMemo(() => {
    return optimizerLicenses.filter(lic => {
      const isOnline = lic.last_seen && (Date.now() - new Date(lic.last_seen).getTime()) / 1000 < 75;
      const prod = (lic.product || 'optimizer').toLowerCase();

      if (activeFilter === 'optimizer' && prod !== 'optimizer') return false;
      if (activeFilter === 'vip' && prod !== 'all') return false;
      if (activeFilter === 'online' && !isOnline) return false;
      if (activeFilter === 'banned' && lic.is_active) return false;
      if (activeFilter === 'unbound' && lic.hwid) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const mKey = (lic.key || '').toLowerCase().includes(q);
        const mUser = (lic.username || '').toLowerCase().includes(q);
        const mHwid = (lic.hwid || '').toLowerCase().includes(q);
        if (!mKey && !mUser && !mHwid) return false;
      }
      return true;
    });
  }, [optimizerLicenses, activeFilter, searchTerm]);

  // Real Counts for Optimizer
  const totalOpti = optimizerLicenses.length;
  const onlineOpti = useMemo(() => {
    const now = Date.now();
    return optimizerLicenses.filter(l => l.last_seen && (now - new Date(l.last_seen).getTime()) / 1000 < 75).length;
  }, [optimizerLicenses]);
  const activeOpti = useMemo(() => optimizerLicenses.filter(l => l.is_active).length, [optimizerLicenses]);
  const boundOpti = useMemo(() => optimizerLicenses.filter(l => l.hwid && l.hwid.trim()).length, [optimizerLicenses]);
  const boundPercent = totalOpti > 0 ? Math.round((boundOpti / totalOpti) * 100) : 100;

  // Format Expiration safely (handles LIFETIME, ISO strings, etc.)
  const formatExpiry = (exp) => {
    if (!exp) return 'Never';
    if (exp === 'LIFETIME' || exp.toUpperCase() === 'LIFETIME') return 'LIFETIME';
    try {
      const d = new Date(exp);
      return isNaN(d.getTime()) ? exp : d.toLocaleDateString();
    } catch {
      return exp;
    }
  };

  // Render product badge
  const renderProductBadge = (prod) => {
    const p = (prod || 'optimizer').toLowerCase();
    if (p === 'all' || p === 'vip') {
      return (
        <span style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(168, 85, 247, 0.18))',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700
        }}>
          🌟 VIP Both
        </span>
      );
    }
    return (
      <span style={{
        background: 'rgba(56, 189, 248, 0.12)',
        color: '#38bdf8',
        border: '1px solid rgba(56, 189, 248, 0.28)',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700
      }}>
        ⚡ Optimizer
      </span>
    );
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* 1. TOP SECTION: DASHBOARD MANAGEMENT TABLE */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: density === 'compact' ? '18px 20px' : '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Table Header & Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Knoxyy Optimizer Instances &amp; Licenses
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time hardware lock monitoring, remote session kicks, and instant ban enforcement for Knoxyy Optimizer.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onOpenCreate && (
              <button
                onClick={() => onOpenCreate('optimizer', 30)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#38bdf8',
                  color: '#070b14',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#7dd3fc'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#38bdf8'}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create Optimizer License</span>
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Filter Buttons & Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {/* Segmented Filter Buttons */}
          <div style={{
            display: 'flex',
            background: '#0b0c10',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '3px',
            flexWrap: 'wrap',
            gap: '2px'
          }}>
            {[
              { id: 'all', label: `All (${totalOpti})` },
              { id: 'optimizer', label: '⚡ Optimizer' },
              { id: 'vip', label: '🌟 VIP Both' },
              { id: 'online', label: `Online (${onlineOpti})` },
              { id: 'unbound', label: `Unbound (${totalOpti - boundOpti})` },
              { id: 'banned', label: `Banned (${totalOpti - activeOpti})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  background: activeFilter === f.id ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: 'none',
                  color: activeFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: activeFilter === f.id ? 700 : 500,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            width: '240px'
          }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search optimizer keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 12px 8px 34px',
                color: '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Client User</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>License Key</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Hardware Lock (HWID)</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Product Suite</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Session Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>State</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No optimizer instances or keys matching the criteria. Click "+ Create Optimizer License" to generate one.
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((lic) => {
                  const isOnline = lic.last_seen && (Date.now() - new Date(lic.last_seen).getTime()) / 1000 < 75;
                  const isBound = lic.hwid && lic.hwid.trim().length > 0;
                  const rowPadding = density === 'compact' ? '8px 14px' : '14px 14px';

                  return (
                    <tr
                      key={lic.key}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* User */}
                      <td style={{ padding: rowPadding }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{lic.username || 'Client'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Expires: {formatExpiry(lic.expires_at)}
                        </div>
                      </td>

                      {/* Key */}
                      <td style={{ padding: rowPadding, fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
                        {lic.key}
                      </td>

                      {/* HWID */}
                      <td style={{ padding: rowPadding }}>
                        {isBound ? (
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {lic.hwid.substring(0, 16)}...
                          </span>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>Unbound (Ready)</span>
                        )}
                      </td>

                      {/* Product */}
                      <td style={{ padding: rowPadding }}>
                        {renderProductBadge(lic.product)}
                      </td>

                      {/* Online Status */}
                      <td style={{ padding: rowPadding }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isOnline ? '#10b981' : '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: isOnline ? '#10b981' : '#64748b',
                            boxShadow: isOnline ? '0 0 6px #10b981' : 'none'
                          }} />
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>

                      {/* State (Active / Banned) */}
                      <td style={{ padding: rowPadding }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: lic.is_active ? '#38bdf8' : '#ef4444'
                        }}>
                          {lic.is_active ? 'ACTIVE' : 'BANNED'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: rowPadding, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {isOnline && onAction && (
                            <button
                              onClick={() => onAction('kick', lic.key)}
                              title="Remote Kick Client"
                              style={{
                                background: 'rgba(234, 179, 8, 0.14)',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                color: '#fde047',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Kick
                            </button>
                          )}

                          {isBound && onAction && (
                            <button
                              onClick={() => onAction('reset_hwid', lic.key)}
                              title="Reset HWID Hardware Lock"
                              style={{
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                color: '#38bdf8',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Reset HWID
                            </button>
                          )}

                          {onAction && (
                            <button
                              onClick={() => onAction(lic.is_active ? 'ban' : 'unban', lic.key)}
                              title={lic.is_active ? 'Ban Key' : 'Unban Key'}
                              style={{
                                background: lic.is_active ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid var(--border-subtle)',
                                color: lic.is_active ? '#94a3b8' : '#10b981',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {lic.is_active ? 'Ban' : 'Unban'}
                            </button>
                          )}

                          {onAction && (
                            <button
                              onClick={() => onAction('delete', lic.key)}
                              title="Delete License Key"
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.22)',
                                color: '#f87171',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Del
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. REAL METRICS TELEMETRY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Metric 1 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
            SYSTEM AVAILABILITY &amp; UPTIME
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981', letterSpacing: '-0.8px', lineHeight: 1 }}>
            {metrics?.uptime_pct || '99.98%'}
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', marginTop: '14px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#10b981', width: '99.98%' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Live Duration: <span style={{ color: '#ffffff', fontWeight: 600 }}>{metrics?.uptime_formatted || 'Active'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
            OPTIMIZER ONLINE SESSIONS
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.8px', lineHeight: 1 }}>
            {onlineOpti} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>active</span>
          </div>
          <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginTop: '14px' }}>
            {totalOpti} total registered optimizer keys
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Active clients connected via heartbeat
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
            HARDWARE INTEGRITY &amp; LOCKS
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#ff781f', letterSpacing: '-0.8px', lineHeight: 1 }}>
            {boundPercent}% <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Bound</span>
          </div>
          <div style={{ fontSize: '13px', color: '#ff781f', fontWeight: 600, marginTop: '14px' }}>
            {boundOpti} of {totalOpti} keys locked to unique HWID
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Protected against key sharing &amp; leaks
          </div>
        </div>
      </div>
    </div>
  );
}
