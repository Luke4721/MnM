import React from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import agencyData from '../data/agency_data.json';
import { Award, Heart, Globe, Shield } from 'lucide-react';

export const About: React.FC = () => {
  const { agency } = agencyData;

  return (
    <PageTransition>
      <div className="pt-36 pb-24 min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">Our <span className="text-[#D97736]">Heritage</span></h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Discovering a better way to travel since {agency.founded}.
            </p>
            <div className="w-20 h-1 bg-[#D97736] mx-auto mt-8"></div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Glassmorphism shape for "Welcome to MNM" */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-zinc-900/40 border border-white/40 dark:border-zinc-800/50 rounded-[2.5rem] shadow-2xl p-10 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D97736]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D97736]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 flex flex-wrap items-center gap-3">
                  Welcome to
                  <span className="bg-[#D97736] text-white px-5 py-2 rounded-2xl shadow-lg inline-block border border-white/20">
                    {agency.name}
                  </span>
                </h2>
                <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  <p>
                    {agency.mission}
                  </p>
                  <p>
                    {agency.description}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white border-l-4 border-[#D97736] pl-4 italic">
                    With our more than 15 years of journey, Monks & Monkeys has served thousands of clients, and they are still happily connected with us.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="rounded-[2.5rem] shadow-2xl overflow-hidden relative aspect-[4/5] lg:aspect-square group"
          >
            {/* Replaced low-res image with high-res Indian Flag */}
            <img
              src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
              alt="India Flag"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
                  <Award className="text-[#D97736] mb-2" size={28} />
                  <div className="font-bold text-2xl">15+</div>
                  <div className="text-xs uppercase tracking-wider opacity-80">Years Exp</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
                  <Heart className="text-[#D97736] mb-2" size={28} />
                  <div className="font-bold text-2xl">1K+</div>
                  <div className="text-xs uppercase tracking-wider opacity-80">Happy Clients</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
                  <Globe className="text-[#D97736] mb-2" size={28} />
                  <div className="font-bold text-2xl">100+</div>
                  <div className="text-xs uppercase tracking-wider opacity-80">Destinations</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white">
                  <Shield className="text-[#D97736] mb-2" size={28} />
                  <div className="font-bold text-2xl">24/7</div>
                  <div className="text-xs uppercase tracking-wider opacity-80">Support</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};
