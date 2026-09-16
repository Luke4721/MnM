import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import PackageDetail from './pages/PackageDetail.tsx';
import Packages from './pages/Packages.tsx';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Pay } from './pages/Pay';
import { Gallery } from './pages/Gallery.tsx';
import { CategoryDetail } from './pages/CategoryDetail.tsx';
import { LocalizationModal } from './components/LocalizationModal';
import { SmoothScroll } from './components/SmoothScroll';
import LanguagePrompt from './components/LanguagePrompt';

// Blog routes are lazy-loaded so the migrated blog content (a multi-MB JSON)
// stays out of the initial bundle and is fetched only on /blog visits.
const Blog = lazy(() => import('./pages/Blog').then((m) => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })));
const AdminBlogs = lazy(() => import('./admin/pages/AdminBlogs').then((m) => ({ default: m.AdminBlogs })));
const AdminBlogEditor = lazy(() => import('./admin/pages/AdminBlogEditor').then((m) => ({ default: m.AdminBlogEditor })));
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminPackages } from './admin/pages/AdminPackages';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminInbox } from './admin/pages/AdminInbox';


function App() {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');
  // /pay is an unlisted internal page — it renders without the public site chrome.
  const isStandaloneRoute = isAdminRoute || location.pathname.startsWith('/pay');

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
      {!isStandaloneRoute && <LanguagePrompt />}
      <SmoothScroll>
        {!isStandaloneRoute && (
          <div className="fixed inset-0 z-[-5] backdrop-blur-2xl bg-white/10 dark:bg-black/40 border-y border-white/20 pointer-events-none" />
        )}
        
        {!isStandaloneRoute && (
          <Navbar
            onOpenCurrencyModal={() => setModalOpen(true)}
            isDark={isDark}
            onToggleDarkMode={() => setIsDark(!isDark)}
          />
        )}


      {!isStandaloneRoute && <LocalizationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}

      <div className="min-h-screen w-full relative z-10">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="min-h-screen" />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="inbox" element={<AdminInbox />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="blogs/create" element={<AdminBlogEditor />} />
              <Route path="blogs/edit/:id" element={<AdminBlogEditor />} />
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
            {/* Unlisted internal payment desk — intentionally absent from the nav */}
            <Route path="/pay" element={<Pay />} />
          </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
      </SmoothScroll>
    </>
  );
}

export default App;
