import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera } from 'lucide-react';
import { SocialLinks } from './SocialLinks';

const GALLERY_STRIP_IMAGES = [
  '/images/6b2bb97f0c1b6d7f2e78e37589eae965.jpg',
  '/images/6f3ad43a139e289fdcc2ccc6d497923b.jpg',
  '/images/7c677b5e8b51587496b66ed9709845df.jpg',
  '/images/8b2e185fc79ab5f9983920bbc1f8f6b5.jpg',
  '/images/8c22906dc1ab06a9031e5f0fde298c5b.jpg',
  '/images/9c904a1b42b78bb14a34bb65cc768a40.jpg',
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f9f8f4] dark:bg-zinc-950 pt-24">
      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 opacity-20 pointer-events-none">
          <span className="text-8xl text-[#D97736] tracking-tighter" style={{ fontFamily: 'var(--font-cursive)' }}>
            great
          </span>
          <br />
          <span className="text-2xl font-black tracking-[0.3em] uppercase -mt-4 block">Journeys</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 relative z-10">
          Get the amazing travel
          <br />
          offers into your inbox!
        </h2>

        <div className="relative max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-full shadow-xl flex items-center p-2 mt-12 border border-gray-100 dark:border-zinc-800 z-10">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 bg-transparent border-none outline-none pl-6 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
          />
          <button className="bg-transparent text-gray-900 dark:text-white font-bold text-xs uppercase tracking-widest px-6 py-3 hover:text-[#D97736] transition-colors flex items-center gap-2 cursor-pointer">
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
              <ArrowRight size={10} />
            </span>
            SUBSCRIBE
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-6 z-10 relative">
          We are committed to protecting your{' '}
          <Link to="#" className="underline hover:text-[#D97736]">
            privacy policy
          </Link>
          .
        </p>
      </div>

      {/* Instagram / Gallery Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-0">
        {GALLERY_STRIP_IMAGES.map((src, i) => (
          <div key={i} className="aspect-square relative group overflow-hidden">
            <img
              src={src}
              alt="Gallery highlight"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#D97736]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Camera size={32} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Copyright & Navigation Bar */}
      <div className="bg-[#1a1a1a] dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 md:pr-24 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 text-center">
          <div>
            &copy; Copyright {new Date().getFullYear()}{' '}
            <span className="font-bold text-white">Monks & Monkey Travels</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-bold uppercase tracking-widest text-white">
            <Link to="/about" className="hover:text-[#D97736] transition-colors">
              About
            </Link>
            <Link to="/packages" className="hover:text-[#D97736] transition-colors">
              Destinations
            </Link>
            <Link to="/packages" className="hover:text-[#D97736] transition-colors">
              Tours
            </Link>
            <Link to="#" className="hover:text-[#D97736] transition-colors">
              Reviews
            </Link>
            <Link to="/blog" className="hover:text-[#D97736] transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="hover:text-[#D97736] transition-colors">
              Contact
            </Link>
          </div>

          {/* Social Media Section - Icons Only, Instagram / Facebook / YouTube, clean spacing */}
          <SocialLinks
            className="flex items-center gap-5"
            iconSize={18}
            itemClassName="text-gray-400 hover:text-[#D97736] dark:hover:text-[#FF9933] transition-colors"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
