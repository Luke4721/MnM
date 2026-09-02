import { useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../auth';
import { LayoutDashboard, Inbox, Folder, FileText, Lock, FilePlus, User, Settings, Bell, Plus, UserCircle, LogOut } from 'lucide-react';
import db from '../../data/mnm_database.json';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate, location]);

  if (!isAdminAuthenticated()) return null;

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden bg-wave-gradient text-gray-900"
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Sidebar */}
      <aside className="w-[260px] bg-white/50 backdrop-blur-xl border-r border-white/40 flex flex-col shrink-0 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-[72px] px-6 flex items-center gap-3 border-b border-white/40 shrink-0">
          <img src={db.company.logo_url} alt="Logo" className="h-8 w-8 object-contain drop-shadow-sm shrink-0" />
          <span className="font-extrabold text-[14px] tracking-tight text-gray-900 leading-tight">{db.company.name}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" data-lenis-prevent>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Main</div>
            <div className="space-y-0.5">
              <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 bg-white/80 text-gray-900 rounded-xl font-semibold text-[13px] transition-colors shadow-sm border border-white/60">
                <LayoutDashboard size={16} className="text-indigo-500" /> Dashboard
              </Link>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">App</div>
            <div className="space-y-0.5">
              <Link to="/admin/inbox" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl text-[13px] transition-colors font-medium">
                <div className="flex items-center gap-3"><Inbox size={16} /> Inbox</div>
                <span className="bg-white/80 text-gray-600 font-bold text-[10px] px-1.5 py-0.5 rounded-md shadow-sm border border-white/40">1</span>
              </Link>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">User</div>
            <div className="space-y-0.5">
              <Link to="/admin/packages" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl text-[13px] transition-colors font-medium"><Folder size={16} /> File Management</Link>
              <Link to="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl text-[13px] transition-colors font-medium"><FileText size={16} /> Blog</Link>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Extra</div>
            <div className="space-y-0.5">
              <Link to="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl text-[13px] transition-colors font-medium"><Lock size={16} /> Authentication</Link>
              <Link to="#" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl text-[13px] transition-colors font-medium">
                <div className="flex items-center gap-3"><FilePlus size={16} /> Pages</div>
                <Plus size={14} />
              </Link>

            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Account</div>
            <div className="space-y-0.5">
              <Link to="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl text-[13px] transition-colors font-medium"><User size={16} /> Account</Link>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/40 shrink-0">
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-xl text-[13px] transition-colors mb-2 font-medium"><Settings size={16} /> Settings</Link>
          <div className="flex items-center justify-between bg-white/60 p-2.5 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-white shadow-sm overflow-hidden ring-2 ring-white"><img src="https://ui-avatars.com/api/?name=Admin+User&background=EAB308&color=fff" alt="User" /></div>
              <div>
                <div className="text-[13px] font-bold text-gray-900 leading-tight">Admin User</div>
                <div className="text-[11px] text-gray-600 font-medium">Pro User</div>
              </div>
            </div>
            <button className="text-gray-500 hover:text-rose-500 transition-colors p-1.5"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Topbar */}
        <header className="h-[72px] bg-white/40 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-8 shrink-0 relative z-20 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
            <div className="p-1.5 border border-white/60 rounded-md flex items-center justify-center bg-white/60 text-gray-500 shadow-sm"><LayoutDashboard size={14} /></div>
            <span className="font-medium text-gray-700">Dashboards</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-bold">Default</span>
          </div>

          <div className="flex items-center gap-5">

            
            <div className="flex items-center gap-2 border-l border-white/40 pl-5">
              <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-white/60 hover:bg-white/80 border border-white/60 rounded-xl transition-all shadow-sm"><Plus size={16} /></button>
              <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-white/60 hover:bg-white/80 border border-white/60 rounded-xl transition-all shadow-sm relative">
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>
              <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-white/60 hover:bg-white/80 border border-white/60 rounded-xl transition-all shadow-sm"><UserCircle size={16} /></button>
              <button className="ml-2 px-5 py-2 bg-gradient-to-r from-rose-500/90 to-indigo-500/90 backdrop-blur-md border border-white/20 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                Export <span className="flex items-center justify-center w-4 h-4 bg-white/20 rounded border border-white/30 text-[10px]">⌘</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10" data-lenis-prevent>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
