import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import db from '../data/mnm_database.json';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { TiltCard } from '../components/TiltCard';
import { PageTransition } from '../components/PageTransition';

const ImageWithFallback: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return <div className="skeleton-image" style={{ width: '100%', height: '100%', backgroundColor: '#111827' }} />;
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

export const Packages: React.FC = () => {
  const { currency, convertPrice } = useCurrency();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = db.categories;

  const filteredPackages = db.packages.filter((pkg) => {
    const matchesCategory = activeCategory === 'All' || pkg.category === activeCategory;
    const matchesSearch =
      (pkg.title || pkg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.location || pkg.locations || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', width: '100%', position: 'relative', zIndex: 10, paddingBottom: '8rem' }}>
        {/* Physical Spacer for Fixed Nav */}
        <div style={{ height: '140px', width: '100%' }}></div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.03em' }}>
              All Travel <span className="text-gradient">Packages</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.75rem' }}>
              Explore our complete catalog of domestic and international destinations.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto mb-8 relative z-20 flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-2xl shadow-2xl">
            <Search size={24} className="text-white/50 ml-4" />
            <input
              type="text"
              placeholder="Search 25+ curated travel packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none p-4 text-lg text-white placeholder-white/50 font-normal"
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full border font-medium cursor-pointer transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#D97736] border-[#D97736] text-white shadow-[0_4px_14px_rgba(217,119,54,0.4)]'
                    : 'bg-transparent text-white/80 border-white/20 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: (index % 6) * 0.05 }}
              >
                <Link to={`/package/${pkg.id}`} style={{ textDecoration: 'none' }}>
                  <TiltCard>
                    <div className="backdrop-blur-3xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] flex flex-col h-full">
                      <div style={{ height: '240px', position: 'relative' }}>
                        <ImageWithFallback src={pkg.image_url || pkg.img || pkg.image} alt={pkg.title || pkg.name} />
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '999px', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {pkg.nights || pkg.duration}
                        </div>
                      </div>
                      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{pkg.title || pkg.name}</h3>
                        <p className="text-gray-800 dark:text-gray-200" style={{ lineHeight: 1.5, flex: 1, fontSize: '0.95rem' }}>{pkg.location || pkg.locations}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                          <div>
                            <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '0.85rem', display: 'block' }}>Starting from</span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#D97736' }}>
                              <AnimatedNumber
                                value={convertPrice(pkg.priceINR, true) as number}
                                formatFn={(val: number) => {
                                  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;
                                  return `${symbol}${Math.round(val).toLocaleString()}`;
                                }}
                              />
                            </div>
                          </div>
                          <button style={{
                            background: 'var(--text-color)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            width: '2.75rem',
                            height: '2.75rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}>
                            <ArrowRight size={18} />
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
      </div>
    </PageTransition>
  );
};

export default Packages;