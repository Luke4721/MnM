import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { LocalizationModal } from './components/LocalizationModal';
import { SmoothScroll } from './components/SmoothScroll';
import { MagneticButton } from './components/MagneticButton';

const links = [
  { path: '/', label: 'HOME' },
  { path: '/about', label: 'ABOUT' },
  { path: '/services', label: 'SERVICES' },
  { path: '/contact', label: 'CONTACT' },
];

function App() {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  // Show modal on first load if no currency is set (or just demoing it here)
  useEffect(() => {
    // In a real app we check localStorage
    const hasSeenModal = sessionStorage.getItem('hasSeenLocalization');
    if (!hasSeenModal) {
      setModalOpen(true);
      sessionStorage.setItem('hasSeenLocalization', 'true');
    }
  }, []);

  return (
    <SmoothScroll>
      <header className="pill-header">
        <MagneticButton radius={15}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.1em', padding: '0 1rem' }}>
            <NavLink to="/">MNM TRAVELS</NavLink>
          </div>
        </MagneticButton>
        <nav className="pill-nav-links">
          {links.map((link) => (
            <MagneticButton key={link.path} radius={10}>
              <NavLink 
                to={link.path} 
                style={{ position: 'relative' }}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>{link.label}</span>
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="pill-nav"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '999px',
                      zIndex: 0
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            </MagneticButton>
          ))}
        </nav>
        
        {/* Localization Globe Button */}
        <MagneticButton radius={15}>
          <button 
            onClick={() => setModalOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '1rem'
            }}
          >
            <Globe size={18} />
          </button>
        </MagneticButton>
      </header>

      <LocalizationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatePresence>
    </SmoothScroll>
  );
}

export default App;
