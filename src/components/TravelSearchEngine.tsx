import React, { useState, useEffect } from 'react';
import { Search, Package, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [activeTab, setActiveTab] = useState<'Packages' | 'Trips'>('Packages');
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [budget, setBudget] = useState('');
  const [searchFor, setSearchFor] = useState('Families');

  const today = new Date().toISOString().split('T')[0];

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
    const filters = { destination, activeTab, searchFor, checkIn, checkOut, guests, budget };
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
      
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-3 bg-gray-100/50 dark:bg-white/10 backdrop-blur-sm p-1.5 rounded-full border border-gray-200 dark:border-white/20 shadow-sm">
          <button 
            onClick={() => setActiveTab('Packages')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'Packages' ? 'bg-gray-900 text-white shadow-md dark:bg-white dark:text-[#D97736]' : 'bg-transparent text-gray-700 dark:text-white hover:bg-gray-200/50 dark:hover:bg-white/20'}`}
          >
            <Package size={16} /> Packages
          </button>
          <button 
            onClick={() => setActiveTab('Trips')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'Trips' ? 'bg-gray-900 text-white shadow-md dark:bg-white dark:text-[#D97736]' : 'bg-transparent text-gray-700 dark:text-white hover:bg-gray-200/50 dark:hover:bg-white/20'}`}
          >
            <Map size={16} /> Trips
          </button>
        </div>
      </div>

      {/* Main Search Container */}
      <div className="bg-white dark:bg-[#D97736] rounded-[2.5rem] p-4 md:p-5 shadow-2xl border border-gray-100 dark:border-[#D97736]">
        
        {/* Input Row */}
        <div className="flex flex-col lg:flex-row items-center bg-[#f3f4f6] dark:bg-black/10 rounded-full p-2 relative shadow-inner">
          
          {/* Destinations */}
          <div className="flex-[1.5] w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-6 py-3 transition-all flex items-center gap-4">
            <div className="text-gray-400 dark:text-white/80 shrink-0 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div className="flex flex-col w-full">
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">Destinations</span>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search destinations"
                className="bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 dark:placeholder-white/60 placeholder-gray-400 focus:ring-0 outline-none w-full truncate"
              />
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div>

          {/* Check-in */}
          <div className="flex-1 w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex items-center gap-3">
             <div className="text-gray-400 dark:text-white/80 shrink-0 pointer-events-none">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
             </div>
             <div className="flex flex-col w-full relative">
               <span className="text-sm font-extrabold text-gray-900 dark:text-white">Check-in</span>
               <div className="relative">
                 {!checkIn && <span className="text-xs text-gray-400 dark:text-white/60 font-medium absolute top-0 left-0 pointer-events-none mt-0.5">Add dates</span>}
                 <input 
                   type="date"
                   value={checkIn}
                   min={today}
                   onChange={handleCheckInChange}
                   className={`bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 focus:ring-0 outline-none w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!checkIn ? 'text-transparent dark:text-transparent' : ''}`}
                 />
               </div>
             </div>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div>

          {/* Check-out */}
          <div className="flex-1 w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex flex-col justify-center relative">
             <span className="text-sm font-extrabold text-gray-900 dark:text-white">Check-out</span>
             <div className="relative">
               {!checkOut && <span className="text-xs text-gray-400 dark:text-white/60 font-medium absolute top-0 left-0 pointer-events-none mt-0.5">Add dates</span>}
               <input 
                 type="date"
                 value={checkOut}
                 min={checkIn || today}
                 onChange={(e) => setCheckOut(e.target.value)}
                 className={`bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 focus:ring-0 outline-none w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!checkOut ? 'text-transparent dark:text-transparent' : ''}`}
               />
             </div>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div>

          {/* Guests */}
          <div className="flex-[0.8] w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex flex-col justify-center">
             <span className="text-sm font-extrabold text-gray-900 dark:text-white">Guests</span>
             <select 
               value={guests}
               onChange={(e) => setGuests(e.target.value)}
               className="bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 focus:ring-0 outline-none w-full cursor-pointer appearance-none mt-0.5"
             >
                <option value="" className="text-gray-900 dark:bg-zinc-800">Add guests</option>
                <option value="1 Person" className="text-gray-900 dark:bg-zinc-800">1 Person</option>
                <option value="2 People" className="text-gray-900 dark:bg-zinc-800">2 People</option>
                <option value="3 People" className="text-gray-900 dark:bg-zinc-800">3 People</option>
                <option value="4+ People" className="text-gray-900 dark:bg-zinc-800">4+ People</option>
             </select>
          </div>

          <div className="hidden lg:block w-[1px] h-12 bg-gray-200 dark:bg-white/20 mx-1"></div>

          {/* Budget */}
          <div className="flex-[0.8] w-full lg:w-auto hover:bg-white dark:hover:bg-white/20 hover:shadow-md rounded-full px-4 py-3 transition-all flex flex-col justify-center">
             <span className="text-sm font-extrabold text-gray-900 dark:text-white">Budget</span>
             <select 
               value={budget}
               onChange={(e) => setBudget(e.target.value)}
               className="bg-transparent border-none p-0 text-sm font-medium text-gray-600 dark:text-white/90 focus:ring-0 outline-none w-full cursor-pointer appearance-none mt-0.5"
             >
                <option value="" className="text-gray-900 dark:bg-zinc-800">Select Tier</option>
                <option value="Standard" className="text-gray-900 dark:bg-zinc-800">Standard Tier</option>
                <option value="Executive" className="text-gray-900 dark:bg-zinc-800">Executive Tier</option>
                <option value="Premium" className="text-gray-900 dark:bg-zinc-800">Premium Tier</option>
             </select>
          </div>

          {/* Search Button */}
          <div className="px-2 shrink-0">
            <button 
              onClick={handleSearch}
              className="w-full lg:w-[60px] lg:h-[60px] py-4 lg:py-0 bg-[#1e3a8a] dark:bg-white hover:bg-[#1e40af] dark:hover:bg-gray-100 text-white dark:text-[#D97736] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-transform hover:scale-105"
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
