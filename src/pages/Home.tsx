import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plane, ArrowRight, Star, Compass, Camera, Heart, Shield, MapPin, Map } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import { usePackages } from '../context/PackagesProvider';
import { TravelSearchEngine } from '../components/TravelSearchEngine';
import { ReelsCarousel } from '../components/ReelsCarousel';


export const Home: React.FC = () => {
  const { currency, convertPrice } = useCurrency();
  const { packages: dbPackages } = usePackages();

  // Phase 2: Hero Slideshow Logic
  const heroPackages = [
    {
      id: 1,
      category: "Temple of India",
      name: "Bhubaneswar Pilgrimage",
      location: "Bhubaneswar, Odisha",
      duration: "04 Nights / 05 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Lingaraj_Temple_%2C_Bhubaneswar.jpg"
    },
    {
      id: 2,
      category: "Forts & Palaces",
      name: "Rajasthan Heritage Tour",
      location: "Jodhpur, Rajasthan",
      duration: "06 Nights / 07 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Mehrangarh_Fort_sanhita.jpg"
    },
    {
      id: 5,
      category: "The Himalayas",
      name: "Everest Base Camp",
      location: "Himalayas, Nepal",
      duration: "10 Nights / 11 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg"
    },
    {
      id: 10,
      category: "Udaipur",
      name: "City of Lakes Tour",
      location: "Udaipur, Rajasthan",
      duration: "03 Nights / 04 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Udaipur_Lake_Palace.jpg"
    },
    {
      id: 11,
      category: "Agra",
      name: "Taj Mahal Experience",
      location: "Agra, Uttar Pradesh",
      duration: "02 Nights / 03 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
    },
    {
      id: 12,
      category: "Milan",
      name: "Milan City Break",
      location: "Milan, Italy",
      duration: "04 Nights / 05 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Milan_Cathedral_from_Piazza_del_Duomo.jpg/3840px-Milan_Cathedral_from_Piazza_del_Duomo.jpg"
    },
    {
      id: 13,
      category: "Mount Titlis",
      name: "Swiss Alps Adventure",
      location: "Mount Titlis, Switzerland",
      duration: "05 Nights / 06 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Titlis_W.jpg"
    },
    {
      id: 14,
      category: "Kodaikanal",
      name: "Princess of Hill Stations",
      location: "Kodaikanal, Tamil Nadu",
      duration: "04 Nights / 05 Days",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Boating_in_Kodaikanal_Lake_with_Mist.jpg/3840px-Boating_in_Kodaikanal_Lake_with_Mist.jpg"
    }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPackages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPackages.length]);

  const activePackage = heroPackages[currentSlide];

  // Popular Packages Logic
  const popularPackageIds = ['2', '15', '16'];
  const popularPackages = popularPackageIds.map(id => dbPackages.find(p => p.id === id)).filter(Boolean) as typeof dbPackages;

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
                src={pkg.image} 
                alt={pkg.name} 
                className="w-full h-full object-cover animate-kenburns transition-all duration-1000 scale-105" 
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 z-[1] pointer-events-none"></div>
          </div>
        ))}

        {/* Hero Overlay Text */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center px-4 relative"
            >
              <h1 className="text-7xl md:text-[10rem] text-white drop-shadow-xl" style={{ fontFamily: 'var(--font-cursive)' }}>
                {activePackage.category}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Hero Overlay Bar */}
        <div className="absolute bottom-0 left-0 w-full z-20 bg-black/40 backdrop-blur-md border-t border-white/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-6 px-8 text-white divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="flex-1 py-4 md:py-0 px-6 flex flex-col">
              <span className="text-xl font-bold">{activePackage.name}</span>
              <span className="text-sm text-gray-300 flex items-center gap-1"><MapPin size={14}/> {activePackage.location}</span>
            </div>
            <div className="flex-1 py-4 md:py-0 px-6 flex flex-col items-center">
              <span className="text-lg font-bold">{activePackage.duration}</span>
              <span className="text-sm text-gray-300 uppercase tracking-wider text-[10px]">Duration</span>
            </div>
            <div className="flex-1 py-4 md:py-0 px-6 flex flex-col items-center">
              <span className="flex items-center gap-1 text-[#D97736]">
                <Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" />
              </span>
              <span className="text-sm text-gray-300 uppercase tracking-wider text-[10px] mt-1">Superb Hotel</span>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Search Engine Widget */}
      <div className="relative z-[100] my-10 max-w-6xl mx-auto px-4 sm:px-6">
        <TravelSearchEngine standalone={true} />
      </div>

      {/* Phase 3: Agency Intro & Popular Packages */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Intro Split Section */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-24 relative">
          
          <div className="flex-1 flex gap-8">
            <div className="hidden lg:block">
               <div className="text-[#D97736] font-bold tracking-widest text-sm whitespace-nowrap transform -rotate-90 origin-bottom-left absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12">
                 EXPLORE THE WORLD FOR YOURSELF
               </div>
            </div>
            
              <div className="pl-0 lg:pl-16">
                <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 font-serif">
                  Discover the <br/>world's leading <br/>travel agency.
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-md">
                  For over 15 years, Monks & Monkeys Travels has curated extraordinary journeys across the globe. Our seasoned team of experts crafts meticulously tailored experiences—from the tranquil backwaters of Kerala to the majestic peaks of the Swiss Alps. Join thousands of happy travelers and discover your next great adventure.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/about">
                    <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-full font-bold tracking-wider text-xs transition-transform hover:scale-105">
                      ABOUT COMPANY
                    </button>
                  </Link>
                  <Link to="/packages">
                    <button className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-3.5 rounded-full font-bold tracking-wider text-xs hover:border-gray-900 dark:hover:border-white transition-all hover:scale-105">
                      DISCOVER TOUR
                    </button>
                  </Link>
                </div>
              </div>
            </div>
  
          <div className="flex-1 relative mt-16 lg:mt-0">
            <div className="relative rounded-t-[10rem] overflow-hidden aspect-[4/5] shadow-2xl w-full max-w-md mx-auto lg:ml-auto lg:mr-12">
             {[
               "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
               "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
               "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg",
               "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg"
             ].map((imgUrl, i) => (
               <img 
                 key={i} 
                 src={imgUrl} 
                 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentSlide % 4 === i ? 'opacity-100' : 'opacity-0'}`} 
                 alt="Travel Destination" 
               />
             ))}
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 lg:top-1/4 lg:-left-8 lg:translate-x-0 bg-white dark:bg-black rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-2xl border-8 border-gray-50 dark:border-zinc-900 z-20">
               <span className="text-[#D97736] font-bold text-xs">SINCE</span>
               <span className="text-3xl font-extrabold text-gray-900 dark:text-white">1990</span>
            </div>
          </div>
        </div>
        
        {/* 4-icon grid features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-200 dark:border-gray-800 pb-20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0">
               <Star size={18} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Superior service</h4>
              <p className="text-sm text-gray-500">Lorem ipsum text</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0">
               <Map size={18} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Cheapest package</h4>
              <p className="text-sm text-gray-500">Lorem ipsum text</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0">
               <Compass size={18} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Greatest guides</h4>
              <p className="text-sm text-gray-500">Lorem ipsum text</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0">
               <Shield size={18} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Fully protected</h4>
              <p className="text-sm text-gray-500">Lorem ipsum text</p>
            </div>
          </div>
        </div>

        {/* Popular Packages */}
        <div className="mt-32 mb-16 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Popular packages</h2>
          <div className="w-12 h-1 bg-[#D97736] mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularPackages.map((pkg, index) => {
            const originalPrice = Math.round((convertPrice(pkg.priceINR, true) as number) * 1.3);
            const currentPrice = Math.round(convertPrice(pkg.priceINR, true) as number);
            const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/package/${pkg.id}`} className="block h-full group">
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-300 h-full group hover:-translate-y-1">
                    <div className="h-56 relative overflow-hidden">
                      <img src={pkg.img || pkg.image_url || pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                        30% OFF
                      </div>
                      <div className="absolute top-4 right-4 bg-[#f1f1f1] text-gray-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                        {pkg.duration}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col">
                      <div className="flex items-end gap-2 mb-2">
                         <span className="text-gray-400 line-through text-sm font-semibold">{symbol}{originalPrice.toLocaleString()}</span>
                         <span className="text-[#D97736] text-2xl font-extrabold">{symbol}{currentPrice.toLocaleString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">{pkg.name}</h3>
                      
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-4 mt-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">50 REVIEWS</span>
                        <div className="flex items-center text-[#D97736]">
                           <Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      

      
      {/* Top Trending INDIA Destinations */}
      <div className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#2c3e50] dark:text-gray-200 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>Top Trending INDIA Destinations</h2>
            <p className="text-gray-500 text-sm">Find the exclusive tour options for India's Top Trending Destinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: "https://upload.wikimedia.org/wikipedia/commons/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg", name: "Himalayas" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg", name: "Agra" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/9/99/Mehrangarh_Fort_sanhita.jpg", name: "Jodhpur" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Lingaraj_Temple_%2C_Bhubaneswar.jpg", name: "Bhubaneswar" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/3/32/Udaipur_Lake_Palace.jpg", name: "Udaipur" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Boating_in_Kodaikanal_Lake_with_Mist.jpg/3840px-Boating_in_Kodaikanal_Lake_with_Mist.jpg", name: "Kodaikanal" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/House_Boat_DSW.jpg/1280px-House_Boat_DSW.jpg", name: "Kerala" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg", name: "Jaipur" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/1280px-The_Golden_Temple_of_Amrithsar_7.jpg", name: "Amritsar" }
            ].map((item, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer relative">
                <img src={item.src} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-xl uppercase tracking-widest">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Trending INTERNATIONAL Destinations */}
      <div className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#2c3e50] dark:text-gray-200 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>Top Trending INTERNATIONAL Destinations</h2>
            <p className="text-gray-500 text-sm">Find the exclusive tour options for Top Trending International Destinations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Milan_Cathedral_from_Piazza_del_Duomo.jpg/3840px-Milan_Cathedral_from_Piazza_del_Duomo.jpg", name: "Milan" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Titlis_W.jpg/1280px-Titlis_W.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Mount Titlis" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", name: "Paris" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg", name: "Rome" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg", name: "London" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1280px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg", name: "Japan" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg/1280px-Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Grand Canyon" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Oia_sunset_-_panoramio_%282%29.jpg/1280px-Oia_sunset_-_panoramio_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Santorini" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg/1280px-%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail", name: "Thailand" }
            ].map((item, i) => (
              <div key={i} className="aspect-[16/9] overflow-hidden group cursor-pointer relative bg-gray-100 dark:bg-zinc-900">
                <img src={item.src} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-xl uppercase tracking-widest">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase 5: CTA, Blogs & Footer */}
      
      {/* Parallax CTA */}
      <div className="relative py-40 mt-10">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/8/82/Clouds_disappearing_into_a_darkening_blue_sky_over_an_airplane_wing.jpg)' }}>
          <div className="absolute inset-0 bg-black/50 z-0"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 flex flex-col items-center">
          <h4 className="text-white text-xs font-bold tracking-[0.2em] mb-4 uppercase">Finding the perfect trails</h4>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-12">Get ready to explore and <br/>discover your world.</h2>
        </div>
      </div>

      {/* Category Icons */}
      <div className="bg-white dark:bg-black py-16 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 group-hover:border-[#D97736] transition-colors">
                 <Compass className="text-gray-400 group-hover:text-[#D97736] transition-colors" size={24} />
              </div>
              <span className="font-bold text-xs tracking-widest uppercase text-gray-900 dark:text-white">Adventure</span>
            </div>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 group-hover:border-[#D97736] transition-colors">
                 <Heart className="text-gray-400 group-hover:text-[#D97736] transition-colors" size={24} />
              </div>
              <span className="font-bold text-xs tracking-widest uppercase text-gray-900 dark:text-white">Friendly</span>
            </div>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 group-hover:border-[#D97736] transition-colors">
                 <Star className="text-gray-400 group-hover:text-[#D97736] transition-colors" size={24} />
              </div>
              <span className="font-bold text-xs tracking-widest uppercase text-gray-900 dark:text-white">Popular</span>
            </div>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 group-hover:border-[#D97736] transition-colors">
                 <Plane className="text-gray-400 group-hover:text-[#D97736] transition-colors" size={24} />
              </div>
              <span className="font-bold text-xs tracking-widest uppercase text-gray-900 dark:text-white">Beaches</span>
            </div>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 group-hover:border-[#D97736] transition-colors">
                 <Heart className="text-gray-400 group-hover:text-[#D97736] transition-colors" size={24} />
              </div>
              <span className="font-bold text-xs tracking-widest uppercase text-gray-900 dark:text-white">Honeymoon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Happy Traveller Split Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
            
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-8 font-serif">
                Our happy <br/>traveller.
              </h2>
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#D97736] hover:text-white hover:border-[#D97736] transition-all hover:scale-110">
                  <ArrowRight size={20} className="transform rotate-180" />
                </button>
                <button className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#D97736] hover:text-white hover:border-[#D97736] transition-all hover:scale-110">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
  
            <div className="flex-1 relative flex justify-center">
               <div className="relative w-72 h-72 rounded-full border-[8px] border-white dark:border-zinc-900 shadow-2xl overflow-hidden z-10 transition-transform duration-700 hover:scale-105">
                 <img src="/images/3ac9bf62d5bb14289acd33e9f5a63ee3.jpg" alt="Happy traveller" className="w-full h-full object-cover" />
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-36 z-20 pointer-events-none">
                  <span className="text-7xl text-[#D97736] drop-shadow-lg -rotate-6 inline-block" style={{ fontFamily: 'var(--font-cursive)' }}>Amazing</span>
               </div>
               <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 -left-12 -z-0 text-gray-100 dark:text-[#D97736] font-serif text-7xl font-black tracking-widest select-none rotate-90 opacity-40 dark:opacity-20 whitespace-nowrap">
                 MONKS & MONKEYS
               </div>
            </div>

          <div className="flex-1 pt-12 md:pt-0">
             <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">
               Our Africa travel specialist planned the most <span className="font-bold text-gray-900 dark:text-white border-b-2 border-yellow-400">amazing trip</span> to Kenya for us. We had an <span className="font-bold text-gray-900 dark:text-white border-b-2 border-yellow-400">incredible time</span> and were able to capture so many awesome pictures.
             </p>
             <div className="flex items-center text-[#D97736] mb-4 gap-1">
               <Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" /><Star size={16} className="fill-current" />
             </div>
          </div>

        </div>
      </div>

      {/* Reels Carousel */}
      <ReelsCarousel />

      {/* Footer & Newsletter */}
      <footer className="bg-[#f9f8f4] dark:bg-zinc-950 pt-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 opacity-20 pointer-events-none">
             <span className="text-8xl text-[#D97736] tracking-tighter" style={{ fontFamily: 'var(--font-cursive)' }}>great</span>
             <br/><span className="text-2xl font-black tracking-[0.3em] uppercase -mt-4 block">Journeys</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 relative z-10">
            Get the amazing travel<br/>offers into your inbox!
          </h2>
          
          <div className="relative max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-full shadow-xl flex items-center p-2 mt-12 border border-gray-100 dark:border-zinc-800 z-10">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 bg-transparent border-none outline-none pl-6 text-gray-900 dark:text-white placeholder-gray-400 text-sm" 
            />
            <button className="bg-transparent text-gray-900 dark:text-white font-bold text-xs uppercase tracking-widest px-6 py-3 hover:text-[#D97736] transition-colors flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0"><ArrowRight size={10} /></span>
              SUBSCRIBE
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-6 z-10 relative">We are committed to protecting your <Link to="#" className="underline hover:text-[#D97736]">privacy policy</Link>.</p>
        </div>

        {/* Instagram / Gallery Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-0">
          {[
            "/images/6b2bb97f0c1b6d7f2e78e37589eae965.jpg",
            "/images/6f3ad43a139e289fdcc2ccc6d497923b.jpg",
            "/images/7c677b5e8b51587496b66ed9709845df.jpg",
            "/images/8b2e185fc79ab5f9983920bbc1f8f6b5.jpg",
            "/images/8c22906dc1ab06a9031e5f0fde298c5b.jpg",
            "/images/9c904a1b42b78bb14a34bb65cc768a40.jpg"
          ].map((src, i) => (
            <div key={i} className="aspect-square relative group overflow-hidden">
              <img src={src} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#D97736]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <Camera size={32} className="text-white" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] dark:bg-black">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 text-center">
            <div>&copy; Copyright {new Date().getFullYear()} <span className="font-bold text-white">Monks & Monkey Travels</span></div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-bold uppercase tracking-widest text-white">
              <Link to="/about" className="hover:text-[#D97736] transition-colors">About</Link>
              <Link to="/packages" className="hover:text-[#D97736] transition-colors">Destinations</Link>
              <Link to="/packages" className="hover:text-[#D97736] transition-colors">Tours</Link>
              <Link to="#" className="hover:text-[#D97736] transition-colors">Reviews</Link>
              <Link to="#" className="hover:text-[#D97736] transition-colors">Blog</Link>
              <Link to="/contact" className="hover:text-[#D97736] transition-colors">Contact</Link>
            </div>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-[#D97736] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></Link>
              <Link to="#" className="hover:text-[#D97736] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></Link>
              <Link to="#" className="hover:text-[#D97736] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></Link>
              <Link to="#" className="hover:text-[#D97736] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></Link>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
};
