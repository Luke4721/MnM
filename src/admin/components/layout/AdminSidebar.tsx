import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Folder,
  FileText,
  Settings,
  LogOut,
  X,
  ChevronLeft,
} from 'lucide-react';
import { logoutAdmin } from '../../auth';
import db from '../../../data/mnm_database.json';

export interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string | number;
  matchPrefix?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  const location = useLocation();

  // Primary Navigation Items - Clean, minimal: Dashboard, Inbox, Packages, Blogs
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      to: '/admin/dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      label: 'Inbox',
      to: '/admin/inbox',
      icon: <Inbox size={19} />,
      badge: 1,
      matchPrefix: true,
    },
    {
      label: 'Packages',
      to: '/admin/packages',
      icon: <Folder size={19} />,
      matchPrefix: true,
    },
    {
      label: 'Blogs',
      to: '/admin/blogs',
      icon: <FileText size={19} />,
      matchPrefix: true,
    },
  ];

  const isRouteActive = (item: NavItem) => {
    if (item.to === '#') return false;
    if (item.to === '/admin/dashboard') {
      return (
        location.pathname === '/admin/dashboard' || location.pathname === '/admin'
      );
    }
    if (item.matchPrefix) {
      return location.pathname.startsWith(item.to);
    }
    return location.pathname === item.to;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Brand & Collapse Header */}
      <div
        className={`h-[72px] ${
          collapsed ? 'px-2 justify-center' : 'px-5 justify-between'
        } flex items-center border-b border-slate-200/60 shrink-0`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white/80 transition-all group relative"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <img
              src={db.company.logo_url}
              alt="Monks & Monkeys"
              className="h-8 w-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
          </button>
        ) : (
          <>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 min-w-0 group"
            >
              <img
                src={db.company.logo_url}
                alt="Monks & Monkeys"
                className="h-8 w-8 object-contain drop-shadow-xs shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[14px] tracking-tight text-slate-900 leading-tight truncate">
                  {db.company.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/70 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>

            {/* Desktop / Tablet Collapse toggle button */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/70 transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* Primary Navigation List */}
      <div
        className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5"
        data-lenis-prevent
      >
        {!collapsed && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Menu
          </div>
        )}

        {navItems.map((item) => {
          const active = isRouteActive(item);

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => {
                if (mobileOpen) onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${
                collapsed
                  ? 'justify-center px-2 py-3'
                  : 'justify-between px-3.5 py-2.5'
              } rounded-xl text-[13px] transition-all group relative ${
                active
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/70 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`shrink-0 transition-colors ${
                    active
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {/* Badge for notifications (e.g. Inbox) */}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`font-bold text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                      : 'bg-white text-slate-700 border-slate-200/80 shadow-xs'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed mode floating indicator badge */}
              {collapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Area: Settings & Admin Profile */}
      <div className="p-3 border-t border-slate-200/60 shrink-0 space-y-2">
        {/* Settings item at bottom */}
        <Link
          to="/admin/dashboard"
          onClick={() => {
            if (mobileOpen) onCloseMobile();
          }}
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
          } text-slate-600 hover:text-slate-950 rounded-xl text-[13px] hover:bg-white/70 transition-all font-medium group`}
        >
          <Settings
            size={18}
            className="shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors"
          />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Card */}
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center p-2' : 'justify-between p-2.5'
          } bg-white/70 rounded-2xl border border-slate-200/60 shadow-xs`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden ring-2 ring-white shrink-0">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=EAB308&color=fff"
                alt="Admin User"
                className="w-full h-full object-cover"
              />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-[12px] font-bold text-slate-900 leading-tight truncate">
                  Admin User
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Administrator</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={() => {
                logoutAdmin();
                onLogout();
              }}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-white/80"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 z-20 shadow-[2px_0_16px_rgba(0,0,0,0.02)] transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[270px] bg-white/95 backdrop-blur-2xl border-r border-slate-200 z-50 shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
