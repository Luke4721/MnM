import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  Settings,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  PhoneCall,
  Sliders,
  X,
} from 'lucide-react';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '../auth';

const NAVBAR_HEIGHT_PX = 56;

const DEFAULT_COMMAND_CENTER_URL =
  (import.meta.env.VITE_RETOOL_COMMAND_CENTER_URL as string) ||
  '[PASTE_YOUR_PUBLISHED_RETOOL_COMMAND_CENTER_URL_HERE]';

const DEFAULT_TELECALLER_APP_URL =
  (import.meta.env.VITE_RETOOL_TELECALLER_APP_URL as string) ||
  '[PASTE_YOUR_PUBLISHED_RETOOL_TELECALLER_APP_URL_HERE]';

export const AdminPortal: React.FC = () => {

  // Active Tab: "Command Center" or "Telecaller App"
  const [activeTab, setActiveTab] = useState<'command-center' | 'telecaller-app'>('command-center');

  // Authentication State (supports existing auth provider and mock state toggle)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isAdminAuthenticated();
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Retool URLs (initialized with env vars or placeholder defaults; supports local edits)
  const [commandCenterUrl, setCommandCenterUrl] = useState<string>(() => {
    return (
      localStorage.getItem('portal_retool_command_center_url') ||
      DEFAULT_COMMAND_CENTER_URL
    );
  });
  const [telecallerAppUrl, setTelecallerAppUrl] = useState<string>(() => {
    return (
      localStorage.getItem('portal_retool_telecaller_app_url') ||
      DEFAULT_TELECALLER_APP_URL
    );
  });

  // URL Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempCommandCenterUrl, setTempCommandCenterUrl] = useState(commandCenterUrl);
  const [tempTelecallerAppUrl, setTempTelecallerAppUrl] = useState(telecallerAppUrl);
  const [iframeKey, setIframeKey] = useState(0);

  // Sync scroll locking removal for full viewport display
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.remove('lenis');
    document.body.classList.remove('lenis');

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Invalid admin password. Try Oncology@1857 or toggle Mock Auth.');
    }
  };

  const handleToggleMockAuth = () => {
    const nextState = !isAuthenticated;
    if (nextState) {
      localStorage.setItem('admin_auth', 'true');
    } else {
      logoutAdmin();
    }
    setIsAuthenticated(nextState);
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleSaveUrls = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = tempCommandCenterUrl.trim() || DEFAULT_COMMAND_CENTER_URL;
    const cleanTele = tempTelecallerAppUrl.trim() || DEFAULT_TELECALLER_APP_URL;

    setCommandCenterUrl(cleanCmd);
    setTelecallerAppUrl(cleanTele);
    localStorage.setItem('portal_retool_command_center_url', cleanCmd);
    localStorage.setItem('portal_retool_telecaller_app_url', cleanTele);
    setShowConfigModal(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleResetUrls = () => {
    setCommandCenterUrl(DEFAULT_COMMAND_CENTER_URL);
    setTelecallerAppUrl(DEFAULT_TELECALLER_APP_URL);
    setTempCommandCenterUrl(DEFAULT_COMMAND_CENTER_URL);
    setTempTelecallerAppUrl(DEFAULT_TELECALLER_APP_URL);
    localStorage.removeItem('portal_retool_command_center_url');
    localStorage.removeItem('portal_retool_telecaller_app_url');
    setShowConfigModal(false);
    setIframeKey((prev) => prev + 1);
  };

  const currentUrl = activeTab === 'command-center' ? commandCenterUrl : telecallerAppUrl;
  const isPlaceholderUrl =
    currentUrl.includes('PASTE_YOUR_PUBLISHED_RETOOL') ||
    (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://'));

  // ---------------------------------------------------------------------------
  // AUTHENTICATION GATE
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
              <ShieldAlert size={28} />
            </div>

            <div className="text-center space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Restricted Operations Portal
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight pt-2">Admin Authentication Required</h1>
              <p className="text-sm text-slate-400">
                This internal portal integrates live Retool Command Center &amp; Telecaller applications. You must be an authenticated administrator to proceed.
              </p>
            </div>

            {/* Password Login Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter admin password..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    autoFocus
                  />
                  <Lock size={16} className="absolute right-3.5 top-3 text-slate-500" />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock size={16} /> Authenticate Admin
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500">
                Or Quick State Toggle
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Quick Mock State Toggle */}
            <button
              type="button"
              onClick={handleToggleMockAuth}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              title="Toggle authentication state mock without entering password"
            >
              <CheckCircle2 size={15} className="text-emerald-400" />
              Mock Admin Auth (Toggle Access)
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <Link to="/admin/login" className="hover:text-blue-400 transition-colors">
                Standard Admin Login &rarr;
              </Link>
              <Link to="/" className="hover:text-slate-300 transition-colors">
                Return to Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED PORTAL VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* =====================================================================
          TOP NAVIGATION BAR (Exact Height: 56px)
          Tabs: "Command Center" and "Telecaller App"
      ===================================================================== */}
      <header
        className="w-full bg-slate-900 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30"
        style={{ height: `${NAVBAR_HEIGHT_PX}px` }}
      >
        {/* Left: Branding & Back to Dashboard */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Return to Main Admin Dashboard"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm text-white tracking-tight">Operations Portal</span>
              <span className="hidden md:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Retool
              </span>
            </div>
          </div>
        </div>

        {/* Center: Two Required Tabs: "Command Center" & "Telecaller App" */}
        <nav
          className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 shadow-inner"
          aria-label="Operations Portal Navigation"
        >
          <button
            type="button"
            onClick={() => setActiveTab('command-center')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'command-center'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders size={14} className={activeTab === 'command-center' ? 'text-white' : 'text-slate-400'} />
            <span>Command Center</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telecaller-app')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'telecaller-app'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <PhoneCall size={14} className={activeTab === 'telecaller-app' ? 'text-white' : 'text-slate-400'} />
            <span>Telecaller App</span>
          </button>
        </nav>

        {/* Right: Controls (Refresh, URL Config, Auth Toggle, Logout) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Reload Iframe */}
          <button
            type="button"
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reload current dashboard"
          >
            <RefreshCw size={14} />
          </button>

          {/* Configure URLs */}
          <button
            type="button"
            onClick={() => {
              setTempCommandCenterUrl(commandCenterUrl);
              setTempTelecallerAppUrl(telecallerAppUrl);
              setShowConfigModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Configure Retool URLs"
          >
            <Settings size={14} />
            <span className="hidden lg:inline">Configure URLs</span>
          </button>

          {/* Auth State Toggle / Lock */}
          <button
            type="button"
            onClick={handleToggleMockAuth}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors"
            title="Admin authenticated. Click to toggle auth state."
          >
            <Shield size={13} />
            <span className="hidden sm:inline">Auth: Active</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-colors"
            title="Lock Portal & Log Out"
          >
            <Lock size={14} />
          </button>
        </div>
      </header>

      {/* Placeholder Warning Banner (if URLs haven't been replaced with real Retool URLs) */}
      {isPlaceholderUrl && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-20 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Retool URL placeholder:</strong> Currently pointing to{' '}
              <code className="bg-slate-900/80 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">
                {currentUrl}
              </code>
              . Replace it in code, configure via <code>.env.local</code>, or click Configure to preview live.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setTempCommandCenterUrl(commandCenterUrl);
              setTempTelecallerAppUrl(telecallerAppUrl);
              setShowConfigModal(true);
            }}
            className="underline hover:text-white ml-3 shrink-0 font-medium cursor-pointer"
          >
            Set URL
          </button>
        </div>
      )}

      {/* =====================================================================
          MAIN IFRAME CONTAINER
          Takes up 100vh minus navbar height (and banner if visible)
      ===================================================================== */}
      <main
        className="flex-1 w-full relative overflow-hidden bg-slate-950"
        style={{
          height: `calc(100vh - ${NAVBAR_HEIGHT_PX}px)`,
        }}
      >
        {activeTab === 'command-center' && (
          <iframe
            key={`cmd-${iframeKey}`}
            src={commandCenterUrl}
            title="Command Center"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            allow="clipboard-write"
            className="w-full h-full block"
          />
        )}

        {activeTab === 'telecaller-app' && (
          <iframe
            key={`tele-${iframeKey}`}
            src={telecallerAppUrl}
            title="Telecaller App"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            allow="clipboard-write"
            className="w-full h-full block"
          />
        )}
      </main>

      {/* =====================================================================
          RETOOL URL CONFIGURATION MODAL
      ===================================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-blue-400" />
                <h3 className="font-semibold text-white text-base">Configure Retool Dashboard URLs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUrls} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Command Center Retool URL
                </label>
                <input
                  type="text"
                  value={tempCommandCenterUrl}
                  onChange={(e) => setTempCommandCenterUrl(e.target.value)}
                  placeholder="https://your-org.retool.com/embedded/public/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default placeholder: <code>[PASTE_YOUR_PUBLISHED_RETOOL_COMMAND_CENTER_URL_HERE]</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Telecaller App Retool URL
                </label>
                <input
                  type="text"
                  value={tempTelecallerAppUrl}
                  onChange={(e) => setTempTelecallerAppUrl(e.target.value)}
                  placeholder="https://your-org.retool.com/embedded/public/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default placeholder: <code>[PASTE_YOUR_PUBLISHED_RETOOL_TELECALLER_APP_URL_HERE]</code>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetUrls}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Reset to Defaults
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/30"
                  >
                    Save &amp; Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
