import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Folder,
  FileText,
  Lock,
  FilePlus,
  User,
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

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      group: 'Main',
      items: [
        {
          label: 'Dashboard',
          to: '/admin/dashboard',
          icon: <LayoutDashboard size={18} className="text-indigo-500" />,
        },
      ],
    },
    {
      group: 'App',
      items: [
        {
          label: 'Inbox',
          to: '/admin/inbox',
          icon: <Inbox size={18} className="text-sky-500" />,
          badge: 1,
          matchPrefix: true,
        },
      ],
    },
    {
      group: 'Management',
      items: [
        {
          label: 'Packages',
          to: '/admin/packages',
          icon: <Folder size={18} className="text-indigo-600" />,
          matchPrefix: true,
        },
        {
          label: 'Blogs',
          to: '/admin/blogs',
          icon: <FileText size={18} className="text-[#FF9933]" />,
          matchPrefix: true,
        },
      ],
    },
    {
      group: 'Extra',
      items: [
        {
          label: 'Authentication',
          to: '#',
          icon: <Lock size={18} className="text-gray-400" />,
        },
        {
          label: 'Pages',
          to: '#',
          icon: <FilePlus size={18} className="text-gray-400" />,
        },
      ],
    },
    {
      group: 'Account',
      items: [
        {
          label: 'Profile',
          to: '#',
          icon: <User size={18} className="text-gray-400" />,
        },
      ],
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
    <div className="h-full flex flex-col justify-between">
      {/* Brand Header */}
      <div
        className={`h-[72px] ${
          collapsed ? 'px-2 justify-center' : 'px-5 justify-between'
        } flex items-center border-b border-white/40 shrink-0`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/70 transition-all group relative"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <img
              src={db.company.logo_url}
              alt="Logo"
              className="h-8 w-8 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={db.company.logo_url}
                alt="Logo"
                className="h-8 w-8 object-contain drop-shadow-sm shrink-0"
              />
              <span className="font-extrabold text-[14px] tracking-tight text-gray-900 leading-tight truncate">
                {db.company.name}
              </span>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/60"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>

            {/* Desktop / Tablet Collapse toggle button */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/60 transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* Nav List */}
      <div
        className="flex-1 overflow-y-auto px-3 py-5 space-y-5"
        data-lenis-prevent
      >
        {navGroups.map((grp) => (
          <div key={grp.group}>
            {!collapsed ? (
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                {grp.group}
              </div>
            ) : (
              <div className="h-2 border-b border-white/40 mb-2 mx-2" />
            )}

            <div className="space-y-1">
              {grp.items.map((item) => {
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
                      collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                    } rounded-xl text-[13px] transition-all group relative ${
                      active
                        ? 'bg-white/95 text-gray-950 font-bold shadow-sm border border-white/80'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-white/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!collapsed && item.badge !== undefined && (
                      <span className="bg-white/90 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm border border-white/60">
                        {item.badge}
                      </span>
                    )}

                    {/* Floating badge for collapsed mode */}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile & Settings */}
      <div className="p-3 border-t border-white/40 shrink-0 space-y-2">
        <Link
          to="#"
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center ${
            collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
          } text-gray-600 hover:text-gray-900 rounded-xl text-[13px] hover:bg-white/50 transition-colors font-medium`}
        >
          <Settings size={18} className="shrink-0 text-gray-500" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Card */}
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center p-2' : 'justify-between p-2.5'
          } bg-white/60 rounded-2xl border border-white/50 shadow-sm`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-bold text-white shadow-sm overflow-hidden ring-2 ring-white shrink-0">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=EAB308&color=fff"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-[12px] font-bold text-gray-900 leading-tight truncate">
                  Admin User
                </div>
                <div className="text-[10px] text-gray-500 font-medium">Administrator</div>
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
              className="text-gray-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-white/80"
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
        className={`hidden md:flex flex-col shrink-0 bg-white/50 backdrop-blur-xl border-r border-white/40 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[270px] bg-white/95 backdrop-blur-2xl border-r border-white/60 z-50 shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
