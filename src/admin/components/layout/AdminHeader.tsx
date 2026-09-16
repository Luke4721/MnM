import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Folder,
  FileText,
  Inbox,
} from 'lucide-react';
import { logoutAdmin } from '../../auth';

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
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
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

  // Compute breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard') || path === '/admin') {
      return {
        icon: <LayoutDashboard size={14} />,
        category: 'Dashboards',
        page: 'Default',
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
        category: 'App',
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
    <header className="h-[72px] bg-white/40 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      {/* Left side: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl bg-white/60 border border-white/60 text-gray-600 hover:text-gray-900 shadow-sm"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <div className="p-1.5 border border-white/60 rounded-lg flex items-center justify-center bg-white/60 text-indigo-500 shadow-sm">
            {breadcrumbs.icon}
          </div>
          <span className="font-medium text-gray-600 hidden sm:inline">
            {breadcrumbs.category}
          </span>
          <span className="text-gray-400 hidden sm:inline">/</span>
          <span className="text-gray-900 font-bold">{breadcrumbs.page}</span>
        </div>
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center gap-3">
        {/* Quick View Live Site Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white/90 border border-white/60 text-[12px] font-semibold text-gray-700 shadow-sm transition-all"
        >
          <span>View Site</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">↗</span>
        </Link>

        <div className="flex items-center gap-2 border-l border-white/40 pl-3 sm:pl-4">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-white/60 hover:bg-white/90 border border-white/60 rounded-xl transition-all shadow-sm relative"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-900">Notifications</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                    1 New
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-[12px]">
                    <div className="font-semibold text-gray-900">System Online</div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      Admin dashboard and S3 storage connected.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 bg-white/60 hover:bg-white/90 border border-white/60 rounded-xl transition-all shadow-sm"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden ring-1 ring-white">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=EAB308&color=fff"
                  alt="Admin User"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden md:inline text-[13px] font-bold text-gray-800">
                Admin
              </span>
              <ChevronDown size={14} className="text-gray-400 hidden sm:inline" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <div className="text-[13px] font-bold text-gray-900 leading-tight">
                    Admin User
                  </div>
                  <div className="text-[11px] text-gray-500">admin@mnm.travel</div>
                </div>

                <Link
                  to="/admin/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-100/70 rounded-xl transition-colors"
                >
                  <LayoutDashboard size={15} className="text-gray-500" />
                  <span>Dashboard</span>
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
