import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { GalleryLightbox } from '../components/GalleryLightbox';
import galleryData from '../data/gallery_database.json';
import {
  ALL_CATEGORY,
  GALLERY_CATEGORIES,
  categoryForImage,
  type GalleryFilter,
} from '../data/gallery_categories';

const FALLBACK_IMAGE = '/images/30ca80d455a76609dc911a25a68d87e2.jpg';

const FILTERS: GalleryFilter[] = [ALL_CATEGORY, ...GALLERY_CATEGORIES];

/** All gallery images, tagged by categoryForImage (untagged ones show under "All"). */
export const Gallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>(ALL_CATEGORY);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images: string[] = Array.from(galleryData);

  const visibleImages = useMemo(
    () =>
      activeFilter === ALL_CATEGORY
        ? images
        : images.filter((src) => categoryForImage(src) === activeFilter),
    [images, activeFilter],
  );

  // Switching tabs closes the lightbox so its index cannot point at a stale list.
  useEffect(() => {
    setLightboxIndex(null);
  }, [activeFilter]);

  // Stable identity: an inline arrow here would re-run the lightbox's effects on
  // every render and pull focus back to its close button.
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  return (
    <PageTransition>
      <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-[#FF9933] mb-6">Client Memory Gallery</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            A collection of beautiful moments captured by our amazing travelers around the globe.
          </p>
          <div className="w-12 h-1 bg-[#FF9933] mx-auto mt-8"></div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={isActive}
                className={`px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF9933] border-[#FF9933] text-white shadow-sm'
                    : 'bg-transparent border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:border-[#FF9933] hover:text-[#FF9933]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {visibleImages.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {visibleImages.map((src, idx) => (
              <button
                key={`${src}-${idx}`}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Open image ${idx + 1} of ${visibleImages.length} in full view`}
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9933] focus-visible:ring-offset-2"
              >
                <img
                  src={src}
                  alt={`Client memory ${idx + 1}`}
                  loading="lazy"
                  className="w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <Maximize2 size={18} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-white/15 rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400">No {activeFilter} photos yet.</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Add the image path to <code>src/data/gallery_database.json</code> and tag it in{' '}
              <code>src/data/gallery_categories.ts</code> to fill this tab.
            </p>
          </div>
        )}

        <GalleryLightbox
          images={visibleImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      </div>
    </PageTransition>
  );
};
