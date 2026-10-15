import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function LicenseModal({ isOpen, onClose, initialTier, initialDays, onCreated, showToast }) {
  const [tier, setTier] = useState('Pro');
  const [username, setUsername] = useState('Alex');
  const [days, setDays] = useState('30');
  const [createdKey, setCreatedKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTier) setTier(initialTier);
    if (initialDays !== undefined && initialDays !== null) setDays(String(initialDays));
    setCreatedKey('');
  }, [isOpen, initialTier, initialDays]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/create_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: tier.toLowerCase(),
          username: username.trim() || 'Alex',
          days: parseInt(days)
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreatedKey(data.key);
        navigator.clipboard.writeText(data.key);
        showToast(`Key generated & copied: ${data.key}`);
        if (onCreated) onCreated();
      } else {
        showToast(data.error || 'Failed to generate key');
      }
    } catch (err) {
      showToast('Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#14151e',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '460px',
        padding: '28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '22px',
            right: '22px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>
          Generate License Key
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Plan Tier Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px',
                color: '#ffffff',
                fontSize: '13.5px',
                outline: 'none'
              }}
            >
              <optgroup label="Knoxyy Store Packs">
                <option value="Sensitivity (Sensi)">01 Sensitivity (Sensi) - ₹599</option>
                <option value="Optimization">02 Optimization - ₹1,199</option>
                <option value="Bat Files">03 Bat Files - ₹499</option>
                <option value="Debloater">04 Debloater - ₹299</option>
                <option value="Emulator">05 Emulator - ₹1,499</option>
                <option value="Registry">06 Registry - ₹299</option>
                <option value="Tweaks">07 Tweaks - ₹399</option>
                <option value="Full Bundle">★ Full Bundle - ₹3,799</option>
              </optgroup>
              <optgroup label="General Plans">
                <option value="Pro">Pro Plan</option>
                <option value="Starter">Starter Plan</option>
                <option value="Business">Business Plan</option>
              </optgroup>
            </select>
          </div>

          {/* Target Username */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Target Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex"
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px',
                color: '#ffffff',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Validity Duration
            </label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              style={{
                width: '100%',
                background: '#0b0c10',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 14px',
                color: '#ffffff',
                fontSize: '13.5px',
                outline: 'none'
              }}
            >
              <option value="-1">Lifetime (Permanent)</option>
              <option value="30">30 Days (Standard Month)</option>
              <option value="7">7 Days (Starter Trial)</option>
              <option value="90">90 Days (Quarterly)</option>
              <option value="365">365 Days (1 Year)</option>
            </select>
          </div>

          {/* Created Key Banner */}
          {createdKey && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10b981',
              color: '#10b981',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <div>Key: <span style={{ textDecoration: 'underline' }}>{createdKey}</span></div>
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#a7f3d0' }}>
                ✓ Copied to clipboard!
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
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
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
                background: '#ffffff',
                color: '#0b0c10',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Generating...' : 'Generate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
