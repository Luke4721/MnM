import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../context/CurrencyProvider';

export const LocalizationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currency, setCurrency } = useCurrency();

  const handleSelect = (code: any) => {
    setCurrency(code);
    onClose();
  };

  const options = [
    { code: 'INR', name: 'India', flag: '🇮🇳' },
    { code: 'USD', name: 'United States', flag: '🇺🇸' },
    { code: 'EUR', name: 'Europe', flag: '🇪🇺' },
    { code: 'RUB', name: 'Russia', flag: '🇷🇺' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '0.05em' }}>
              Select Region
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleSelect(opt.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: currency === opt.code ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: currency === opt.code ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currency === opt.code ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{opt.flag}</span>
                  <span style={{ fontWeight: 400, letterSpacing: '0.05em' }}>{opt.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{opt.code}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={onClose}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '1rem',
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
