import React from 'react';
import { Palette, Sparkles, Layout, RefreshCw, Sliders, Check, RotateCcw, Server } from 'lucide-react';

const ACCENT_COLORS = [
  { id: 'purple', name: 'Royal Purple', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)' },
  { id: 'amber', name: 'Knoxyy Orange', hex: '#ff781f', glow: 'rgba(255, 120, 31, 0.4)' },
  { id: 'cyan', name: 'Electric Cyan', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  { id: 'emerald', name: 'Emerald Green', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'rose', name: 'Crimson Rose', hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
  { id: 'gold', name: 'Sunset Gold', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }
];

export default function SettingsView({ settings, onUpdateSettings, onResetSettings, showToast }) {
  const currentAccent = settings?.accentColor || '#ef4444';
  const shardsEnabled = settings?.shardsEnabled !== false;
  const shardsOpacity = settings?.shardsOpacity ?? 0.32;
  const shardsSpeed = settings?.shardsSpeed ?? 1;
  const density = settings?.density || 'comfortable';
  const defaultHub = settings?.defaultHub || 'ask';

  const handleSelectAccent = (color) => {
    onUpdateSettings({ accentColor: color.hex, accentGlow: color.glow });
    document.documentElement.style.setProperty('--purple-primary', color.hex);
    document.documentElement.style.setProperty('--border-glow-purple', color.glow);
    showToast(`Accent color updated: ${color.name}`);
  };

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '920px',
      margin: '0 auto',
      width: '100%',
      paddingTop: '8px',
      paddingBottom: '60px'
    }}>
      {/* Settings Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px', marginBottom: '8px' }}>
          Portal Settings &amp; Customization
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)' }}>
          Personalize your Knoxyy management experience, visual theme, background animation, and layout preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: Accent Color */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentAccent
            }}>
              <Palette size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>System Accent Color</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Sets the global primary highlights, button glows, and interactive focus states.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            {ACCENT_COLORS.map((c) => {
              const isSelected = currentAccent.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectAccent(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? `2px solid ${c.hex}` : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: c.hex,
                    boxShadow: `0 0 10px ${c.hex}`,
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#ffffff' : '#cbd5e1'
                  }}>
                    {c.name}
                  </span>
                  {isSelected && <Check size={14} color={c.hex} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: AeroShards Dynamic Background */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentAccent
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>AeroShards Background Animation</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Continuous 60 FPS geometric floating shards with pointer reactivity and translucent rendering.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Toggle Shards */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Enable Background Shards</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Animate translucent floating geometric shards</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ shardsEnabled: !shardsEnabled })}
                style={{
                  width: '48px',
                  height: '26px',
                  borderRadius: '13px',
                  background: shardsEnabled ? currentAccent : '#272733',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: shardsEnabled ? '25px' : '3px',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </button>
            </div>

            {/* Opacity Slider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Shards Transparency / Opacity</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Controls visual subtleness behind foreground text ({Math.round(shardsOpacity * 100)}%)</div>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.65"
                step="0.05"
                value={shardsOpacity}
                disabled={!shardsEnabled}
                onChange={(e) => onUpdateSettings({ shardsOpacity: parseFloat(e.target.value) })}
                style={{ width: '160px', accentColor: currentAccent, cursor: 'pointer' }}
              />
            </div>

            {/* Speed Control */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Animation Speed</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Natural drift and rotation velocity</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Slow', val: 0.5 },
                  { label: 'Normal', val: 1.0 },
                  { label: 'Fast', val: 1.6 }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => onUpdateSettings({ shardsSpeed: s.val })}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: shardsSpeed === s.val ? 700 : 500,
                      background: shardsSpeed === s.val ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: shardsSpeed === s.val ? '#ffffff' : '#94a3b8',
                      border: shardsSpeed === s.val ? `1px solid ${currentAccent}` : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Layout & Hub Preferences */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentAccent
            }}>
              <Layout size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>Layout &amp; Dashboard Defaults</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Configure table density and default landing destination.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Density */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Display Density</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Spacious comfortable layout or compact data rows</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onUpdateSettings({ density: 'comfortable' })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: density === 'comfortable' ? 700 : 500,
                    background: density === 'comfortable' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: density === 'comfortable' ? '#ffffff' : '#94a3b8',
                    border: density === 'comfortable' ? `1px solid ${currentAccent}` : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  Comfortable
                </button>
                <button
                  onClick={() => onUpdateSettings({ density: 'compact' })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: density === 'compact' ? 700 : 500,
                    background: density === 'compact' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: density === 'compact' ? '#ffffff' : '#94a3b8',
                    border: density === 'compact' ? `1px solid ${currentAccent}` : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Default Hub */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Dashboard Hub Entry</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Behavior when opening the Dashboard section</div>
              </div>
              <select
                value={defaultHub}
                onChange={(e) => onUpdateSettings({ defaultHub: e.target.value })}
                style={{
                  background: '#0d0e14',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '13px',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ask">Show Choice Popup</option>
                <option value="emulator">Direct to Knoxyy Emulator</option>
                <option value="optimizer">Direct to Knoxyy Optimizer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Factory Reset */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset all portal settings to default values?')) {
                onResetSettings();
                showToast('Settings reset to defaults');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <RotateCcw size={15} />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>

      </div>
    </div>
  );
}
