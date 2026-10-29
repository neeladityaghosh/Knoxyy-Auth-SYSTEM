import React from 'react';
import { Compass, Cpu, Zap, CreditCard, RotateCw, Plus, SlidersHorizontal } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Sidebar({ currentView, setView, onOpenCreate, onRefresh, isRefreshing, accentColor = '#a855f7' }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'emulator', label: 'Knoxyy Emulator (Black Edition)', icon: Cpu },
    { id: 'optimizer', label: 'Knoxyy Optimizer', icon: Zap },
    { id: 'pricing', label: 'Store & Pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings & Theme', icon: SlidersHorizontal }
  ];

  return (
    <aside style={{
      width: '78px',
      background: 'rgba(7, 7, 12, 0.92)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0 20px 0',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 100,
      gap: '12px',
    }}>
      {/* Top Logo */}
      <div 
        onClick={() => { playSound('click'); setView('landing'); }}
        onMouseEnter={() => playSound('hover')}
        title="Knoxyy Home"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: '14px',
          padding: '4px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src="/logo.png" 
          alt="Knoxyy Logo" 
          className="gothic-crest-glow"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain'
          }} 
        />
      </div>

      {/* Main Navigation Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        alignItems: 'center',
        flex: 1
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => { playSound('click'); setView(item.id); }}
              onMouseEnter={() => playSound('hover')}
              title={item.label}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: isActive ? 'rgba(139, 92, 246, 0.16)' : 'transparent',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid transparent',
                color: isActive ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 2px 14px rgba(139, 92, 246, 0.25)' : 'none',
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <Icon size={20} color={isActive ? '#a78bfa' : '#94a3b8'} />
            </button>
          );
        })}
      </div>

      {/* Bottom Actions: Refresh */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}>
        <button
          onClick={() => { playSound('click'); onRefresh(); }}
          onMouseEnter={() => playSound('hover')}
          title="Refresh Data & Metrics"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'transparent',
            border: '1px solid transparent',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <RotateCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </aside>
  );
}