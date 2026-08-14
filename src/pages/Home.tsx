import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, MapPin, ArrowRight, Star, Compass, Map, Camera, Heart, Shield, Calendar, Bed, Coffee } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import db from '../data/mnm_database.json';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { TiltCard } from '../components/TiltCard';
import { TravelSearchEngine } from '../components/TravelSearchEngine';


export const Home: React.FC = () => {
  const { currency, convertPrice } = useCurrency();
  const navigate = useNavigate();

  // Phase 2: Hero Slideshow Logic
  const heroPackages = db.packages.slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPackages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPackages.length]);

  const activePackage = heroPackages[currentSlide];

  // Prime Destinations Logic (Masonry style grid)
  const primeDestinations = db.packages.slice(3, 7); // Pick 4

  // Popular Packages Logic
  const popularPackages = db.packages.slice(7, 10); // Pick 3

  // Travel Blogs (Placeholder data)
  const blogs = [
    { id: 1, title: "10 Hidden Gems in Europe", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop", date: "Aug 10, 2026", author: "Sarah Jenkins" },
    { id: 2, title: "A Culinary Journey through Asia", image: "https://images.unsplash.com/photo-1548624317-a006db23a1d9?q=80&w=600&auto=format&fit=crop", date: "Aug 05, 2026", author: "Mike Chen" },
    { id: 3, title: "The Ultimate Guide to Safari", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop", date: "Jul 28, 2026", author: "Emma Stone" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500">
      
      {/* Phase 2: Hero Slideshow */}
      <div className="relative w-full h-screen overflow-hidden bg-black">
        {heroPackages.map((pkg, idx) => (
          <div 
            key={pkg.id}
            className={`absolute inset-0 z-0 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 ease-in-out`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={pkg.img || pkg.image_url || pkg.image} 
                alt={pkg.name} 
                className="w-full h-full object-cover animate-kenburns transition-all duration-1000 scale-105" 
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 z-[1] pointer-events-none"></div>
          </div>
        ))}

        {/* Hero Overlay Text */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold uppercase tracking-wider mb-4"><span className="w-2 h-2 rounded-full bg-[#D97736] animate-pulse"></span>FEATURED DESTINATION</div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
                {activePackage.category.toUpperCase()}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Glass Metric Pills */}
        <div className="absolute bottom-32 left-8 z-10 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 text-white text-sm shadow-xl">
          <span>📍 {activePackage.location}</span><span className="opacity-50">|</span><span>⭐ 4.9 (1.2k)</span>
        </div>

        {/* Bottom Hero Overlay Bar */}
        <div className="absolute bottom-0 left-0 w-full z-20 backdrop-blur-3xl bg-white/70 dark:bg-zinc-900/40 border-t border-white/20 dark:border-white/10 shadow-xl p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{activePackage.name}</h2>
              <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1 text-[#D97736]"><Star size={18} className="fill-current" /><Star size={18} className="fill-current" /><Star size={18} className="fill-current" /><Star size={18} className="fill-current" /><Star size={18} className="fill-current" /></span>
                <span className="flex items-center gap-1"><MapPin size={16} /> {activePackage.location}</span>
                <span className="flex items-center gap-1"><Calendar size={16} /> {activePackage.duration}</span>
              </div>
            </div>
            <button onClick={() => navigate(`/package/${activePackage.id}`)} className="bg-[#D97736] hover:bg-[#E88A4A] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 pointer-events-auto">
              BOOK NOW
            </button>
          </div>
        </div>
      </div>

      {/* Floating Search Engine Widget */}
      <div className="relative z-20 my-10 max-w-6xl mx-auto px-4 sm:px-6">
        <TravelSearchEngine standalone={true} />
      </div>

      {/* Phase 3: Agency Intro & Popular Packages */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Intro Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h4 className="text-[#D97736] font-bold tracking-widest uppercase mb-4">About MNM Travels</h4>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-8">
              Discover the world's leading travel agency
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              We specialize in creating unforgettable experiences. From the moment you start planning to the day you return home, our dedicated team ensures every detail is perfect. Travel because life is too short to stay in one place.
            </p>
            <Link to="/about">
              <button className="bg-[#D97736] hover:bg-[#E88A4A] text-white px-8 py-3 rounded-full font-bold tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(217,119,54,0.3)] hover:shadow-[0_15px_40px_rgba(217,119,54,0.5)] hover:scale-105">
                READ MORE
              </button>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative">
              <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop" alt="Travel Agency" className="w-full h-full object-cover" />
            </div>
            {/* 4-icon grid absolute overlay */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] backdrop-blur-3xl bg-white/70 dark:bg-zinc-900/40 border border-white/20 dark:border-white/10 shadow-xl rounded-[2rem] p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center text-center p-2">
                  <Compass className="text-[#D97736] mb-2" size={28} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Expert Guides</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <Shield className="text-[#D97736] mb-2" size={28} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Safe Travel</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <Map className="text-[#D97736] mb-2" size={28} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Custom Plans</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <Heart className="text-[#D97736] mb-2" size={28} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Memories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Packages */}
        <div className="mt-40 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Popular Packages</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Hand-picked destinations for your next adventure.</p>
          </div>
          <Link to="/packages">
            <button className="px-6 py-2 border-2 border-[#D97736] text-[#D97736] rounded-full font-bold tracking-widest hover:bg-[#D97736] hover:text-white transition-all duration-300">
              VIEW ALL
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/package/${pkg.id}`} className="block h-full group">
                <TiltCard>
                  <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group hover:-translate-y-2">
                    <div className="h-64 relative overflow-hidden">
                      <img src={pkg.img || pkg.image_url || pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-bold flex items-center gap-1">
                        <MapPin size={14} /> {pkg.duration}
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{pkg.name}</h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1 mb-3">{pkg.highlights || pkg.location}</p>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Starting from</span>
                          <span className="text-2xl font-bold text-[#D97736]">
                            <AnimatedNumber 
                              value={Math.round(convertPrice(pkg.priceINR, true) as number)} 
                              formatFn={(val) => {
                                const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;
                                return `${symbol}${Math.round(val).toLocaleString()}`;
                              }} 
                            />
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-[#D97736] group-hover:text-white transition-colors duration-300">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Phase 4: Prime Destinations Grid */}
      <div className="bg-white/50 dark:bg-zinc-900/20 py-24 border-y border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Prime Destinations</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Curated domestic and international experiences.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {primeDestinations.map((dest, i) => (
              <motion.div 
                key={dest.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square relative rounded-[2rem] overflow-hidden group cursor-pointer"
              >
                <img src={dest.img || dest.image_url || dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <h3 className="drop-shadow-lg text-white font-bold tracking-tight text-xl md:text-2xl mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{dest.category}</h3>
                  <p className="text-white/80 text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{dest.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase 5: CTA, Blogs & Footer */}
      
      {/* Parallax CTA */}
      <div className="relative py-32 mt-20 mb-32">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2000&auto=format&fit=crop)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 backdrop-brightness-90 z-0"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">Get ready to explore the world with us</h2>
          <button className="bg-[#D97736] hover:bg-[#E88A4A] text-white px-10 py-4 rounded-full font-bold tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(217,119,54,0.4)] hover:shadow-[0_15px_40px_rgba(217,119,54,0.6)] hover:scale-105">
            START PLANNING
          </button>
        </div>

        {/* Overlapping Service Icons */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-[90%] z-20">
          <div className="relative z-10 grid grid-cols-5 gap-3 max-w-4xl mx-auto p-4 rounded-3xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer">
              <Plane className="text-gray-500 dark:text-gray-400 group-hover:text-[#D97736] transition-colors mb-3" size={32} />
              <span className="font-semibold text-gray-900 dark:text-white">Flights</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer">
              <Bed className="text-gray-500 dark:text-gray-400 group-hover:text-[#D97736] transition-colors mb-3" size={32} />
              <span className="font-semibold text-gray-900 dark:text-white">Hotels</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer">
              <Camera className="text-gray-500 dark:text-gray-400 group-hover:text-[#D97736] transition-colors mb-3" size={32} />
              <span className="font-semibold text-gray-900 dark:text-white">Activities</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer">
              <Coffee className="text-gray-500 dark:text-gray-400 group-hover:text-[#D97736] transition-colors mb-3" size={32} />
              <span className="font-semibold text-gray-900 dark:text-white">Dining</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer">
              <Map className="text-gray-500 dark:text-gray-400 group-hover:text-[#D97736] transition-colors mb-3" size={32} />
              <span className="font-semibold text-gray-900 dark:text-white">Tours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Happy Traveller Split Section */}
      <div className="max-w-7xl mx-auto px-6 py-24 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative h-[500px]">
            <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=800&auto=format&fit=crop" alt="Happy traveller" className="absolute top-0 left-0 w-2/3 h-4/5 object-cover rounded-[3rem] shadow-2xl z-10" />
            <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800&auto=format&fit=crop" alt="Happy traveller 2" className="absolute bottom-0 right-0 w-2/3 h-4/5 object-cover rounded-[3rem] shadow-2xl z-20 border-8 border-gray-50 dark:border-black" />
          </div>
          <div className="order-1 lg:order-2">
            <h4 className="text-[#D97736] font-bold tracking-widest uppercase mb-4">Testimonials</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-8">
              Our happy travellers
            </h2>
            <div className="relative backdrop-blur-3xl bg-white/70 dark:bg-zinc-900/40 border border-white/20 dark:border-white/10 shadow-xl rounded-[2rem] p-8">
              <QuoteIcon className="absolute top-4 right-8 text-[#D97736]/20 w-16 h-16" />
              <p className="text-xl text-gray-700 dark:text-gray-300 italic relative z-10 mb-6">
                "An absolutely flawless experience. From the initial booking to the final transfer, MNM Travels took care of every single detail. I felt completely relaxed."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Emily Richards</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Travelled to The Maldives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Blogs */}
      <div className="bg-white/50 dark:bg-zinc-900/20 py-24 border-t border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h4 className="text-[#D97736] font-bold tracking-widest uppercase mb-4">Our Journal</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Travel Blogs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-[2rem] mb-6 aspect-[4/3] relative">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-gray-900 dark:text-white shadow-md">
                    {blog.date}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#D97736] transition-colors">{blog.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">By {blog.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Newsletter */}
      <footer className="bg-white dark:bg-[#050B14] pt-24 border-t border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center mb-24">
          <Plane size={48} className="text-[#D97736] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Join the Journey</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">Get the amazing travel offers into your inbox!</p>
          
          <div className="relative max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="w-full bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-full pl-8 pr-40 py-5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-[#D97736] transition-all shadow-inner" 
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D97736] hover:bg-[#E88A4A] text-white px-8 py-3.5 rounded-full font-bold tracking-widest transition-all duration-300 shadow-md hover:shadow-lg">
              SUBSCRIBE
            </button>
          </div>
        </div>

        {/* Instagram / Gallery Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-0">
          {[
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548624317-a006db23a1d9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=800&q=80"
          ].map((src, i) => (
            <div key={i} className="aspect-square relative group overflow-hidden">
              <img src={src} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#D97736]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div>© {new Date().getFullYear()} Monks & Monkeys Travels Pvt. Ltd. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-[#D97736] transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-[#D97736] transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-[#D97736] transition-colors">Sitemap</Link>
          </div>
        </div>
      </footer>
      
    </div>
  );
};

function QuoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}
