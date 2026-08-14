import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import db from './data/mnm_database.json';
import { Home } from './pages/Home';
import { About } from './pages/About';
import PackageDetails from './pages/PackageDetails.tsx';
import Packages from './pages/Packages.tsx';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { LocalizationModal } from './components/LocalizationModal';
import { SmoothScroll } from './components/SmoothScroll';


function App() {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Modal state strictly relies on user interaction
  useEffect(() => {
    // Purged rogue persistence logic
  }, []);

  return (
    <SmoothScroll>
      <div className="fixed inset-0 z-[-5] backdrop-blur-2xl bg-white/10 dark:bg-black/40 border-y border-white/20 pointer-events-none" />
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-full px-8 py-4 flex items-center justify-between shadow-2xl transition-all duration-300">
        <NavLink to="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105 cursor-pointer text-gray-900 dark:text-white no-underline">
          <img src={db.company.logo_url} alt={db.company.name} className="h-9 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(217,119,54,0.8)]" />
          <span className="font-bold text-lg tracking-widest transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(217,119,54,0.8)] group-hover:text-[#D97736]">MNM TRAVELS</span>
        </NavLink>

        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-widest text-gray-800 dark:text-white/80 transition-colors duration-300">
          <NavLink to="/" className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit">HOME</NavLink>
          <NavLink to="/packages" className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit">PACKAGES</NavLink>
          <NavLink to="/about" className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit">ABOUT</NavLink>
          <NavLink to="/services" className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit">SERVICES</NavLink>
          <NavLink to="/contact" className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit">CONTACT</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setModalOpen(true)}
            className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full hover:bg-gray-300/50 dark:hover:bg-white/20 transition-colors text-gray-800 dark:text-white border border-gray-300/50 dark:border-white/10 cursor-pointer"
          >
            <Globe size={18} />
          </button>
          <button onClick={() => setIsDark(!isDark)} className="w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 relative transition-colors duration-300 flex items-center px-1 cursor-pointer shadow-inner">
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>
      </nav>

      <LocalizationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className={`${location.pathname === '/' ? '' : '!pt-[120px]'} min-h-screen w-full relative z-10`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/package/:id" element={<PackageDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AnimatePresence>
      </div>
    </SmoothScroll>
  );
}

export default App;
