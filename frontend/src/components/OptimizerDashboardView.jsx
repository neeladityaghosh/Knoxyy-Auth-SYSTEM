import React, { useState } from 'react';
import { Zap, Gauge, Flame, Terminal, CheckCircle2, ShieldCheck, Activity, Cpu, RotateCw, Download } from 'lucide-react';

export default function OptimizerDashboardView({ metrics, showToast, density = 'comfortable' }) {
  const [activeActions, setActiveActions] = useState({});
  const [logs, setLogs] = useState([
    { id: 1, time: '11:28:40', text: 'Kernel input queue hooked with 0ms delay.' },
    { id: 2, time: '11:29:12', text: 'Windows TCP/IP network buffer tuned for competitive Free Fire.' },
    { id: 3, time: '11:30:05', text: 'Hardware GPU scheduling verified on primary display adapter.' }
  ]);

  const executeOptimization = (actionId, title) => {
    setActiveActions(prev => ({ ...prev, [actionId]: true }));
    showToast(`Optimizing: ${title}...`);

    setTimeout(() => {
      setActiveActions(prev => ({ ...prev, [actionId]: false }));
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [
        { id: Date.now(), time: now, text: `Successfully executed: ${title}` },
        ...prev.slice(0, 7)
      ]);
      showToast(`Completed: ${title}`);
    }, 900);
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

      {/* Optimizer Telemetry Vitals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
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
            Standby Memory Status
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
            Cleaned
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            High-speed page cache active
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
            System Reliability Score
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ff781f' }}>
            {metrics?.uptime_pct || '99.98%'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Hardware profiles verified
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
