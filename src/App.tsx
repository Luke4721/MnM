import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, Languages } from 'lucide-react';
import db from './data/mnm_database.json';
import { Home } from './pages/Home';
import { About } from './pages/About';
import PackageDetail from './pages/PackageDetail.tsx';
import Packages from './pages/Packages.tsx';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Gallery } from './pages/Gallery.tsx';
import { CategoryDetail } from './pages/CategoryDetail.tsx';
import { LocalizationModal } from './components/LocalizationModal';
import { SmoothScroll } from './components/SmoothScroll';
import LanguagePrompt from './components/LanguagePrompt';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminPackages } from './admin/pages/AdminPackages';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminInbox } from './admin/pages/AdminInbox';


function App() {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Modal state strictly relies on user interaction
  useEffect(() => {
    // Purged rogue persistence logic
  }, []);

  return (
    <>
      {!isAdminRoute && <LanguagePrompt />}
      <SmoothScroll>
        {!isAdminRoute && (
          <div className="fixed inset-0 z-[-5] backdrop-blur-2xl bg-white/10 dark:bg-black/40 border-y border-white/20 pointer-events-none" />
        )}
        
        {!isAdminRoute && (
          <nav className="fixed top-0 left-0 w-full z-[100] rounded-none px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 shadow-md transition-all duration-300">
            <div className="flex items-center justify-between w-full md:w-auto">
              <NavLink to="/" className="group flex items-center gap-2 md:gap-4 transition-transform duration-300 hover:scale-105 cursor-pointer text-gray-900 dark:text-white no-underline">
                <img src={db.company.logo_url} alt={db.company.name} className="h-8 md:h-10 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,0,60,0.8)]" />
                <span className="hidden sm:inline-block font-bold text-base md:text-lg tracking-widest transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,0,60,0.8)] group-hover:text-[#FF9933]">MNM TRAVELS</span>
              </NavLink>
              
              <div className="flex md:hidden items-center gap-3">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-800 dark:text-white">
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full md:w-auto mt-6 md:mt-0 text-sm font-semibold tracking-widest text-gray-800 dark:text-white/80 transition-colors duration-300`}>
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800">HOME</NavLink>
              <NavLink to="/packages" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit font-semibold w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800">DESTINATIONS</NavLink>
              <NavLink to="/gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800">GALLERY</NavLink>
              <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800">ABOUT</NavLink>
              <NavLink to="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800">BLOG</NavLink>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800">CONTACT</Link>
              
              {/* Mobile Quick Actions */}
              <div className="flex md:hidden w-full items-center justify-between pt-2 pb-4">
                <button onClick={() => { window.dispatchEvent(new Event('openLanguagePrompt')); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <div className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full"><Languages size={18} /></div>
                  <span className="text-xs uppercase tracking-wider">Language</span>
                </button>
                <button onClick={() => { setModalOpen(true); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <div className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full"><Globe size={18} /></div>
                  <span className="text-xs uppercase tracking-wider">Currency</span>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-4 ml-2">
                <button
                  onClick={() => window.dispatchEvent(new Event('openLanguagePrompt'))}
                  className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full hover:bg-gray-300/50 dark:hover:bg-white/20 transition-colors text-gray-800 dark:text-white border border-gray-300/50 dark:border-white/10 cursor-pointer"
                  title="Change Language"
                >
                  <Languages size={18} />
                </button>

                <button onClick={() => setModalOpen(true)} className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full hover:bg-gray-300/50 dark:hover:bg-white/20 transition-colors text-gray-800 dark:text-white border border-gray-300/50 dark:border-white/10 cursor-pointer" title="Change Currency"><Globe size={18} /></button>
                <button onClick={() => setIsDark(!isDark)} className="w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 relative transition-colors duration-300 flex items-center px-1 cursor-pointer shadow-inner">
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex md:hidden items-center justify-between w-full pt-4">
                <span className="text-xs text-gray-500 uppercase">Dark Mode</span>
                <button onClick={() => setIsDark(!isDark)} className="w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 relative transition-colors duration-300 flex items-center px-1 cursor-pointer shadow-inner">
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </nav>
        )}


      {!isAdminRoute && <LocalizationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}

      <div className="min-h-screen w-full relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="inbox" element={<AdminInbox />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:slug" element={<PackageDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/category/:slug" element={<CategoryDetail />} />
          </Routes>
        </AnimatePresence>
      </div>
      </SmoothScroll>
    </>
  );
}

export default App;
