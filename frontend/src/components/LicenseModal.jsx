import { playSound } from '../utils/audio';
import React, { useState, useEffect } from 'react';
import { X, Check, Key, Shield, Sparkles, Copy } from 'lucide-react';

export default function LicenseModal({
  isOpen,
  onClose,
  initialProductOrTier = 'emulator',
  initialDays = 30,
  initialPack = '',
  onCreated,
  showToast
}) {
  const [product, setProduct] = useState('emulator');
  const [pack, setPack] = useState('');
  const [username, setUsername] = useState('KnoxyyVIP');
  const [days, setDays] = useState('30');
  const [createdKey, setCreatedKey] = useState('');
  const [createdProduct, setCreatedProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Determine initial product
    const pt = (initialProductOrTier || 'emulator').toLowerCase();
    if (pt === 'optimizer' || pt.includes('opti') || pt.includes('sensi') || pt.includes('bat') || pt.includes('debloat') || pt.includes('reg') || pt.includes('tweak')) {
      setProduct('optimizer');
    } else if (pt === 'all' || pt.includes('bundle') || pt.includes('vip')) {
      setProduct('all');
    } else {
      setProduct('emulator');
    }

    if (initialDays !== undefined && initialDays !== null) {
      setDays(String(initialDays));
    }
    if (initialPack) {
      setPack(initialPack);
    }
    setCreatedKey('');
    setCreatedProduct('');
  }, [isOpen, initialProductOrTier, initialDays, initialPack]);

  if (!isOpen) return null;

  const handleProductChange = (newProd) => {
    setProduct(newProd);
  };

  const handlePackChange = (selectedPack) => {
    setPack(selectedPack);
    if (!selectedPack) return;

    // Automatically map pack to product
    const p = selectedPack.toLowerCase();
    if (p.includes('sensi') || p.includes('emulator')) {
      setProduct('emulator');
    } else if (p.includes('bundle') || p.includes('vip')) {
      setProduct('all');
      setDays('-1'); // Bundles default to Lifetime
    } else {
      setProduct('optimizer');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/create_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: product,
          username: username.trim() || 'User',
          days: parseInt(days)
        })
      });
      const data = await res.json();
      if (data.success) {
        playSound('activate');
        setCreatedKey(data.key);
        setCreatedProduct(data.product || product);
        navigator.clipboard.writeText(data.key);
        showToast(`Key generated & copied to clipboard: ${data.key}`);
        if (onCreated) onCreated();
      } else {
        playSound('error');
        showToast(data.error || 'Failed to generate key');
      }
    } catch (err) {
      showToast('Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyKey = () => {
    if (createdKey) {
      playSound('click');
      navigator.clipboard.writeText(createdKey);
      showToast('Key copied to clipboard!');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#14151e',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        padding: '30px',
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '22px',
            right: '22px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
        >
          <X size={17} />
        </button>

        {/* Modal Title */}
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            Generate License Key
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Create hardware-locked, real-time verified license keys.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Software Suite Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Software Suite Target
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleProductChange('emulator')}
                style={{
                  background: product === 'emulator' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: product === 'emulator' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
                  color: product === 'emulator' ? '#fbbf24' : 'var(--text-muted)',
                  padding: '9px 6px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ðŸŽ® Emulator
              </button>
              <button
                type="button"
                onClick={() => handleProductChange('optimizer')}
                style={{
                  background: product === 'optimizer' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: product === 'optimizer' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                  color: product === 'optimizer' ? '#38bdf8' : 'var(--text-muted)',
                  padding: '9px 6px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                âš¡ Optimizer
              </button>
              <button
                type="button"
                onClick={() => handleProductChange('all')}
                style={{
                  background: product === 'all' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(168, 85, 247, 0.2))' : 'rgba(255, 255, 255, 0.03)',
                  border: product === 'all' ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
                  color: product === 'all' ? '#e2b3ff' : 'var(--text-muted)',
                  padding: '9px 6px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ðŸŒŸ VIP Both
              </button>
            </div>
          </div>

          {/* 2. Optional Store Pack Tier */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Knoxyy Store Pack (Optional Preset)
            </label>
            <select
              value={pack}
              onChange={(e) => handlePackChange(e.target.value)}
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="">-- Standard Suite Key --</option>
              <optgroup label="Emulator Products">
                <option value="05 Emulator - â‚¹1,499">05 Emulator - â‚¹1,499</option>
                <option value="01 Sensitivity (Sensi) - â‚¹599">01 Sensitivity (Sensi) - â‚¹599</option>
              </optgroup>
              <optgroup label="Optimizer Products">
                <option value="02 Optimization - â‚¹1,199">02 Optimization - â‚¹1,199</option>
                <option value="03 Bat Files - â‚¹499">03 Bat Files - â‚¹499</option>
                <option value="04 Debloater - â‚¹299">04 Debloater - â‚¹299</option>
                <option value="06 Registry - â‚¹299">06 Registry - â‚¹299</option>
                <option value="07 Tweaks - â‚¹399">07 Tweaks - â‚¹399</option>
              </optgroup>
              <optgroup label="All-in-One Bundle">
                <option value="â˜… Full Bundle - â‚¹3,799">â˜… Full Bundle (All 7 Packs + VIP) - â‚¹3,799</option>
              </optgroup>
            </select>
          </div>

          {/* 3. Target Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Target Client / Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. KnoxyyGamer"
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          {/* 4. Validity Duration */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Validity Duration
            </label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13.5px',
                outline: 'none'
              }}
            >
              <option value="-1">â™¾ï¸ Lifetime (Permanent / Never Expire)</option>
              <option value="30">30 Days (Standard Month)</option>
              <option value="7">7 Days (Starter Trial)</option>
              <option value="90">90 Days (Quarterly Season)</option>
              <option value="365">365 Days (1 Full Year)</option>
            </select>
          </div>

          {/* Created Key Banner */}
          {createdKey && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10b981',
              padding: '14px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11.5px', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                âœ“ License Key Generated &amp; Copied!
              </div>
              <div
                onClick={copyKey}
                title="Click to copy key"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  color: createdProduct === 'optimizer' ? '#38bdf8' : (createdProduct === 'all' ? '#fbbf24' : '#fbbf24'),
                  letterSpacing: '0.5px',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>{createdKey}</span>
                <Copy size={14} />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                Valid for: <strong>{createdProduct === 'optimizer' ? 'Knoxyy Optimizer' : (createdProduct === 'all' ? 'All Suites (VIP)' : 'Knoxyy Emulator')}</strong> ({days === '-1' ? 'Lifetime' : `${days} Days`})
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid var(--border-subtle)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: product === 'optimizer' ? '#38bdf8' : (product === 'all' ? '#a855f7' : '#ffffff'),
                color: '#0b0c10',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)'
              }}
            >
              {isSubmitting ? 'Generating...' : 'âš¡ Generate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
