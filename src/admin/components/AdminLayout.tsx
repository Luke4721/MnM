import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../auth';
import { AdminSidebar } from './layout/AdminSidebar';
import { AdminHeader } from './layout/AdminHeader';
import { ToastProvider } from '../context/ToastContext';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate, location]);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!isAdminAuthenticated()) return null;

  return (
    <ToastProvider>
      <div
        className="flex h-screen w-screen overflow-hidden bg-wave-gradient dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onLogout={() => navigate('/admin/login')}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 min-w-0">
          {/* Header */}
          <AdminHeader
            onOpenMobile={() => setMobileOpen(true)}
            onLogout={() => navigate('/admin/login')}
          />

          {/* Page Content Viewport */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10"
            data-lenis-prevent
          >
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};
