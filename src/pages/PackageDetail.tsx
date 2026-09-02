import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ChevronDown, Check, ArrowRight, Shield, CreditCard, ChevronLeft } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import { PageTransition } from '../components/PageTransition';
import { EnquiryModal } from '../components/EnquiryModal';

import { AnimatedNumber } from '../components/AnimatedNumber';
import { TiltCard } from '../components/TiltCard';
import { usePackages } from '../context/PackagesProvider';

export const PackageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currency, convertPrice } = useCurrency();
  const { packages: dbPackages, loading } = usePackages();
  const [activeDay, setActiveDay] = useState<number | null>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Fallback to id if slug is not found (for backwards compatibility)
  const pkg = dbPackages.find(p => p.slug === slug || p.id.toString() === slug);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>Loading package...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white relative z-10 flex flex-col items-center justify-center transition-colors duration-500">
        <h2 className="text-4xl font-extrabold mb-4">Package Not Found</h2>
        <p className="text-gray-500 mb-8">The travel package you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/packages')} className="px-8 py-3 bg-[#FF9933] text-white rounded-full font-bold tracking-widest shadow-[0_4px_14px_rgba(255,0,60,0.4)]">
          BROWSE ALL PACKAGES
        </button>
      </div>
    );
  }

  // Handle compatibility for both schemas
  const imageUrl = pkg.heroImage || pkg.image_url || pkg.image || pkg.img;
  const location = pkg.destination || pkg.location || pkg.locations || pkg.highlights_old;
  
  const relatedPackages = React.useMemo(() => {
    if (!location) return [];
    const locLower = location.toLowerCase();
    return dbPackages.filter((p: any) => {
        if (p.id === pkg.id) return false;
        const pLoc = (p.destination || p.location || p.locations || p.highlights_old || '').toLowerCase();
        return pLoc === locLower || (pLoc && locLower && (pLoc.includes(locLower) || locLower.includes(pLoc)));
    }).slice(0, 3);
  }, [location, pkg.id, dbPackages]);
  
  const variants = pkg.variants && pkg.variants.length > 0 ? [
    {
      id: 'base',
      name: 'Standard',
      priceINR: pkg.startingPrice || pkg.priceINR || 0,
      duration: pkg.durationNights ? `${pkg.durationNights} Nights / ${pkg.durationDays} Days` : pkg.nights || pkg.duration || pkg.days
    },
    ...pkg.variants
  ] : null;

  const activeVariant = variants ? variants[selectedVariantIdx] : null;
  const nights = activeVariant ? activeVariant.duration : (pkg.durationNights ? `${pkg.durationNights} Nights / ${pkg.durationDays} Days` : pkg.nights || pkg.duration || pkg.days);
  const priceValue = activeVariant ? activeVariant.priceINR : (pkg.startingPrice || pkg.priceINR || 0);

  const convertedPrice = Math.round(convertPrice(priceValue, true) as number);
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;

  return (
    <PageTransition>
      <div className="w-full -mt-[120px] min-h-screen bg-[#faf9f6] dark:bg-black text-gray-900 dark:text-white relative z-10 pb-24 transition-colors duration-500 font-sans">
        
        {/* Physical Spacer for Nav */}
        <div className="h-[100px] w-full bg-transparent sticky top-0 z-40 hidden md:block pointer-events-none"></div>
        
        {/* Floating Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-28 left-6 md:left-12 z-50 p-3 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-gray-200 dark:border-white/20 shadow-xl hover:scale-110 transition-transform duration-300 text-gray-800 dark:text-white group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* ABSOLUTE BACKGROUND - Ignores all parent padding */}
        <div className="absolute inset-x-0 top-0 h-[55vh] md:h-[70vh] z-0 overflow-hidden bg-black">
          <img 
            src={imageUrl} 
            alt={pkg.title} 
            className="w-full h-full object-cover animate-kenburns scale-105"
          />
          {/* Gradient fade into the background color */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/20 to-transparent dark:from-black dark:via-black/20" />
        </div>

        {/* CONTENT WRAPPER - Pushed down to sit over the fade */}
        <div className="relative z-10 pt-[45vh] md:pt-[55vh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Text Content */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white text-xs font-bold tracking-widest uppercase shadow-sm">
                  {nights}
                </span>
                {pkg.rating && (
                  <span className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star size={14} className="fill-[#FF9933] text-[#FF9933]" /> {pkg.rating} ({pkg.reviewsCount} reviews)
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-full bg-[#FF9933] text-white text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,0,60,0.4)]">
                  {pkg.category}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg leading-tight mb-4">
                {pkg.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2 drop-shadow-md">
                <MapPin className="text-[#FF9933]" /> {location}
              </p>
            </motion.div>
          </div>

          {/* Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-24 relative">
            
            {/* Left Column (Overview, Itinerary) */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* Overview Section */}
            {pkg.overview && (
              <motion.section 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Overview</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {pkg.overview}
                </p>
              </motion.section>
            )}

            {/* Highlights (Frosted Pills) */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mb-16"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Experience Highlights</h2>
                <div className="flex flex-wrap gap-3">
                  {(Array.isArray(pkg.highlights) ? pkg.highlights : [pkg.highlights]).map((highlight: string, idx: number) => (
                    <div key={idx} className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#FF9933]/10 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-[#FF9933]" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Itinerary Accordion */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((item: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`overflow-hidden rounded-3xl border transition-all duration-300 ${activeDay === item.day ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/20 shadow-lg' : 'bg-transparent border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30'}`}
                    >
                      <button 
                        onClick={() => setActiveDay(activeDay === item.day ? null : item.day)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer outline-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${activeDay === item.day ? 'bg-[#FF9933] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                            D{item.day}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                        </div>
                        <ChevronDown className={`transition-transform duration-300 text-gray-400 ${activeDay === item.day ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeDay === item.day && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 ml-[76px]"
                          >
                            {item.description}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Inclusions & Exclusions */}
            {((pkg.inclusions?.length ?? 0) > 0 || (pkg.exclusions?.length ?? 0) > 0) && (
              <motion.section 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {(pkg.inclusions?.length ?? 0) > 0 && (
                  <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-gray-200 dark:border-white/10">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                      <Check className="text-green-500" /> What's Included
                    </h3>
                    <ul className="space-y-3">
                      {pkg.inclusions?.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(pkg.exclusions?.length ?? 0) > 0 && (
                  <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-gray-200 dark:border-white/10">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-red-500 font-bold text-lg leading-none">✕</span> Not Included
                    </h3>
                    <ul className="space-y-3">
                      {pkg.exclusions?.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.section>
            )}
            
            {/* Related Packages */}
            {relatedPackages.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">More in {location}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedPackages.map((relPkg: any, index: number) => (
                    <motion.div
                      key={relPkg.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ delay: (index % 6) * 0.05 }}
                    >
                      <Link to={`/packages/${relPkg.slug || relPkg.id}`} style={{ textDecoration: 'none' }} onClick={() => window.scrollTo(0,0)}>
                        <TiltCard>
                          <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] flex flex-col h-full">
                            <div style={{ height: '180px', position: 'relative' }}>
                              <img src={relPkg.image_url || relPkg.img || relPkg.image || relPkg.heroImage} alt={relPkg.title || relPkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.3rem 0.8rem', borderRadius: '999px', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>
                                <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                {relPkg.nights || relPkg.duration || (relPkg.durationNights ? `${relPkg.durationNights}N/${relPkg.durationDays}D` : '')}
                              </div>
                            </div>
                            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">{relPkg.title || relPkg.name}</h3>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 mb-2" style={{ flex: 1 }}>
                                {relPkg.location || relPkg.locations || relPkg.destination}
                              </p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
                                <div>
                                  <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '0.7rem', display: 'block' }}>Starting from</span>
                                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FF9933' }}>
                                    <AnimatedNumber
                                      value={Math.round(convertPrice(relPkg.startingPrice || relPkg.priceINR || 0, true) as number)}
                                      formatFn={(val: number) => {
                                        const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;
                                        return `${sym}${Math.round(val).toLocaleString()}`;
                                      }}
                                    />
                                  </div>
                                </div>
                                <button style={{
                                  background: '#FF9933',
                                  color: 'white',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '999px',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}>
                                  View <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </TiltCard>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            </div>

            {/* Right Column (Booking Card) */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-32 z-20 w-full">
              <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[40px] p-8 shadow-2xl border border-white dark:border-white/10 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9933]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <div className="mb-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs">
                    Price from
                  </div>
                  <div className="flex items-end gap-2 mb-8">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                      {symbol}{convertedPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 mb-1">/ person</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <Star className="text-[#FF9933]" />
                        <span className="font-medium text-gray-700 dark:text-gray-200">Travelers</span>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">2 Adults</div>
                    </button>
                  </div>

                  {variants && (
                    <div className="mb-8">
                      <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Package Options</div>
                      <div className="flex flex-col gap-2">
                        {variants.map((v: any, idx: number) => (
                          <button
                            key={v.id || idx}
                            onClick={() => setSelectedVariantIdx(idx)}
                            className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 ${
                              selectedVariantIdx === idx 
                                ? 'border-[#FF9933] bg-[#FF9933]/10 shadow-md ring-1 ring-[#FF9933]' 
                                : 'border-gray-200 dark:border-white/10 hover:border-[#FF9933]/50 bg-white/50 dark:bg-white/5'
                            }`}
                          >
                            <span className={`font-bold text-base ${selectedVariantIdx === idx ? 'text-[#FF9933]' : 'text-gray-900 dark:text-white'}`}>
                              {v.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {v.duration}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 rounded-full bg-[#FF9933] text-white font-bold text-lg shadow-[0_8px_24px_rgba(255,0,60,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,0,60,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Enquire Now <ArrowRight size={20} />
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1"><Shield size={14} /> Secure Payment</div>
                    <div className="flex items-center gap-1"><CreditCard size={14} /> Flexible Booking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>
        </div>
      </div>
      
      <EnquiryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName={pkg.title}
        variantName={activeVariant?.name}
      />
    </PageTransition>
  );
};

export default PackageDetail;
