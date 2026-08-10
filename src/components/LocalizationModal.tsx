import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import ALL_REGIONS from '../data/countries.json';

export const LocalizationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currency, setCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setExpanded(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (search.length > 0) {
      setExpanded(true);
    }
  }, [search]);

  const handleSelect = (code: any) => {
    setCurrency(code);
    onClose();
  };

  const filteredRegions = ALL_REGIONS.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())
  );

  const popularRegions = ALL_REGIONS.filter((r) => r.popular);
  // Re-sort popular to match exact requested order if possible, or just slice top 5
  const top5 = popularRegions.slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="overscroll-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(64px)',
              WebkitBackdropFilter: 'blur(64px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '1.5rem', /* 24px = 2xl */
              width: '90%',
              maxWidth: '550px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              color: '#1D1D1F'
            }}
          >
            {/* Search Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Search size={24} style={{ color: '#666666', marginRight: '1rem' }} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Country or currency..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.25rem',
                  color: '#1D1D1F',
                  width: '100%',
                  fontWeight: 400,
                  caretColor: '#D97736'
                }}
              />
            </div>

            {/* Content List */}
            <div 
              className="max-h-[350px] overflow-y-auto overscroll-contain block w-full custom-scrollbar pointer-events-auto pr-2" 
              style={{ paddingRight: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              onWheel={(e) => e.stopPropagation()}
            >
              
              {/* Popular Destinations (Hidden if searching) */}
              {search === '' && (
                <div>
                  <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#666666', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 600 }}>Top 5 Popular</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {top5.map(opt => (
                      <RegionOption key={`pop-${opt.code}-${opt.name}`} opt={opt} isSelected={currency === opt.code} onSelect={handleSelect} />
                    ))}
                  </div>
                </div>
              )}

              {/* View All Regions Toggle (Hidden if searching) */}
              {search === '' && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: '12px',
                    color: '#1D1D1F',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                >
                  <span style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>View All Regions</span>
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              )}

              {/* All Regions (Visible if expanded OR searching) */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#666666', letterSpacing: '0.1em', marginBottom: '1rem', marginTop: search !== '' ? '0' : '0.5rem', fontWeight: 600 }}>
                      {search === '' ? 'All Regions' : 'Search Results'}
                    </h3>
                    {filteredRegions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {filteredRegions.map((opt, i) => (
                          <RegionOption key={`all-${opt.code}-${opt.name}-${i}`} opt={opt} isSelected={currency === opt.code} onSelect={handleSelect} />
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#666666', textAlign: 'center', padding: '2rem 0' }}>No results found.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RegionOption = ({ opt, isSelected, onSelect }: any) => {
  return (
    <button
      onClick={() => onSelect(opt.code)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: isSelected ? 'rgba(217, 119, 54, 0.15)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: '#1D1D1F',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        textAlign: 'left'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'rgba(217, 119, 54, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected ? 'rgba(217, 119, 54, 0.15)' : 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{opt.flag}</span>
        <span style={{ fontWeight: 500, fontSize: '1rem' }}>{opt.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#666666', fontWeight: 600, fontSize: '0.9rem' }}>{opt.code}</span>
        {isSelected && (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97736' }} />
        )}
      </div>
    </button>
  );
};
