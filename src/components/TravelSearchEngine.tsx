import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePackages } from '../context/PackagesProvider';

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
  const { packages: dbPackages } = usePackages();

  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [budget, setBudget] = useState('');
  const [searchFor, setSearchFor] = useState('Families');
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const allDestinations = Array.from(new Set([
    ...dbPackages.flatMap(p => p.location ? p.location.split(', ') : []),
    ...dbPackages.map(p => p.title || p.name)
  ])).filter(Boolean).filter(d => d !== 'Outbound Itineraries').sort();
  const matchedDestinations = destination ? allDestinations.filter(d => d.toLowerCase().includes(destination.toLowerCase())) : allDestinations.slice(0, 10);

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    if (checkOut && newCheckIn && checkOut < newCheckIn) {
      setCheckOut('');
    }
  };

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
    const filters = { destination, searchFor, checkIn, checkOut, guests, budget };
    if (onSearch) {
      onSearch(filters);
    }
    if (standalone) {
      const params = new URLSearchParams();
      if (destination) params.set('q', destination);
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);
      if (guests) params.set('guests', guests);
      if (budget) params.set('budget', budget);
      navigate(`/packages?${params.toString()}`);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto relative z-50 mb-10 mt-2 font-sans">
      {(isGuestsOpen || isBudgetOpen || isDestOpen) && (
         <div className="fixed inset-0 z-[90]" onClick={() => { setIsGuestsOpen(false); setIsBudgetOpen(false); setIsDestOpen(false); }} />
      )}



      {/* Main Search Container */}
      <div className="bg-white dark:bg-[#FF9933] rounded-[2.5rem] p-4 md:p-5 shadow-2xl border border-gray-100 dark:border-[#FF9933]">
        
        {/* Input Row */}
        <div className="flex flex-col lg:flex-row items-center bg-[#f3f4f6] dark:bg-black/10 rounded-[2rem] lg:rounded-full p-2 relative shadow-inner gap-2 lg:gap-0">
          
          {/* Destinations */}
          <div className="flex-[1.5] w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-6 py-3 transition-all flex items-center gap-4">
            <div className="text-gray-400 dark:text-white/80 shrink-0 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
              <div className="relative flex flex-col w-full">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">Destinations</span>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setIsDestOpen(true);
                  }}
                  onFocus={() => setIsDestOpen(true)}
                  placeholder="Search destinations"
                  className="bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 dark:placeholder-white/60 placeholder-gray-400 focus:ring-0 outline-none w-full truncate"
                />
                <ul className={`absolute top-full mt-4 left-0 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[9999] overflow-hidden transition-all duration-300 ease-in-out origin-top ${
                   isDestOpen && matchedDestinations.length > 0 ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                   {matchedDestinations.slice(0, 8).map((option, idx) => (
                      <li 
                         key={idx}
                         onClick={() => {
                           setDestination(option);
                           setIsDestOpen(false);
                         }}
                         className="px-5 py-3 hover:bg-[#FF9933]/10 hover:text-[#FF9933] text-gray-700 dark:text-gray-300 transition-colors duration-200 cursor-pointer text-sm"
                      >
                         {option}
                      </li>
                   ))}
                </ul>
              </div>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div><div className="block lg:hidden h-[1px] w-full bg-gray-200 dark:bg-white/20 my-1"></div>

            {/* Check-in */}
            <div className="flex-1 w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex items-center justify-between gap-2 cursor-pointer bg-transparent relative overflow-hidden">
               <div className="flex items-center gap-3 w-full pointer-events-none">
                 <div className="text-gray-400 dark:text-white/80 shrink-0">
                   <Calendar size={20} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col justify-center flex-1">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">Check-in</span>
                    <span className="text-gray-500 text-sm mt-0.5 font-medium">
                       {checkIn ? new Date(checkIn).toLocaleDateString() : 'Add dates'}
                    </span>
                 </div>
               </div>
               <input 
                 type="date"
                 value={checkIn}
                 min={today}
                 onChange={handleCheckInChange}
                 onClick={(e) => {
                   try {
                     if ('showPicker' in HTMLInputElement.prototype) {
                       e.currentTarget.showPicker();
                     }
                   } catch (err) {}
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
            </div>
  
            <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div><div className="block lg:hidden h-[1px] w-full bg-gray-200 dark:bg-white/20 my-1"></div>
  
            {/* Check-out */}
            <div className="flex-1 w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex items-center justify-between gap-2 cursor-pointer bg-transparent relative overflow-hidden">
               <div className="flex items-center gap-3 w-full pointer-events-none">
                 <div className="flex flex-col justify-center flex-1">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">Check-out</span>
                    <span className="text-gray-500 text-sm mt-0.5 font-medium">
                       {checkOut ? new Date(checkOut).toLocaleDateString() : 'Add dates'}
                    </span>
                 </div>
               </div>
               <input 
                 type="date"
                 value={checkOut}
                 min={checkIn || today}
                 onChange={(e) => setCheckOut(e.target.value)}
                 onClick={(e) => {
                   try {
                     if ('showPicker' in HTMLInputElement.prototype) {
                       e.currentTarget.showPicker();
                     }
                   } catch (err) {}
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
            </div>
  
            <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div><div className="block lg:hidden h-[1px] w-full bg-gray-200 dark:bg-white/20 my-1"></div>
  
            {/* Guests */}
          <div className="flex-[0.8] w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex flex-col justify-center">
             <div className="relative flex-1 cursor-pointer" onClick={() => setIsGuestsOpen(!isGuestsOpen)}>
                <div className="flex flex-col">
                   <span className="text-sm font-extrabold text-gray-900 dark:text-white">Guests</span>
                   <span className="text-gray-500 text-sm mt-0.5">{guests || 'Add guests'}</span>
                </div>
                <ul className={`absolute top-full mt-4 left-0 w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[9999] overflow-hidden transition-all duration-300 ease-in-out origin-top ${
                   isGuestsOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                   {['1 Person', '2 People', '3 People', '4+ People'].map((option) => (
                      <li 
                         key={option}
                         onClick={() => setGuests(option)}
                         className="px-5 py-3 hover:bg-[#FF9933]/10 hover:text-[#FF9933] text-gray-700 dark:text-gray-300 transition-colors duration-200"
                      >
                         {option}
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div><div className="block lg:hidden h-[1px] w-full bg-gray-200 dark:bg-white/20 my-1"></div>

          {/* Budget */}
          <div className="flex-[0.8] w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex flex-col justify-center">
             <div className="relative flex-1 cursor-pointer" onClick={() => setIsBudgetOpen(!isBudgetOpen)}>
                <div className="flex flex-col">
                   <span className="text-sm font-extrabold text-gray-900 dark:text-white">Budget</span>
                   <span className="text-gray-500 text-sm mt-0.5">
                      {budget ? budget.charAt(0).toUpperCase() + budget.slice(1) + ' Tier' : 'Select Tier'}
                   </span>
                </div>
                <ul className={`absolute top-full mt-4 left-0 w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[9999] overflow-hidden transition-all duration-300 ease-in-out origin-top ${
                   isBudgetOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                   {[
                      { label: 'Standard Tier', value: 'standard' },
                      { label: 'Executive Tier', value: 'executive' },
                      { label: 'Premium Tier', value: 'premium' },
                      { label: 'Unique Tier', value: 'unique' }
                   ].map((option) => (
                      <li 
                         key={option.value}
                         onClick={() => setBudget(option.value)}
                         className="px-5 py-3 hover:bg-[#FF9933]/10 hover:text-[#FF9933] text-gray-700 dark:text-gray-300 transition-colors duration-200"
                      >
                         {option.label}
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Search Button */}
          <div className="px-2 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
            <button 
              onClick={handleSearch}
              className="w-full lg:w-[60px] lg:h-[60px] py-3 lg:py-0 bg-[#1e3a8a] dark:bg-white hover:bg-[#1e40af] dark:hover:bg-gray-100 text-white dark:text-[#FF9933] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-transform hover:scale-105"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>
          </div>
          
        </div>

        {/* Bottom Radio Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mt-6 px-6 pb-2">
          <span className="text-sm font-extrabold text-gray-900 dark:text-white">Search for:</span>
          <div className="flex flex-wrap items-center gap-8">
            {['Business', 'Couples', 'Families', 'Friends', 'Solo'].map((type) => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${searchFor === type ? 'border-[#1e3a8a] dark:border-white' : 'border-gray-300 dark:border-white/40 group-hover:border-gray-400 dark:group-hover:border-white/70'}`}>
                   {searchFor === type && <div className="w-[10px] h-[10px] rounded-full bg-[#1e3a8a] dark:bg-white"></div>}
                </div>
                <input 
                  type="radio" 
                  name="searchFor" 
                  value={type} 
                  checked={searchFor === type} 
                  onChange={() => setSearchFor(type)}
                  className="hidden" 
                />
                <span className={`text-sm font-semibold transition-colors ${searchFor === type ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60 group-hover:text-gray-800 dark:group-hover:text-white/90'}`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
