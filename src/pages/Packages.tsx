import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import db from '../data/mnm_database.json';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { TiltCard } from '../components/TiltCard';
import { PageTransition } from '../components/PageTransition';
import { TravelSearchEngine } from '../components/TravelSearchEngine';

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
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState({ destination: initialSearch, month: searchParams.get('month') || '', duration: searchParams.get('duration') || '', budget: searchParams.get('budget') || '' });
  const [visibleCount, setVisibleCount] = useState(12);

  const categories = db.categories;

  const handleSearchChange = (newFilters: any) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.destination);
    setVisibleCount(12); // reset pagination on search
  };

  const handleDestinationChange = (val: string) => {
    setSearchQuery(val);
    setFilters(prev => ({ ...prev, destination: val }));
    setVisibleCount(12);
  };

  const filteredPackages = db.packages.filter((pkg) => {
    const matchesCategory = activeCategory === 'All' || pkg.category === activeCategory;
    const matchesSearch =
      (pkg.title || pkg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.location || pkg.locations || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesDuration = true;
    if (filters.duration) {
       matchesDuration = (pkg.duration || pkg.nights || '').includes(filters.duration.split('-')[0].replace('0',''));
    }

    return matchesCategory && matchesSearch && matchesDuration;
  });

  const displayedPackages = filteredPackages.slice(0, visibleCount);

  return (
    <PageTransition>
      <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen relative z-10">
        <div className="w-full">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.03em' }}>
              All Travel <span className="text-gradient">Packages</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.75rem', marginBottom: '2rem' }}>
              Explore our complete catalog of domestic and international destinations.
            </p>
          </div>

          {/* Search Bar Widget */}
          <div className="mb-12">
            <TravelSearchEngine 
              initialDestination={initialSearch} 
              onDestinationChange={handleDestinationChange} 
              onSearch={handleSearchChange} 
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 my-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#D97736] border-[#D97736] text-white shadow-[0_4px_14px_rgba(217,119,54,0.4)]'
                    : 'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80 hover:bg-[#D97736] hover:text-white border-transparent dark:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) */}
          {displayedPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: (index % 6) * 0.05 }}
                >
                  <Link to={`/package/${pkg.id}`} style={{ textDecoration: 'none' }}>
                    <TiltCard>
                      <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] flex flex-col h-full">
                        <div style={{ height: '240px', position: 'relative' }}>
                          <ImageWithFallback src={pkg.image_url || pkg.img || pkg.image} alt={pkg.title || pkg.name} />
                          <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '999px', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {pkg.nights || pkg.duration}
                          </div>
                        </div>
                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{pkg.title || pkg.name}</h3>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1 mb-3" style={{ flex: 1 }}>{pkg.location || pkg.locations}</p>
  
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
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">No exact packages found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                We couldn't find exactly what you were looking for. Please browse our related packages or request a custom itinerary tailored just for you!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => { setSearchQuery(''); setFilters({ destination: '', month: '', duration: '', budget: '' }); setActiveCategory('All'); }}
                  className="px-8 py-3 rounded-full bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white font-bold tracking-widest text-sm hover:bg-gray-300 dark:hover:bg-white/20 transition-all shadow-sm"
                >
                  VIEW ALL PACKAGES
                </button>
                <Link to="/contact">
                  <button className="px-8 py-3 rounded-full bg-[#D97736] text-white font-bold tracking-widest text-sm shadow-[0_4px_14px_rgba(217,119,54,0.4)] hover:scale-105 transition-all">
                    REQUEST CUSTOM PACKAGE
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {visibleCount < filteredPackages.length && (
            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 12)}
                className="bg-transparent border-2 border-[#D97736] text-[#D97736] hover:bg-[#D97736] hover:text-white px-8 py-3 rounded-full font-bold tracking-widest transition-all duration-300 shadow-sm hover:shadow-md"
              >
                LOAD MORE PACKAGES
              </button>
            </div>
          )}

          {/* Custom Trip Button - Permanent */}
          <div className="mt-20 mb-10 flex flex-col items-center justify-center pt-10 border-t border-gray-200 dark:border-white/10">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Can't find exactly what you're looking for?</h4>
            <Link to="/contact">
              <button className="px-8 py-3 rounded-full bg-[#D97736] text-white font-bold tracking-widest text-sm shadow-[0_4px_14px_rgba(217,119,54,0.4)] hover:scale-105 transition-all">
                REQUEST A CUSTOM TRIP
              </button>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Packages;