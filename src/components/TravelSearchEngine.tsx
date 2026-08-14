import React, { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyProvider';

interface TravelSearchEngineProps {
  initialDestination?: string;
  onDestinationChange?: (val: string) => void;
  onSearch?: (filters: any) => void;
  standalone?: boolean;
}

export const TravelSearchEngine: React.FC<TravelSearchEngineProps> = ({ 
  initialDestination = '', 
  onDestinationChange,
  onSearch, 
  standalone = false 
}) => {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [destination, setDestination] = useState(initialDestination);
  const [month, setMonth] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');

  // Sync with prop if it changes
  useEffect(() => {
    setDestination(initialDestination);
  }, [initialDestination]);

  // Debounce destination changes for live filtering on Packages page
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDestinationChange) {
        onDestinationChange(destination);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destination, onDestinationChange]);

  const handleSearch = () => {
    const filters = { destination, month, duration, budget };
    if (onSearch) {
      onSearch(filters);
    }
    if (standalone) {
      const params = new URLSearchParams();
      if (destination) params.set('q', destination);
      if (month) params.set('month', month);
      if (duration) params.set('duration', duration);
      if (budget) params.set('budget', budget);
      navigate(`/packages?${params.toString()}`);
    }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'RUB': return '₽';
      default: return currency + ' ';
    }
  };
  const sym = getCurrencySymbol();

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-3 md:p-4 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-3 relative z-50 max-w-6xl mx-auto">
      {/* Destination Input */}
      <div className="flex-1 w-full relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MapPin size={20} className="text-gray-400" />
        </div>
        <input 
          type="text" 
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Where to? (e.g. Bali, Paris)"
          className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block w-px h-10 bg-gray-300 dark:bg-white/10"></div>

      {/* Travel Month */}
      <div className="w-full md:w-auto min-w-[140px] relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Calendar size={18} className="text-gray-400" />
        </div>
        <select 
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full appearance-none bg-transparent border-none py-3.5 pl-12 pr-8 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-0"
        >
          <option value="" className="dark:bg-zinc-800 text-gray-900 dark:text-white">Any Month</option>
          <option value="Oct 2026" className="dark:bg-zinc-800 text-gray-900 dark:text-white">Oct 2026</option>
          <option value="Nov 2026" className="dark:bg-zinc-800 text-gray-900 dark:text-white">Nov 2026</option>
          <option value="Dec 2026" className="dark:bg-zinc-800 text-gray-900 dark:text-white">Dec 2026</option>
          <option value="Jan 2027" className="dark:bg-zinc-800 text-gray-900 dark:text-white">Jan 2027</option>
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block w-px h-10 bg-gray-300 dark:bg-white/10"></div>

      {/* Duration Toggle Pills */}
      <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2">
        {['02-03', '05-07', '10+'].map(dur => (
          <button 
            key={dur}
            onClick={() => setDuration(duration === dur ? '' : dur)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              duration === dur 
                ? 'bg-[#D97736]/10 text-[#D97736] border border-[#D97736]/50 shadow-sm' 
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-transparent hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {dur} Nights
          </button>
        ))}
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block w-px h-10 bg-gray-300 dark:bg-white/10"></div>

      {/* Budget */}
      <div className="w-full md:w-auto min-w-[160px] relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <DollarSign size={18} className="text-gray-400" />
        </div>
        <select 
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full appearance-none bg-transparent border-none py-3.5 pl-10 pr-8 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-0"
        >
          <option value="" className="dark:bg-zinc-800 text-gray-900 dark:text-white">{sym} Budget Range</option>
          <option value="15-50" className="dark:bg-zinc-800 text-gray-900 dark:text-white">{sym}15,000 - {sym}50,000</option>
          <option value="50-100" className="dark:bg-zinc-800 text-gray-900 dark:text-white">{sym}50,000 - {sym}1,00,000</option>
          <option value="100+" className="dark:bg-zinc-800 text-gray-900 dark:text-white">{sym}1,00,000+</option>
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={handleSearch}
        className="w-full lg:w-auto shrink-0 bg-[#D97736] hover:bg-[#E88A4A] text-white px-6 py-4 rounded-2xl font-bold tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <Search size={20} />
        <span className="hidden lg:inline">SEARCH PACKAGES</span>
        <span className="lg:hidden">SEARCH</span>
      </button>

    </div>
  );
};
