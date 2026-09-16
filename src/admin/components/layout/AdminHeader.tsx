import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  Folder,
  FileText,
  Inbox,
  Sun,
  Moon,
} from 'lucide-react';
import { logoutAdmin } from '../../auth';
import db from '../../../data/mnm_database.json';

export interface AdminHeaderProps {
  onOpenMobile: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobile,
  onLogout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('admin_theme') === 'dark';
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('admin_theme', next ? 'dark' : 'light');
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard') || path === '/admin') {
      return {
        icon: <LayoutDashboard size={14} />,
        category: 'Dashboard',
        page: 'Overview',
      };
    }
    if (path.startsWith('/admin/packages')) {
      return {
        icon: <Folder size={14} />,
        category: 'Management',
        page: 'Packages',
      };
    }
    if (path.startsWith('/admin/blogs/create')) {
      return {
        icon: <FileText size={14} />,
        category: 'Blogs',
        page: 'Create Blog',
      };
    }
    if (path.startsWith('/admin/blogs/edit')) {
      return {
        icon: <FileText size={14} />,
        category: 'Blogs',
        page: 'Edit Blog',
      };
    }
    if (path.startsWith('/admin/blogs')) {
      return {
        icon: <FileText size={14} />,
        category: 'Management',
        page: 'Blogs',
      };
    }
    if (path.startsWith('/admin/inbox')) {
      return {
        icon: <Inbox size={14} />,
        category: 'Communication',
        page: 'Inbox',
      };
    }
    return {
      icon: <LayoutDashboard size={14} />,
      category: 'Admin',
      page: 'Overview',
    };
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logoutAdmin();
    onLogout();
    navigate('/admin/login');
  };

  return (
    <header className="h-[72px] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Left side: Mobile Toggle & Site Name / Logo & Breadcrumbs */}
      <div className="flex items-center gap-3.5">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/70 text-slate-700 shadow-xs transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Site Name and Logo */}
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2.5 group select-none no-underline"
        >
          <img
            src={db.company.logo_url}
            alt="Monks & Monkeys Travels"
            className="h-8 w-8 object-contain drop-shadow-xs shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-[14px] sm:text-[15px] tracking-tight text-slate-900 leading-tight">
              Monks & Monkeys Travels
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </Link>

        {/* Dynamic Context Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200/60 text-xs text-slate-500">
          <div className="p-1 border border-slate-200/60 rounded-md bg-white/80 text-indigo-600 shadow-xs">
            {breadcrumbs.icon}
          </div>
          <span className="font-medium text-slate-500">{breadcrumbs.category}</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800">{breadcrumbs.page}</span>
        </div>
      </div>

      {/* Right side: View Site Button, Notifications, Admin User Profile */}
      <div className="flex items-center gap-3">
        {/* "View Site" button (opens main website) */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-[12px] font-bold text-slate-700 hover:text-slate-900 shadow-xs hover:shadow-sm transition-all"
        >
          <span>View Site</span>
          <ExternalLink size={13} className="text-indigo-600" />
        </Link>

        <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3 sm:pl-4">
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <Sun size={16} className="text-amber-500" />
            ) : (
              <Moon size={16} className="text-slate-600" />
            )}
          </button>

          {/* Notifications Bell Icon */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl transition-all shadow-xs relative"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200/60">
                    1 New
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-[12px]">
                    <div className="font-semibold text-slate-900">System Ready</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Admin dashboard and AWS S3 storage connected.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Profile Dropdown (with logout) */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl transition-all shadow-xs"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center overflow-hidden ring-1 ring-white shrink-0">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=EAB308&color=fff"
                  alt="Admin User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[12px] font-bold text-slate-800 leading-tight">
                  Admin User
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Administrator</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-0.5" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">
                    Admin User
                  </div>
                  <div className="text-[11px] text-slate-500">admin@mnm.travel</div>
                </div>

                <Link
                  to="/admin/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <LayoutDashboard size={15} className="text-slate-500" />
                  <span>Dashboard Overview</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

