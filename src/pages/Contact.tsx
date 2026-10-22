import React, { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { ConciergeForm } from '../components/ConciergeForm';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import initialSettings from '../data/site_settings.json';

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 text-[#FF9933]"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 text-[#FF9933]"
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 text-[#FF9933]"
    aria-hidden="true"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export const Contact: React.FC = () => {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    fetch('/api/admin/site-config?section=settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.success && json.data && Object.keys(json.data).length > 0) {
          setSettings((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch((err) => {
        console.warn('[Contact] Using static site settings fallback:', err);
      });
  }, []);

  const instagramUrl = settings.instagram || 'https://www.instagram.com/monks_n_monkeys.travels';
  const facebookUrl = settings.facebook || 'https://www.facebook.com/share/1DjLJ112BB/';
  const youtubeUrl = settings.youtube || 'https://youtube.com/@monksandmonkeystravels?si=200OlrPcBr_-ddwj';

  return (
    <PageTransition>
      <div className="flex items-center justify-center p-4 md:p-8 pt-32 md:pt-40 min-h-[80vh]">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white">
              Get a <span className="text-[#FF9933]">Quote</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              Be it adventure, culinary, musical journeys, or bespoke luxury, every interest has
              its own unique experience! We believe there are always stories to be created and more
              to be shared, and travel makes this possible.
            </p>

            {/* Configurable Contact Channels */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-orange-200/60 dark:border-zinc-700 flex items-center justify-center text-[#FF9933] shrink-0 mt-0.5">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</p>
                  <a
                    href={`mailto:${settings.conciergeEmail || settings.email}`}
                    className="text-gray-900 dark:text-white font-semibold hover:text-[#FF9933] transition-colors"
                  >
                    {settings.conciergeEmail || settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-orange-200/60 dark:border-zinc-700 flex items-center justify-center text-[#FF9933] shrink-0 mt-0.5">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone</p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    <a
                      href={`tel:${settings.phone}`}
                      className="hover:text-[#FF9933] transition-colors"
                    >
                      {settings.phone}
                    </a>
                    {settings.altPhone && (
                      <>
                        {' or '}
                        <a
                          href={`tel:${settings.altPhone}`}
                          className="hover:text-[#FF9933] transition-colors"
                        >
                          {settings.altPhone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-orange-200/60 dark:border-zinc-700 flex items-center justify-center text-[#FF9933] shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Office Address</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{settings.address}</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-3">
                Follow Our Journey
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:text-[#FF9933] hover:border-[#FF9933]/50 shadow-sm transition-all text-xs font-bold"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={16} /> Instagram
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:text-[#FF9933] hover:border-[#FF9933]/50 shadow-sm transition-all text-xs font-bold"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={16} /> Facebook
                </a>
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:text-[#FF9933] hover:border-[#FF9933]/50 shadow-sm transition-all text-xs font-bold"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon size={16} /> YouTube
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ConciergeForm />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
