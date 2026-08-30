import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const LanguagePrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('languageSelected');
    if (!savedLang) {
      setShowPrompt(true);
    } else if (savedLang === 'ru') {
      loadGoogleTranslate('ru');
    }

    const handleOpen = () => setShowPrompt(true);
    window.addEventListener('openLanguagePrompt', handleOpen);
    return () => window.removeEventListener('openLanguagePrompt', handleOpen);
  }, []);

  const forceTranslate = (lang: string) => {
    const checkAndSet = setInterval(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        clearInterval(checkAndSet);
      }
    }, 100);
    setTimeout(() => clearInterval(checkAndSet), 5000);
  };

  const loadGoogleTranslate = (langToForce?: string) => {
    if (!document.getElementById('google-translate-script')) {
      const style = document.createElement('style');
      style.innerHTML = `
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate { display: none !important; }
        body { top: 0 !important; }
      `;
      document.head.appendChild(style);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en', includedLanguages: 'ru', autoDisplay: false },
            'google_translate_element'
          );
          if (langToForce) {
            forceTranslate(langToForce);
          }
        }
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    } else if (langToForce) {
      forceTranslate(langToForce);
    }
  };

  const handleSelectLanguage = (lang: string) => {
    localStorage.setItem('languageSelected', lang);
    setShowPrompt(false);
    
    if (lang === 'ru') {
      document.cookie = 'googtrans=/en/ru; path=/';
      document.cookie = `googtrans=/en/ru; path=/; domain=${window.location.hostname}`;
      loadGoogleTranslate('ru');
    } else {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      window.location.reload();
    }
  };

  return (
    <>
      <div id="google_translate_element" className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none"></div>
      <AnimatePresence>
        {showPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-white/20 dark:border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#FF9933]"></div>
              
              <button onClick={() => { if(localStorage.getItem('languageSelected')) setShowPrompt(false); }} className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>

              <div className="w-20 h-20 bg-[#FF9933]/10 text-[#FF9933] rounded-full flex items-center justify-center mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Choose Language</h2>
              <h3 className="text-xl font-medium text-gray-500 dark:text-zinc-400 mb-10">Выберите язык</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={() => handleSelectLanguage('en')}
                  className="flex-1 py-4 px-6 bg-[#f3f4f6] dark:bg-zinc-800 text-gray-900 dark:text-white border-2 border-transparent hover:border-[#FF9933] hover:shadow-lg rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🇺🇸</span>
                  English
                </button>
                <button
                  onClick={() => handleSelectLanguage('ru')}
                  className="flex-1 py-4 px-6 bg-[#f3f4f6] dark:bg-zinc-800 text-gray-900 dark:text-white border-2 border-transparent hover:border-[#FF9933] hover:shadow-lg rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🇷🇺</span>
                  Русский
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LanguagePrompt;
