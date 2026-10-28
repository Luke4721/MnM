import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  PhoneCall,
  Sliders,
} from 'lucide-react';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '../auth';
import { CommandCenter } from './CommandCenter';
import { TelecallerApp } from './TelecallerApp';

const NAVBAR_HEIGHT_PX = 56;

export const AdminPortal: React.FC = () => {
  // Active Tab: "Command Center" or "Telecaller App"
  const [activeTab, setActiveTab] = useState<'command-center' | 'telecaller-app'>('command-center');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isAdminAuthenticated();
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

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
              <h1 className="text-2xl font-bold text-white tracking-tight pt-2">
                Admin Authentication Required
              </h1>
              <p className="text-sm text-slate-400">
                This internal portal integrates native Command Center &amp; Telecaller applications. You must be an authenticated administrator to proceed.
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
    <div className="min-h-screen w-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* =====================================================================
          TOP NAVIGATION BAR (Exact Height: 56px)
          Tabs: "Command Center" and "Telecaller App"
      ===================================================================== */}
      <header
        className="w-full bg-slate-900 border-b border-slate-800/90 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm"
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
              <span className="hidden md:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Native React
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

        {/* Right: Controls (Auth Toggle, Logout) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Auth State Toggle / Lock */}
          <button
            type="button"
            onClick={handleToggleMockAuth}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors"
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

      {/* =====================================================================
          MAIN NATIVE COMPONENT CONTAINER (Replaces Iframes)
      ===================================================================== */}
      <main className="flex-1 w-full bg-slate-50 overflow-y-auto">
        {activeTab === 'command-center' && <CommandCenter />}
        {activeTab === 'telecaller-app' && <TelecallerApp />}
      </main>
    </div>
  );
};

export default AdminPortal;
