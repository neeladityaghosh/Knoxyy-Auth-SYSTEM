import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, X, ShieldAlert, Cpu } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'sensi',
    num: '01',
    title: 'Sensitivity (Sensi)',
    desc: 'Low / Mid / High / PC packs',
    price: '₹599',
    priceVal: 599,
    highlight: false,
    details: [
      'Custom DPI Settings: 400 / 800 / 1200 DPI presets',
      'General, Red Dot, 2x, 4x calibrated headshot curve',
      'Custom BlueStacks & MSI App Player sensitivity config',
      'Instant download link + quick setup guide'
    ]
  },
  {
    id: 'optimization',
    num: '02',
    title: 'Optimization',
    desc: 'FPS, Ping, Lag Fix',
    price: '₹1,199',
    priceVal: 1199,
    highlight: false,
    details: [
      'Comprehensive FPS boost & 1% low frame stabilization',
      'DNS, TCP/IP & Network ping reducer',
      'GPU driver profiles (NVIDIA & AMD optimized)',
      'Micro-stutter elimination & Hardware GPU scheduling'
    ]
  },
  {
    id: 'bat_files',
    num: '03',
    title: 'Bat Files',
    desc: 'Cleaner / Booster',
    price: '₹499',
    priceVal: 499,
    highlight: true, // Glow highlighted as seen in user's design screenshot
    badgeText: 'POPULAR',
    details: [
      'Automated 1-Click Clean .bat batch script',
      'Cleans standby memory, temp files & shader cache',
      'Stops background bloat telemetry services',
      'Automatic RAM flush before launching emulator'
    ]
  },
  {
    id: 'debloater',
    num: '04',
    title: 'Debloater',
    desc: 'Windows 10 / 11',
    price: '₹299',
    priceVal: 299,
    highlight: false,
    details: [
      'Removes Microsoft bloatware & Cortana telemetry',
      'Disables Windows GameDVR background recording lag',
      'Frees up 1.5GB - 3GB active RAM instantly',
      'Safe rollback script included'
    ]
  },
  {
    id: 'emulator',
    num: '05',
    title: 'Emulator',
    desc: 'Best config, VT, Keymap',
    price: '₹1,499',
    priceVal: 1499,
    highlight: false,
    details: [
      'Pre-configured emulator build (BlueStacks 5 / MSI)',
      'VT (Virtualization Technology) hardware unlock',
      'Zero-delay headshot keymapping layout',
      'Display resolution & custom DPI tuning'
    ]
  },
  {
    id: 'registry',
    num: '06',
    title: 'Registry',
    desc: 'Registry edits + Undo .reg',
    price: '₹299',
    priceVal: 299,
    highlight: false,
    details: [
      'System responsiveness & CPU core priority registry tweaks',
      'Network throttling index removal',
      'Includes original Undo.reg for 100% safe revert',
      'Verified ban-safe and antivirus safe'
    ]
  },
  {
    id: 'tweaks',
    num: '07',
    title: 'Tweaks',
    desc: 'Windows & PC Tweaks',
    price: '₹399',
    priceVal: 399,
    highlight: false,
    details: [
      'Ultimate Performance power plan installation',
      'Timer resolution optimization (0.5ms lock)',
      'Visual effects tuning for competitive gaming',
      'Audio & input latency reduction'
    ]
  },
  {
    id: 'bundle',
    num: '★',
    title: 'Full Bundle',
    desc: 'Sab 7 packs ek saath (best value)',
    price: '₹3,799',
    priceVal: 3799,
    highlight: false,
    isBundle: true,
    badgeText: 'BEST VALUE',
    details: [
      'All 7 packs included in one single complete package',
      'Lifetime access to all future updates & patches',
      'Priority 1-on-1 setup support via Discord / AnyDesk',
      'Massive discount: Save over ₹1,000 on full package'
    ]
  }
];

export default function PricingView({ onOpenCreate }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleBuyNow = (product) => {
    if (onOpenCreate && product) {
      let prodType = 'optimizer';
      if (product.id === 'sensi' || product.id === 'emulator') {
        prodType = 'emulator';
      } else if (product.id === 'bundle') {
        prodType = 'all';
      }
      onOpenCreate(prodType, product.id === 'bundle' ? -1 : 30, product.title);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '1060px',
      margin: '0 auto',
      textAlign: 'center',
      paddingTop: '20px',
      paddingBottom: '60px',
      width: '100%'
    }}>
      {/* Sleek Category Label */}
      <div style={{
        fontSize: '11.5px',
        fontWeight: 700,
        letterSpacing: '2px',
        color: '#64748b',
        marginBottom: '16px',
        textTransform: 'uppercase'
      }}>
        FREE FIRE PC / EMULATOR HUB
      </div>

      {/* Big Warm Orange Title from user screenshot */}
      <h1 style={{
        fontSize: '48px',
        fontWeight: 900,
        letterSpacing: '-1px',
        color: '#ff781f',
        marginBottom: '10px',
        lineHeight: 1.15
      }}>
        Knoxyy Store
      </h1>

      {/* Hindi Subtitle from user screenshot */}
      <p style={{
        fontSize: '14.5px',
        color: '#94a3b8',
        maxWidth: '560px',
        margin: '0 auto 42px auto',
        lineHeight: 1.5
      }}>
        Kisi bhi section par click karo, price aur details dekho
      </p>

      {/* 8 Product Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '18px',
        alignItems: 'stretch',
        textAlign: 'left',
        marginBottom: '40px'
      }}>
        {PRODUCTS.map((prod) => {
          const isHighlighted = prod.highlight;
          return (
            <div
              key={prod.id}
              onClick={() => handleOpenDetails(prod)}
              style={{
                background: isHighlighted
                  ? 'radial-gradient(circle at 50% 30%, rgba(255, 107, 0, 0.16) 0%, rgba(17, 18, 24, 0.95) 75%)'
                  : 'rgba(15, 16, 22, 0.88)',
                border: isHighlighted
                  ? '1px solid rgba(255, 120, 31, 0.75)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isHighlighted
                  ? '0 0 30px rgba(255, 107, 0, 0.22), 0 10px 24px rgba(0, 0, 0, 0.5)'
                  : '0 4px 18px rgba(0, 0, 0, 0.28)',
                borderRadius: '16px',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = isHighlighted ? '#ff8533' : 'rgba(255, 120, 31, 0.5)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(255, 120, 31, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = isHighlighted
                  ? 'rgba(255, 120, 31, 0.75)'
                  : 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = isHighlighted
                  ? '0 0 30px rgba(255, 107, 0, 0.22), 0 10px 24px rgba(0, 0, 0, 0.5)'
                  : '0 4px 18px rgba(0, 0, 0, 0.28)';
              }}
            >
              <div>
                {/* Header row: Badge + Optional Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    background: isHighlighted ? '#ff6b00' : '#ff4400',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '24px'
                  }}>
                    {prod.num}
                  </div>

                  {prod.badgeText && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.6px',
                      color: isHighlighted ? '#ff9933' : '#a78bfa',
                      background: isHighlighted ? 'rgba(255, 107, 0, 0.14)' : 'rgba(124, 58, 237, 0.15)',
                      border: isHighlighted ? '1px solid rgba(255, 107, 0, 0.35)' : '1px solid rgba(124, 58, 237, 0.35)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {prod.badgeText}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '6px',
                  letterSpacing: '-0.3px'
                }}>
                  {prod.title}
                </h3>

                {/* Subtitle description */}
                <p style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  marginBottom: '20px',
                  lineHeight: 1.4
                }}>
                  {prod.desc}
                </p>
              </div>

              {/* Bottom row: Price and Details button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#ff9436',
                  letterSpacing: '-0.5px'
                }}>
                  {prod.price}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDetails(prod);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; }}
                >
                  <span>Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer bottom note from user screenshot */}
      <div style={{
        fontSize: '12px',
        color: '#64748b',
        maxWidth: '680px',
        margin: '0 auto 28px auto',
        lineHeight: 1.6
      }}>
        Koi bhi tweak lagane se pehle Restore Point zaroor banao. Results har system par alag ho sakte hain.
      </div>

      {/* Support / Quick Buy Bar */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-pill)',
        padding: '8px 24px'
      }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          Kuch puchna hai ya buy karna hai?
        </span>
        <button
          onClick={() => onOpenCreate('Full Bundle', 30)}
          style={{
            background: '#ff781f',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '7px 18px',
            fontSize: '12.5px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ff8f3d'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ff781f'; }}
        >
          Generate License Key
        </button>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#12131b',
              border: '1px solid rgba(255, 120, 31, 0.4)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              padding: '30px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 107, 0, 0.2)',
              position: 'relative',
              textAlign: 'left'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {/* Badge & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: '#ff5500',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {selectedProduct.num}
              </span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                {selectedProduct.title}
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: '20px' }}>
              {selectedProduct.desc}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '20px',
              background: 'rgba(255, 107, 0, 0.08)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              padding: '12px 16px',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Special Price:</span>
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#ff9436' }}>
                {selectedProduct.price}
              </span>
            </div>

            {/* What's included checklist */}
            <div style={{ marginBottom: '26px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                What&apos;s Included:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedProduct.details.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4 }}>
                    <Check size={16} color="#ff781f" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  const prod = selectedProduct;
                  setSelectedProduct(null);
                  handleBuyNow(prod);
                }}
                style={{
                  flex: 1,
                  background: '#ff781f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '13px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 18px rgba(255, 120, 31, 0.4)'
                }}
              >
                Buy Now / Get Key
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '13px 20px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
