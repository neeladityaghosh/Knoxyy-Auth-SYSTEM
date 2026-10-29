import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Volume2, VolumeX } from 'lucide-react';
import { playSound, isAudioEnabled, toggleAudio } from '../utils/audio';

export default function TopHeader({ currentView, onOpenCreate, onOpenSelector, accentColor = '#a855f7' }) {
  const [soundOn, setSoundOn] = useState(() => isAudioEnabled());

  const titles = {
    landing: 'Knoxyy Overview',
    dashboard: 'Control Console',
    emulator: 'Knoxyy Emulator Console (Black Edition)',
    optimizer: 'Knoxyy Optimizer Hub',
    pricing: 'Knoxyy Store & Packs',
    settings: 'Portal Settings'
  };

  const isHubView = currentView === 'emulator' || currentView === 'optimizer';

  const handleToggleSound = () => {
    const newState = toggleAudio();
    setSoundOn(newState);
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '20px',
      marginBottom: '26px',
      borderBottom: '1px solid var(--border-subtle)',
      width: '100%'
    }}>
      {/* Title & Hub Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
          {titles[currentView] || 'Knoxyy Portal'}
        </h2>

        {isHubView && (
          <button
            onClick={() => { playSound('click'); onOpenSelector(); }}
            onMouseEnter={() => playSound('hover')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <ArrowLeftRight size={13} />
            <span>Switch Hub</span>
          </button>
        )}
      </div>

      {/* Actions (Sound toggle + Generate Key) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handleToggleSound}
          title={soundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: soundOn ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: soundOn ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-subtle)',
            color: soundOn ? '#a78bfa' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            playSound('hover');
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1.0)';
          }}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button
          onClick={() => { playSound('click'); onOpenCreate(); }}
          onMouseEnter={() => playSound('hover')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            color: '#050508',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 255, 255, 0.15)';
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Generate Key</span>
        </button>
      </div>
    </header>
  );
}