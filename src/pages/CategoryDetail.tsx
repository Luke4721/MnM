import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
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

export const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currency, convertPrice } = useCurrency();
  
  const formattedCategory = slug ? slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase() : '';
  
  const categoryPackages = db.packages.filter(pkg => (pkg.category || '').toLowerCase() === (slug || '').toLowerCase());
  
  const heroImage = categoryPackages.length > 0 
    ? (categoryPackages[0].image_url || categoryPackages[0].img || categoryPackages[0].image)
    : '/images/2667045e2fd96444a1e5a7796a6ab43b.jpg';

  return (
    <PageTransition>
      <div className="min-h-screen relative z-10 bg-gray-50 dark:bg-black">
        {/* Full-width hero image */}
        <div className="relative w-full h-[60vh] md:h-[70vh] -mt-[104px] z-0 overflow-hidden">
          <img src={heroImage} alt={formattedCategory} className="w-full h-full object-cover animate-kenburns scale-105" />
          <div className="absolute inset-0 bg-black/40 z-[1]"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 mt-16">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 text-center drop-shadow-xl">{formattedCategory}</h1>
            <p className="text-xl text-gray-200 text-center max-w-2xl font-medium drop-shadow-md">
              Discover the finest curated {formattedCategory.toLowerCase()} experiences for your next unforgettable journey.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20 relative z-20 pb-24">
          
          {/* Floating summary card */}
          <div className="backdrop-blur-3xl bg-white/80 dark:bg-zinc-900/60 rounded-3xl p-8 mb-16 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why choose {formattedCategory}?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Experience the ultimate getaway with our hand-picked packages. Whether you're seeking relaxation, adventure, or cultural immersion, our {formattedCategory.toLowerCase()} tours offer everything you need for a perfect vacation.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <Link to="/contact">
                <button className="w-full md:w-auto px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest text-sm shadow-[0_4px_14px_rgba(255,0,60,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  CUSTOM ITINERARY <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Packages</h3>
            <span className="text-gray-500 dark:text-gray-400 font-medium">{categoryPackages.length} available</span>
          </div>

          {/* Grid Layout */}
          {categoryPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: (index % 6) * 0.05 }}
                >
                  <Link to={`/packages/${pkg.slug}`} style={{ textDecoration: 'none' }}>
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
                              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FF9933' }}>
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
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">No packages found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                We couldn't find any packages in this category. Please explore our other offerings.
              </p>
              <Link to="/packages">
                <button className="px-8 py-3 rounded-full bg-[#FF9933] text-white font-bold tracking-widest text-sm shadow-[0_4px_14px_rgba(255,0,60,0.4)] hover:scale-105 transition-all">
                  VIEW ALL PACKAGES
                </button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
};
