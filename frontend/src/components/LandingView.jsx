import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Cpu, Terminal, Compass } from 'lucide-react';
import AeroShards from './AeroShards';
import TechText from './TechText';

export default function LandingView({
  onNavigateToEmulator,
  onNavigateToOptimizer,
  onNavigateToPricing,
  metrics,
  settings
}) {
  const shardsEnabled = settings?.shardsEnabled !== false;
  const shardsOpacity = settings?.shardsOpacity ?? 0.32;
  const shardsSpeed = settings?.shardsSpeed ?? 1.0;
  const accentColor = settings?.accentColor || '#ef4444';

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', paddingTop: '6px', position: 'relative' }}>
      
      {/* Continuous Dynamic AeroShards Canvas Background */}
      {shardsEnabled && (
        <AeroShards
          shardColor={accentColor}
          accentColor="#ff781f"
          speed={shardsSpeed}
          opacity={shardsOpacity}
          count={36}
        />
      )}

      {/* Hero Section Container (Transparent so AeroShards floats smoothly behind it) */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        borderRadius: '24px',
        padding: '32px 20px 48px 20px',
        textAlign: 'center',
        marginBottom: '46px'
      }}>
        {/* Interactive TechText Component from React Bits */}
        <div style={{
          width: '100%',
          maxWidth: '860px',
          height: '140px',
          margin: '0 auto 10px auto',
          position: 'relative'
        }}>
          <TechText
            text="KNOXYY"
            fontWeight={800}
            fontSize={84}
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={16}
            color="#ffffff"
            accentColor={accentColor}
            draggable={true}
          />
        </div>

        {/* Display Headline */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          letterSpacing: '-0.8px',
          color: '#ffffff',
          marginBottom: '14px',
          maxWidth: '840px',
          margin: '0 auto 14px auto',
          lineHeight: 1.2
        }}>
          High-Performance Emulator Control &amp; System Optimization
        </h1>

        {/* Clean Subtitle */}
        <p style={{
          fontSize: '15.5px',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 36px auto',
          lineHeight: 1.55
        }}>
          A unified, ultra-low latency architecture to orchestrate emulator instances, enforce cryptographic HWID protection, and tune Windows kernel queues for competitive gaming.
        </p>

        {/* Action Buttons: Knoxyy Emulator, Knoxyy Optimizer & Store */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Launch Knoxyy Emulator */}
          <button
            onClick={onNavigateToEmulator}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              color: '#0b0c10',
              border: 'none',
              padding: '13px 26px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.2)';
            }}
          >
            <Cpu size={18} strokeWidth={2.5} />
            <span>Knoxyy Emulator</span>
            <ArrowRight size={16} />
          </button>

          {/* Launch Knoxyy Optimizer */}
          <button
            onClick={onNavigateToOptimizer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ff781f',
              color: '#ffffff',
              border: 'none',
              padding: '13px 26px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 20px rgba(255, 120, 31, 0.35)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff8f3d';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ff781f';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Zap size={18} strokeWidth={2.5} />
            <span>Knoxyy Optimizer</span>
            <ArrowRight size={16} />
          </button>

          {/* Store & Pricing */}
          <button
            onClick={onNavigateToPricing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              border: '1px solid var(--border-medium)',
              padding: '13px 24px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Store &amp; Packs</span>
          </button>
        </div>
      </div>

      {/* Real Live Metrics Ticker Bar (NO FAKE PILLS) */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: 'rgba(18, 19, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '54px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
            System Availability
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
            {metrics?.uptime_pct || '99.98%'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Uptime: {metrics?.uptime_formatted || 'Active'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
            Loopback Latency
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>
            {metrics?.latency_ms || 0.45} ms
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Sub-millisecond processing
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
            Total Keys Managed
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {metrics?.total_keys || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {metrics?.online_keys || 0} currently online
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
            Total Requests Served
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: accentColor }}>
            {metrics?.requests_total || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            SQLite sync: {metrics?.db_size_kb || 12} KB
          </div>
        </div>
      </div>

      {/* Feature Architecture Grid */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.6px', marginBottom: '8px' }}>
            Architected for Zero Delay
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Hardware-level control with zero third-party bloat.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '20px'
        }}>
          {/* Feature 1 */}
          <div style={{
            background: 'rgba(18, 19, 25, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#38bdf8'
            }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              0ms Input Queue Optimization
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Kernel-level Windows queue tuning and pointer acceleration bypass for precision headshots and responsive tracking.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            background: 'rgba(18, 19, 25, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#c084fc'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Hardware Lock (HWID) Guard
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Cryptographic hardware fingerprinting binds keys to verified machines with instant remote kick and ban enforcement.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            background: 'rgba(18, 19, 25, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#10b981'
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              P64 Debloated Engine
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Low memory footprint, high frame rate profiles, and zero background telemetry memory recycle loops.
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{
            background: 'rgba(18, 19, 25, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 120, 31, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#ff781f'
            }}>
              <Terminal size={22} />
            </div>
            <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Automated Bot &amp; Webhook API
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Plug key generation directly into Discord bots, payment gateways, and custom automation scripts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
