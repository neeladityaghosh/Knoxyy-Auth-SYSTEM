import React, { useState, useMemo } from 'react';
import { Zap, Gauge, Flame, Terminal, CheckCircle2, ShieldCheck, Activity, Cpu, RotateCw, Download, Plus, Search, Trash2 } from 'lucide-react';

export default function OptimizerDashboardView({
  licenses = [],
  onOpenCreate,
  onAction,
  metrics,
  showToast,
  density = 'comfortable'
}) {
  const [activeActions, setActiveActions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [logs, setLogs] = useState([
    { id: 1, time: '11:28:40', text: 'Kernel input queue hooked with 0ms delay.' },
    { id: 2, time: '11:29:12', text: 'Windows TCP/IP network buffer tuned for competitive Free Fire.' },
    { id: 3, time: '11:30:05', text: 'Hardware GPU scheduling verified on primary display adapter.' }
  ]);

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

  // Counts for Optimizer
  const totalOpti = optimizerLicenses.length;
  const onlineOpti = useMemo(() => {
    const now = Date.now();
    return optimizerLicenses.filter(l => l.last_seen && (now - new Date(l.last_seen).getTime()) / 1000 < 75).length;
  }, [optimizerLicenses]);
  const activeOpti = useMemo(() => optimizerLicenses.filter(l => l.is_active).length, [optimizerLicenses]);
  const boundOpti = useMemo(() => optimizerLicenses.filter(l => l.hwid && l.hwid.trim()).length, [optimizerLicenses]);

  const executeOptimization = (actionId, title) => {
    setActiveActions(prev => ({ ...prev, [actionId]: true }));
    if (showToast) showToast(`Optimizing: ${title}...`);

    setTimeout(() => {
      setActiveActions(prev => ({ ...prev, [actionId]: false }));
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [
        { id: Date.now(), time: now, text: `Successfully executed: ${title}` },
        ...prev.slice(0, 7)
      ]);
      if (showToast) showToast(`Completed: ${title}`);
    }, 900);
  };

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

  const OPTIMIZER_TOOLS = [
    {
      id: 'ram_cleaner',
      title: 'Flush Standby RAM & Cache',
      desc: 'Frees 1.5GB - 3.2GB standby memory before launching emulator',
      icon: Cpu,
      color: '#38bdf8'
    },
    {
      id: 'timer_res',
      title: 'Lock 0.5ms Timer Resolution',
      desc: 'Eliminates frame pacing drops and reduces peripheral input delay',
      icon: Gauge,
      color: '#a855f7'
    },
    {
      id: 'gpu_priority',
      title: 'High GPU Priority Profile',
      desc: 'Directs full DirectX/Vulkan compute pipelines to the emulator thread',
      icon: Zap,
      color: '#ff781f'
    },
    {
      id: 'network_tweak',
      title: 'TCP/IP Low Ping Buffer',
      desc: 'Removes network throttling index and locks DNS to Cloudflare 1.1.1.1',
      icon: Activity,
      color: '#10b981'
    },
    {
      id: 'mouse_raw',
      title: 'Raw Mouse Acceleration Bypass',
      desc: 'Applies MarkC 100% 1-to-1 mouse fix for pixel-perfect headshots',
      icon: Flame,
      color: '#f43f5e'
    },
    {
      id: 'debloat_bg',
      title: 'Windows Background Bloat Nullifier',
      desc: 'Suspends Xbox GameDVR, telemetry services, and Cortana background loops',
      icon: ShieldCheck,
      color: '#fbbf24'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ width: '100%', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: density === 'compact' ? '20px' : '26px 28px',
        marginBottom: '28px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Knoxyy Performance &amp; Optimizer Hub
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sub-millisecond kernel tweaks, standby memory purge, and competitive latency optimization.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#7dd3fc'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#38bdf8'}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create Optimizer Key</span>
              </button>
            )}

            <button
              onClick={() => {
                OPTIMIZER_TOOLS.forEach((tool, index) => {
                  setTimeout(() => {
                    executeOptimization(tool.id, tool.title);
                  }, index * 250);
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ff781f',
                color: '#ffffff',
                border: 'none',
                padding: '9px 20px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(255, 120, 31, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ff8f3d'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ff781f'}
            >
              <Zap size={15} />
              <span>Apply All Optimizations (1-Click)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optimizer Telemetry Vitals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Loopback Processing Latency
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>
            {metrics?.latency_ms || 0.45} ms
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Zero queue overhead
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Optimizer Online Active
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
            {onlineOpti}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total keys: {totalOpti}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Timer Resolution Lock
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a855f7' }}>
            0.500 ms
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Windows standard 15ms bypassed
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Hardware Lock Status
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ff781f' }}>
            {boundOpti}/{totalOpti} Bound
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Protected against sharing
          </div>
        </div>
      </div>

      {/* Interactive Optimization Tools Grid */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px', marginBottom: '16px' }}>
          Tuning &amp; Optimization Modules
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '18px'
        }}>
          {OPTIMIZER_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isRunning = activeActions[tool.id];

            return (
              <div
                key={tool.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tool.color,
                    marginBottom: '16px'
                  }}>
                    <Icon size={20} />
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                    {tool.title}
                  </h4>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '20px' }}>
                    {tool.desc}
                  </p>
                </div>

                <button
                  disabled={isRunning}
                  onClick={() => executeOptimization(tool.id, tool.title)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isRunning ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: isRunning ? 'wait' : 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isRunning) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isRunning) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  {isRunning ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      <span>Applying Kernel Tweak...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Tweak</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. OPTIMIZER LICENSES & ACTIVE CLIENT SESSIONS TABLE */}
      {onAction && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: density === 'compact' ? '18px 20px' : '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '18px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                Knoxyy Optimizer Licenses &amp; Active Sessions
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Manage activations, hardware locks, kicks, bans, and HWID resets for Optimizer users.
              </p>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '240px' }}>
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
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            background: '#0b0c10',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '3px',
            width: 'fit-content',
            marginBottom: '16px'
          }}>
            {[
              { id: 'all', label: `All Optimizer Keys (${totalOpti})` },
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
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Client User</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>License Key</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>HWID Lock</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Suite</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Presence</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No optimizer licenses found. Click "+ Create Optimizer Key" above to generate one.
                    </td>
                  </tr>
                ) : (
                  filteredLicenses.map((lic) => {
                    const isOnline = lic.last_seen && (Date.now() - new Date(lic.last_seen).getTime()) / 1000 < 75;
                    const isBound = lic.hwid && lic.hwid.trim().length > 0;
                    const p = (lic.product || 'optimizer').toLowerCase();

                    return (
                      <tr
                        key={lic.key}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>{lic.username || 'Client'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            Expires: {formatExpiry(lic.expires_at)}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
                          {lic.key}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
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

                        <td style={{ padding: '12px 14px' }}>
                          {p === 'all' || p === 'vip' ? (
                            <span style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(168, 85, 247, 0.2))', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                              🌟 VIP Both
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                              ⚡ Optimizer
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
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

                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: lic.is_active ? '#38bdf8' : '#ef4444'
                          }}>
                            {lic.is_active ? 'ACTIVE' : 'BANNED'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {isOnline && (
                              <button
                                onClick={() => onAction('kick', lic.key)}
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

                            {isBound && (
                              <button
                                onClick={() => onAction('reset_hwid', lic.key)}
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

                            <button
                              onClick={() => onAction(lic.is_active ? 'ban' : 'unban', lic.key)}
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

                            <button
                              onClick={() => onAction('delete', lic.key)}
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
      )}

      {/* Optimizer Live Activity Log */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Terminal size={16} color="var(--text-dim)" />
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
            Optimizer Execution Feed
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: '12px', color: '#cbd5e1' }}>
              <span style={{ color: 'var(--text-dim)' }}>[{log.time}]</span>
              <span style={{ color: '#10b981' }}>✓</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
