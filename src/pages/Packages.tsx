import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePackages } from '../context/PackagesProvider';
import db from '../data/mnm_database.json';
import { PageTransition } from '../components/PageTransition';
import { TravelSearchEngine } from '../components/TravelSearchEngine';
import { extractPackagePrice } from '../lib/packageUtils';
import { PackageCard } from '../components/PackageCard';

export const Packages: React.FC = () => {
  const { packages: dbPackages } = usePackages();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState({ destination: initialSearch, month: searchParams.get('month') || '', duration: searchParams.get('duration') || '', budget: searchParams.get('budget') || '' });
  const [displayLimit, _setDisplayLimit] = useState(6);

  const setDisplayLimit = (action: number | ((prev: number) => number)) => {
     _setDisplayLimit((prev: number) => {
        const nextVal = typeof action === 'function' ? action(prev) : action;
        
        // FIREWALL: If the app tries to randomly reset to 6 after you clicked load more
        if (nextVal === 6 && prev >= 12) {
           console.error("🚨 FIREWALL ACTIVE: Blocked a phantom reset to 6!");
           console.trace("Culprit traced to:");
           return prev; // 🛑 BLOCKS THE RESET. Forces the UI to stay at 12/18/24
        }
        return nextVal;
     });
  };

  const categories = db.categories;

  const handleSearchChange = (newFilters: any) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.destination);
    setDisplayLimit(6); // reset pagination on search
  };

  const handleDestinationChange = (val: string) => {
    setSearchQuery(val);
    setFilters(prev => ({ ...prev, destination: val }));
    setDisplayLimit(6);
  };

  const filteredPackages = useMemo(() => {
    return dbPackages.filter((pkg) => {
      const activeCatLower = activeCategory.toLowerCase();
      const pkgCategory = (pkg.category || '').toLowerCase();
      const pkgType = (pkg.type || '').toLowerCase();

      let matchesCategory = activeCategory === 'All';
      if (!matchesCategory) {
        if (activeCatLower === 'international') {
          matchesCategory = pkgCategory === 'international' || pkgType === 'international';
        } else if (activeCatLower === 'india') {
          matchesCategory = pkgCategory === 'india' || pkgType === 'domestic' || pkgType === 'india';
        } else {
          matchesCategory = pkgCategory === activeCatLower || pkgType === activeCatLower;
        }
      }

      const matchesSearch =
        (pkg.title || pkg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.location || pkg.locations || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.type || '').toLowerCase().includes(searchQuery.toLowerCase());
        
      let matchesDuration = true;
      if (filters.duration) {
         matchesDuration = (pkg.duration || pkg.nights || '').includes(filters.duration.split('-')[0].replace('0',''));
      }

      const budgetTier = filters.budget?.toLowerCase() || '';
      const priceData = extractPackagePrice(pkg);
      const price = priceData.rawPrice;
      const numericPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
      
      let matchesBudget = true;
      if (budgetTier === 'standard') {
         matchesBudget = numericPrice >= 15000 && numericPrice <= 30000;
      } else if (budgetTier === 'executive') {
         matchesBudget = numericPrice > 30000 && numericPrice <= 50000;
      } else if (budgetTier === 'premium') {
         matchesBudget = numericPrice > 50000;
      } else if (budgetTier === 'unique') {
         matchesBudget = true; // Returns all packages as requested
      }

      return matchesCategory && matchesSearch && matchesDuration && matchesBudget;
    });
  }, [dbPackages, activeCategory, searchQuery, filters.duration, filters.budget]);

  const displayedPackages = filteredPackages.slice(0, displayLimit);
  console.log("Total Filtered:", filteredPackages.length, " | Currently Displaying:", displayedPackages.length, " | displayLimit State:", displayLimit);

  return (
    <PageTransition>
      <div className="w-full bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-zinc-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
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
                onClick={() => { 
                    setSearchQuery('');
                    setFilters({ destination: '', month: '', duration: '', budget: '' });
                    setActiveCategory(cat); 
                    setDisplayLimit(6); 
                }}
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

          {/* GRID WRAPPER - Ensure h-auto and no overflow hiding */}
          <div className="w-full h-auto min-h-screen pb-24">
            {displayedPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPackages.map((pkg, index) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={index} />
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
                  onClick={() => { setSearchQuery(''); setFilters({ destination: '', month: '', duration: '', budget: '' }); setActiveCategory('All'); setDisplayLimit(6); }}
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

          {/* BUTTON WRAPPER - Extreme Z-Index to prevent click blocking */}
          {displayLimit < filteredPackages.length && (
            <div className="relative z-[9999] flex justify-center mt-16 pb-20 w-full pointer-events-auto">
              <button 
                 type="button"
                 onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Load More clicked! Old count:", displayLimit);
                    setDisplayLimit((prev: number) => prev + 6);
                 }} 
                 className="relative z-[10000] px-8 py-3 rounded-full border-2 border-[#D97736] text-[#D97736] font-bold tracking-wide hover:bg-[#D97736] hover:text-white transition-all duration-300 cursor-pointer shadow-xl"
              >
                 LOAD MORE PACKAGES
              </button>
            </div>
          )}
          </div>

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
      </div>
    </PageTransition>
  );
};

export default Packages;