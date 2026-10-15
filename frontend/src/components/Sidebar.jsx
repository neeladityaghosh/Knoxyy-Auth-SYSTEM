import React from 'react';
import { Compass, Cpu, Zap, CreditCard, RotateCw, Plus, SlidersHorizontal, Layers } from 'lucide-react';

export default function Sidebar({ currentView, setView, onOpenCreate, onRefresh, isRefreshing, accentColor = '#a855f7' }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'emulator', label: 'Knoxyy Emulator', icon: Cpu },
    { id: 'optimizer', label: 'Knoxyy Optimizer', icon: Zap },
    { id: 'pricing', label: 'Store & Pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings & Theme', icon: SlidersHorizontal }
  ];

  return (
    <aside style={{
      width: '78px',
      background: '#0d0e14',
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
        onClick={() => setView('landing')}
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
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src="/logo.png" 
          alt="Knoxyy Logo" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(124, 58, 237, 0.45))'
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
              onClick={() => setView(item.id)}
              title={item.label}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: isActive ? `1px solid ${accentColor}80` : '1px solid transparent',
                color: isActive ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 2px 10px rgba(0, 0, 0, 0.4)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <Icon size={20} color={isActive ? accentColor : '#94a3b8'} />
            </button>
          );
        })}
      </div>

      {/* Bottom Actions: Refresh & Quick Create (Clean, no pills or dots) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}>
        <button
          onClick={onRefresh}
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
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <RotateCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => onOpenCreate()}
          title="Create License Key"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `${accentColor}20`,
            border: `1px solid ${accentColor}50`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${accentColor}35`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${accentColor}20`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
}
