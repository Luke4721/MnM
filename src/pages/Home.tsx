import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plane, MapPin, Mail, ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import db from '../data/mnm_database.json';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { TiltCard } from '../components/TiltCard';
import { GlobeReveal } from '../components/GlobeReveal';

const ImageWithFallback: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return <div className="skeleton-image" style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

export const Home: React.FC = () => {
  const { currency, convertPrice } = useCurrency();
  const { scrollYProgress: heroScroll } = useScroll();
  const plungeOpacity = useTransform(heroScroll, [0, 0.3], [0, 0.9]);

  // Airplane Scroll Refs
  const airplaneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: airProgress } = useScroll({
    target: airplaneRef,
    offset: ["start start", "end end"]
  });

  // Background Opacities for Airplane
  const opAlps = useTransform(airProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const opMaldives = useTransform(airProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]);
  const opAmalfi = useTransform(airProgress, [0.6, 0.7, 1], [0, 1, 1]);

  // Parallax Scale
  const bgScale = useTransform(airProgress, [0, 1], [1, 1.2]);

  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(airProgress, "change", (latest) => {
    if (latest < 0.3) setActiveIndex(0);
    else if (latest < 0.65) setActiveIndex(1);
    else setActiveIndex(2);
  });

  const scrollTexts = [
    { title: "Swiss Alps", label: "Economy Elite", desc: "Experience the majestic peaks and pristine snowscapes of the ultimate winter destination." },
    { title: "The Maldives", label: "Business Class", desc: "Crystal clear waters and private overwater bungalows for an unforgettable escape." },
    { title: "Amalfi Coast", label: "First Class Suite", desc: "Unmatched luxury and breathtaking cliffside views in the heart of Italy." },
  ];

  const [activeCategory, setActiveCategory] = useState('All');
  const tabs = db.categories;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPackages = db.packages.filter(pkg => {
    const matchesCategory = activeCategory === 'All' || pkg.category === activeCategory;
    const matchesSearch = (pkg.name || pkg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (pkg.highlights || pkg.locations || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (pkg.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative z-10 w-full">
      <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none overflow-hidden">
        <GlobeReveal />
      </div>
      
      {/* Plunge Overlay */}
      <motion.div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'var(--bg-color)', 
          opacity: plungeOpacity, 
          zIndex: -1,
          pointerEvents: 'none'
        }} 
      />

      {/* Section 1: Hero */}
      <div className="pt-28 md:pt-36" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', minHeight: '100vh', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 10, pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#D97736', color: '#ffffff', padding: '8px 24px', borderRadius: '9999px', fontWeight: 'bold', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            MONKS & MONKEYS TRAVELS
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: '900', color: '#ffffff', textShadow: '0 10px 30px rgba(0,0,0,0.8)', lineHeight: '1', margin: '0' }}>
            DISCOVER THE<br/>EXTRAORDINARY
          </h1>
          <p style={{ color: '#ffffff', fontSize: '1.25rem', marginTop: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontWeight: '500' }}>
            Travel because life is too short to stay in one place.
          </p>
        </div>
      </div>

      {/* Section 2: Airplane Scroll Experience */}
      <div ref={airplaneRef} className="relative z-10 w-full pt-40 md:pt-48 mt-10" style={{ height: '300vh' }}>
        <div className="pt-28 md:pt-36" style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          width: '100%', 
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-color)',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
          zIndex: 5
        }}>
          
          {/* Airplane Window Cutout */}
          <div style={{
            width: '90%',
            maxWidth: '450px',
            height: '70vh',
            maxHeight: '750px',
            background: '#000',
            borderRadius: '160px', /* airplane window shape */
            border: '12px solid rgba(255, 255, 255, 0.8)',
            boxShadow: 'inset 0 20px 50px rgba(0,0,0,0.5), 0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
            marginRight: 'auto',
            marginLeft: '15%'
          }}>
            
            {/* Background Layers */}
            <motion.div style={{ position: 'absolute', inset: -50, scale: bgScale, opacity: opAlps }}>
              <img src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200&auto=format&fit=crop" alt="Alps" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            
            <motion.div style={{ position: 'absolute', inset: -50, scale: bgScale, opacity: opMaldives }}>
              <img src="https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=1200&auto=format&fit=crop" alt="Maldives" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>

            <motion.div style={{ position: 'absolute', inset: -50, scale: bgScale, opacity: opAmalfi }}>
              <img src="https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?q=80&w=1200&auto=format&fit=crop" alt="Amalfi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>

            {/* Inner Window Glare */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
              zIndex: 10
            }} />
          </div>

          {/* Cabin Shadow Overlays */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.1) 100%)',
            pointerEvents: 'none',
            zIndex: 3
          }} />

          {/* Text Overlays beside window */}
          <div style={{ position: 'absolute', right: '15%', top: '50%', transform: 'translateY(-50%)', zIndex: 4, width: '350px', height: '250px', pointerEvents: 'none' }}>
            {scrollTexts.map((text, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div 
                  key={idx}
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(2rem)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  <h4 style={{ color: '#D97736', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{text.label}</h4>
                  <h2 style={{ fontSize: '4rem', fontWeight: 600, color: 'var(--text-color)', lineHeight: 1.1, margin: '1rem 0' }}>{text.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{text.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Prime Destinations Grid */}
      <div className="pt-40 md:pt-48 mt-10" style={{ padding: '0 2rem 8rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <div className="relative max-w-4xl mx-auto mb-10">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-white/50">🔍</span>
          </div>
          <input 
            type="text" 
            placeholder="Where will you go next?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#050B14]/50 border border-gray-300 dark:border-white/10 rounded-full pl-14 pr-32 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-[#D97736] shadow-sm dark:shadow-none transition-all" 
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D97736] hover:bg-[#E88A4A] text-white px-8 py-2.5 rounded-full font-bold text-sm tracking-wider transition-colors shadow-md">
            SEARCH
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '3rem', color: 'var(--text-color)', fontWeight: 600, letterSpacing: '-0.03em' }}>Prime Destinations</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>Curated domestic and international experiences.</p>
          </div>
          
          <div className="relative z-10 mb-8" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveCategory(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: activeCategory === tab ? '#D97736' : 'var(--glass-border)',
                  background: activeCategory === tab ? '#D97736' : 'transparent',
                  color: activeCategory === tab ? '#FFFFFF' : 'var(--text-color)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-8 md:p-12 mt-12 rounded-[3rem] bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/20 dark:bg-black/20 rounded-full blur-3xl pointer-events-none z-[-1]"></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '3rem' }}>
            {filteredPackages.slice(0, 3).map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/package/${pkg.id}`} style={{ textDecoration: 'none' }}>
                <TiltCard>
                <div 
                  className="backdrop-blur-3xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] flex flex-col h-full"
                >
                  <div style={{ height: '250px', position: 'relative' }}>
                    <ImageWithFallback src={pkg.img || pkg.image_url || pkg.image} alt={pkg.name || pkg.title} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '999px', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {pkg.days || pkg.nights || pkg.duration}
                    </div>
                  </div>
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>{pkg.name || pkg.title}</h3>
                    <p className="text-gray-800 dark:text-gray-200" style={{ lineHeight: 1.6, flex: 1 }}>{pkg.highlights || pkg.location}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                      <div>
                        <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '0.9rem', display: 'block' }}>Starting from</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#D97736' }}>
                          <AnimatedNumber value={convertPrice(pkg.priceINR, true) as number} formatFn={(val) => {
                            const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;
                            return `${symbol}${Math.round(val).toLocaleString()}`;
                          }} />
                        </div>
                      </div>
                      <button style={{
                        background: 'var(--text-color)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
              </Link>
            </motion.div>
          ))}
          </div>
        </div>
        <div className="text-center mt-12">
          <Link to="/packages" className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold tracking-widest backdrop-blur-md transition-all duration-300">
            VIEW ALL DESTINATIONS
          </Link>
        </div>
      </div>
      
      {/* Section 4: Travel Blogs & Newsletter */}
      <div className="relative z-20 backdrop-blur-3xl bg-white/70 dark:bg-black/40 border-t border-white/20 dark:border-white/10 mt-20 pt-16 pb-12 px-6 md:px-12 shadow-2xl">
        <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: '5rem 3rem', borderRadius: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Plane size={48} color="#D97736" style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '1rem' }}>Join the Journey</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem' }}>Subscribe to our exclusive newsletter to receive early access to first-class deals and insider travel guides.</p>
          
          <div style={{ display: 'flex', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <Mail size={24} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Enter your email address"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid var(--text-color)',
                padding: '1.5rem 1rem 1.5rem 3.5rem',
                fontSize: '1.1rem',
                color: 'var(--text-color)',
                outline: 'none'
              }}
            />
            <button style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

