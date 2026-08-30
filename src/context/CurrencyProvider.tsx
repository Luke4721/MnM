import React, { createContext, useContext, useState, type ReactNode } from 'react';

type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'RUB' | 'AED' | 'JPY' | 'CNY' | 'SGD' | 'CHF';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convertPrice: (priceInINR: number, raw?: boolean) => string | number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Static fallback rates for demo mode
const RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.0125,
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  CAD: 0.016,
  RUB: 1.15,
  AED: 0.044,
  JPY: 1.80,
  CNY: 0.086,
  SGD: 0.016,
  CHF: 0.011,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  RUB: '₽',
  AED: 'د.إ',
  JPY: '¥',
  CNY: '¥',
  SGD: 'S$',
  CHF: 'CHF',
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('INR'); // Default strictly INR

  const convertPrice = (priceInINR: number, raw?: boolean) => {
    const converted = priceInINR * RATES[currency];
    if (raw) return converted;
    return `${SYMBOLS[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
