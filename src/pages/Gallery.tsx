import React from 'react';
import { PageTransition } from '../components/PageTransition';
import galleryData from '../data/gallery_database.json';

export const Gallery: React.FC = () => {
  return (
    <PageTransition>
      <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Client Memory Gallery</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            A collection of beautiful moments captured by our amazing travelers around the globe.
          </p>
          <div className="w-12 h-1 bg-[#D97736] mx-auto mt-8"></div>
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {galleryData.map((src, idx) => (
            <div key={idx} className="break-inside-avoid overflow-hidden rounded-2xl group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
              <img
                src={src}
                alt={`Client memory ${idx + 1}`}
                loading="lazy"
                className="w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => { e.currentTarget.src = '/images/30ca80d455a76609dc911a25a68d87e2.jpg'; }}
              />
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};
