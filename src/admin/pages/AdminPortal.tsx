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
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Users,
  Compass,
} from 'lucide-react';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '../auth';
import { CommandCenter } from './CommandCenter';
import { TelecallerApp } from './TelecallerApp';
import { CompanyBrain } from './CompanyBrain';

type PortalTab = 'command-center' | 'telecaller-app' | 'company-brain';

export const AdminPortal: React.FC = () => {
  // Active Tab: "Command Center", "Telecaller App", or "Company Brain"
  const [activeTab, setActiveTab] = useState<PortalTab>('command-center');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

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
                This internal portal provides real-time access to Command Center, Telecaller Voice Desk, and the Company Brain.
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
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    autoFocus
                  />
                  <Lock size={16} className="absolute right-3.5 top-3.5 text-slate-500" />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
  // AUTHENTICATED PORTAL VIEW WITH SLEEK ENTERPRISE SAAS SIDEBAR
  // ---------------------------------------------------------------------------
  const navTabs: { id: PortalTab; label: string; icon: React.FC<{ size?: number; className?: string }>; badge: string }[] = [
    {
      id: 'command-center',
      label: 'Command Center',
      icon: Sliders,
      badge: 'Workforce KPIs',
    },
    {
      id: 'telecaller-app',
      label: 'Telecaller App',
      icon: PhoneCall,
      badge: '3 Active Leads',
    },
    {
      id: 'company-brain',
      label: 'Company Brain',
      icon: Sparkles,
      badge: 'Knowledge AI',
    },
  ];

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* =====================================================================
          SLEEK ENTERPRISE SIDEBAR (Desktop: 260px Fixed, Mobile: Drawer)
      ===================================================================== */}
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)] ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Top Logo / Brand Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Compass size={20} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                      MNM Travels
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      SaaS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Operations Portal v2.4</p>
                </div>
              </div>

              {/* Close Mobile Button */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="p-4 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  Operations Modules
                </span>
                <nav className="space-y-1.5">
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={16}
                            className={
                              isActive
                                ? 'text-amber-400'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }
                          />
                          <span>{tab.label}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Operational Shift Information Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users size={13} className="text-indigo-600" />
                    Duty Team
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Anirudh</span>
                    <span className="font-mono text-slate-400">Operations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Nishi</span>
                    <span className="font-mono text-slate-400">Content &amp; SEO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-4 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
            <Link
              to="/admin/dashboard"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleToggleMockAuth}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
                title="Mock admin session toggle"
              >
                <Shield size={12} />
                <span>Auth: Active</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors"
                title="Lock portal & log out"
              >
                <Lock size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT WORKSPACE AREA
      ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sleek Enterprise Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Toggle navigation"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="hidden sm:inline">Operations Suite</span>
              <ChevronRight size={13} className="hidden sm:inline text-slate-400" />
              <span className="font-bold text-slate-900 capitalize">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Top Quick Tab Selector */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('command-center')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'command-center'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sliders size={13} />
                <span className="hidden sm:inline">Command Center</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('telecaller-app')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'telecaller-app'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PhoneCall size={13} />
                <span className="hidden sm:inline">Telecaller</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('company-brain')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'company-brain'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles size={13} className={activeTab === 'company-brain' ? 'text-indigo-600' : ''} />
                <span className="hidden sm:inline">Company Brain</span>
              </button>
            </nav>
          </div>
        </header>

        {/* Dynamic Native Component Viewport */}
        <main className="flex-1 w-full overflow-y-auto bg-slate-50">
          {activeTab === 'command-center' && <CommandCenter />}
          {activeTab === 'telecaller-app' && <TelecallerApp />}
          {activeTab === 'company-brain' && <CompanyBrain />}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
