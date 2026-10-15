import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import LandingView from './components/LandingView';
import EmulatorDashboardView from './components/EmulatorDashboardView';
import OptimizerDashboardView from './components/OptimizerDashboardView';
import PricingView from './components/PricingView';
import SettingsView from './components/SettingsView';
import LicenseModal from './components/LicenseModal';
import DashboardSelectorModal from './components/DashboardSelectorModal';

const DEFAULT_SETTINGS = {
  accentColor: '#a855f7',
  accentGlow: 'rgba(168, 85, 247, 0.4)',
  shardsEnabled: true,
  shardsOpacity: 0.32,
  shardsSpeed: 1.0,
  density: 'comfortable',
  defaultHub: 'ask'
};

export default function App() {
  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('knoxyy_portal_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Apply accent color to document root
  useEffect(() => {
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--purple-primary', settings.accentColor);
    }
    if (settings.accentGlow) {
      document.documentElement.style.setProperty('--border-glow-purple', settings.accentGlow);
    }
  }, [settings.accentColor, settings.accentGlow]);

  const updateSettings = (newVals) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newVals };
      try {
        localStorage.setItem('knoxyy_portal_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem('knoxyy_portal_settings');
    } catch (e) {}
    document.documentElement.style.setProperty('--purple-primary', DEFAULT_SETTINGS.accentColor);
    document.documentElement.style.setProperty('--border-glow-purple', DEFAULT_SETTINGS.accentGlow);
  };

  // Determine current view from pathname
  const [currentView, setView] = useState(() => {
    const p = window.location.pathname.replace('/', '').toLowerCase();
    if (p === 'pricing') return 'pricing';
    if (p === 'emulator') return 'emulator';
    if (p === 'optimizer') return 'optimizer';
    if (p === 'settings') return 'settings';
    if (p === 'dashboard') return 'dashboard_pending';
    return 'landing';
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [licenses, setLicenses] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, tier: 'Pro', days: 30 });
  const [toasts, setToasts] = useState([]);

  // Toast feedback
  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  // Fetch licenses and real metrics from backend API
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [licRes, metRes] = await Promise.all([
        fetch('/api/v1/admin/list'),
        fetch('/api/v1/metrics')
      ]);
      const licData = await licRes.json();
      if (licData && licData.licenses) {
        setLicenses(licData.licenses);
      }
      const metData = await metRes.json();
      if (metData) {
        setMetrics(metData);
      }
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Navigate view
  const handleSetView = (view) => {
    if (view === 'dashboard' || view === 'dashboard_pending') {
      if (settings.defaultHub === 'emulator') {
        setView('emulator');
        window.history.pushState(null, '', '/emulator');
      } else if (settings.defaultHub === 'optimizer') {
        setView('optimizer');
        window.history.pushState(null, '', '/optimizer');
      } else {
        setIsSelectorOpen(true);
      }
      return;
    }

    setView(view);
    const urlPath = view === 'landing' ? '/' : `/${view}`;
    window.history.pushState(null, '', urlPath);
  };

  // Popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace('/', '').toLowerCase();
      if (p === 'pricing') setView('pricing');
      else if (p === 'emulator') setView('emulator');
      else if (p === 'optimizer') setView('optimizer');
      else if (p === 'settings') setView('settings');
      else if (p === 'dashboard') {
        setIsSelectorOpen(true);
      } else {
        setView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if first-time dashboard was opened directly on /dashboard
  useEffect(() => {
    if (currentView === 'dashboard_pending') {
      setIsSelectorOpen(true);
      setView('emulator'); // default background view
    }
  }, [currentView]);

  const handleSelectHub = (hub) => {
    setIsSelectorOpen(false);
    handleSetView(hub);
  };

  // Action execution (kick, ban, unban, reset_hwid, delete)
  const handleAction = async (action, key) => {
    const actionLabel = action === 'delete' ? 'DELETE' : action.replace('_', ' ').toUpperCase();
    const promptText = action === 'delete'
      ? `Are you sure you want to permanently DELETE license: ${key}?`
      : `Confirm ${actionLabel} on license: ${key}?`;

    if (window.confirm(promptText)) {
      try {
        const res = await fetch('/api/v1/admin/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, key })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Action ${actionLabel} executed successfully`);
          fetchData();
        } else {
          showToast(data.error || `Failed to execute ${actionLabel}`);
        }
      } catch (err) {
        showToast('Server communication error');
      }
    }
  };

  const openCreateModal = (productOrTier = 'emulator', days = 30, pack = '') => {
    setModalState({ isOpen: true, productOrTier, days, pack });
  };

  return (
    <div className="app-container">
      {/* Sidebar with Knoxyy logo & clean navigation */}
      <Sidebar
        currentView={currentView}
        setView={handleSetView}
        onOpenCreate={openCreateModal}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        accentColor={settings.accentColor}
      />

      {/* Main Container */}
      <main className="main-content">
        <div className="content-inner">
          {/* Top Header without pills or traffic lights */}
          <TopHeader
            currentView={currentView}
            onOpenCreate={openCreateModal}
            onOpenSelector={() => setIsSelectorOpen(true)}
            accentColor={settings.accentColor}
          />

          {/* Views */}
          {currentView === 'landing' && (
            <LandingView
              onNavigateToEmulator={() => handleSetView('emulator')}
              onNavigateToOptimizer={() => handleSetView('optimizer')}
              onNavigateToPricing={() => handleSetView('pricing')}
              metrics={metrics}
              settings={settings}
            />
          )}

          {currentView === 'emulator' && (
            <EmulatorDashboardView
              licenses={licenses}
              onOpenCreate={openCreateModal}
              onAction={handleAction}
              metrics={metrics}
              density={settings.density}
            />
          )}

          {currentView === 'optimizer' && (
            <OptimizerDashboardView
              licenses={licenses}
              onOpenCreate={openCreateModal}
              onAction={handleAction}
              metrics={metrics}
              showToast={showToast}
              density={settings.density}
            />
          )}

          {currentView === 'pricing' && (
            <PricingView
              onOpenCreate={openCreateModal}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetSettings={resetSettings}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Hub Chooser Modal (Prompts to select between Knoxyy Emulator and Knoxyy Optimizer) */}
      <DashboardSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectHub={handleSelectHub}
        accentColor={settings.accentColor}
      />

      {/* License Modal */}
      <LicenseModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        initialProductOrTier={modalState.productOrTier}
        initialDays={modalState.days}
        initialPack={modalState.pack}
        onCreated={fetchData}
        showToast={showToast}
      />

      {/* Toast Notifications */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: '#171824',
              border: '1px solid var(--border-medium)',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
