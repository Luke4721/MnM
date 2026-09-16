import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, Languages } from 'lucide-react';
import db from '../data/mnm_database.json';
import { SocialLinks } from './SocialLinks';

interface NavbarProps {
  onOpenCurrencyModal: () => void;
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCurrencyModal,
  isDark,
  onToggleDarkMode,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] rounded-none px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 shadow-md transition-all duration-300">
      <div className="flex items-center justify-between w-full md:w-auto">
        <NavLink
          to="/"
          className="group flex items-center gap-2 md:gap-4 transition-transform duration-300 hover:scale-105 cursor-pointer text-gray-900 dark:text-white no-underline"
        >
          <img
            src={db.company.logo_url}
            alt={db.company.name}
            className="h-8 md:h-10 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,0,60,0.8)]"
          />
          <span className="hidden sm:inline-block font-bold text-base md:text-lg tracking-widest transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,0,60,0.8)] group-hover:text-[#FF9933]">
            MNM TRAVELS
          </span>
        </NavLink>

        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-800 dark:text-white cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full md:w-auto mt-6 md:mt-0 text-sm font-semibold tracking-widest text-gray-800 dark:text-white/80 transition-colors duration-300`}
      >
        <NavLink
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800"
        >
          HOME
        </NavLink>
        <NavLink
          to="/packages"
          onClick={() => setMobileMenuOpen(false)}
          className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit font-semibold w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800"
        >
          DESTINATIONS
        </NavLink>
        <NavLink
          to="/gallery"
          onClick={() => setMobileMenuOpen(false)}
          className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800"
        >
          GALLERY
        </NavLink>
        <NavLink
          to="/about"
          onClick={() => setMobileMenuOpen(false)}
          className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800"
        >
          ABOUT
        </NavLink>
        <NavLink
          to="/blog"
          onClick={() => setMobileMenuOpen(false)}
          className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800"
        >
          BLOG
        </NavLink>
        <Link
          to="/contact"
          onClick={() => setMobileMenuOpen(false)}
          className="hover:text-black dark:hover:text-white transition-colors no-underline text-inherit w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 border-gray-200 dark:border-zinc-800"
        >
          CONTACT
        </Link>

        {/* Mobile Quick Actions (Language & Currency) */}
        <div className="flex md:hidden w-full items-center justify-between pt-2 pb-2">
          <button
            onClick={() => {
              window.dispatchEvent(new Event('openLanguagePrompt'));
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-gray-800 dark:text-white cursor-pointer"
          >
            <div className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full">
              <Languages size={18} />
            </div>
            <span className="text-xs uppercase tracking-wider">Language</span>
          </button>
          <button
            onClick={() => {
              onOpenCurrencyModal();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-gray-800 dark:text-white cursor-pointer"
          >
            <div className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full">
              <Globe size={18} />
            </div>
            <span className="text-xs uppercase tracking-wider">Currency</span>
          </button>
        </div>

        {/* Mobile Social Icons - Cleanly centered, icons only */}
        <div className="flex md:hidden w-full items-center justify-center pt-3 pb-2 border-t border-gray-200 dark:border-zinc-800">
          <SocialLinks
            className="flex items-center gap-6"
            iconSize={20}
            itemClassName="p-2.5 bg-gray-200/50 dark:bg-white/10 rounded-full text-gray-800 dark:text-white hover:text-[#FF9933] dark:hover:text-[#FF9933] transition-colors"
          />
        </div>

        {/* Desktop Quick Actions & Social Icons */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 ml-2">
          {/* Social Media Icons - Icons Only, Instagram / Facebook / YouTube */}
          <SocialLinks
            className="flex items-center gap-2"
            iconSize={18}
            itemClassName="p-2 text-gray-700 dark:text-white/80 hover:text-[#FF9933] dark:hover:text-[#FF9933] hover:bg-gray-200/50 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
          />

          <div className="h-5 w-[1px] bg-gray-300/60 dark:bg-white/20 mx-1" />

          <button
            onClick={() => window.dispatchEvent(new Event('openLanguagePrompt'))}
            className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full hover:bg-gray-300/50 dark:hover:bg-white/20 transition-colors text-gray-800 dark:text-white border border-gray-300/50 dark:border-white/10 cursor-pointer"
            title="Change Language"
            aria-label="Change Language"
          >
            <Languages size={18} />
          </button>

          <button
            onClick={onOpenCurrencyModal}
            className="p-2 bg-gray-200/50 dark:bg-white/10 rounded-full hover:bg-gray-300/50 dark:hover:bg-white/20 transition-colors text-gray-800 dark:text-white border border-gray-300/50 dark:border-white/10 cursor-pointer"
            title="Change Currency"
            aria-label="Change Currency"
          >
            <Globe size={18} />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 relative transition-colors duration-300 flex items-center px-1 cursor-pointer shadow-inner"
            aria-label="Toggle Dark Mode"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isDark ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mobile Dark Mode Toggle */}
        <div className="flex md:hidden items-center justify-between w-full pt-2 border-t border-gray-200 dark:border-zinc-800">
          <span className="text-xs text-gray-500 uppercase">Dark Mode</span>
          <button
            onClick={onToggleDarkMode}
            className="w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 relative transition-colors duration-300 flex items-center px-1 cursor-pointer shadow-inner"
            aria-label="Toggle Dark Mode"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isDark ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
