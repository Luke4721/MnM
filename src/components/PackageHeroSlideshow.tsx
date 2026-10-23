import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PackageHeroSlide {
  url: string;
  alt: string;
  caption?: string;
}

export interface PackageHeroSlideshowProps {
  slides: PackageHeroSlide[];
  packageTitle: string;
}

export const PackageHeroSlideshow: React.FC<PackageHeroSlideshowProps> = ({
  slides,
  packageTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!slides || slides.length === 0) {
    return <div className="w-full h-full bg-zinc-950" />;
  }

  // If only 1 image, render statically without navigation controls
  if (slides.length === 1) {
    const single = slides[0];
    return (
      <div className="w-full h-full relative overflow-hidden bg-black select-none">
        <img
          src={single.url}
          alt={single.alt || packageTitle}
          className="w-full h-full aspect-[16/9] md:aspect-[21/9] object-cover animate-kenburns scale-105"
          loading="eager"
          fetchPriority="high"
        />
      </div>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black select-none group">
      {/* Motion-animated image transition with consistent aspect ratio */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide.url}
          src={currentSlide.url}
          alt={currentSlide.alt || packageTitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full h-full aspect-[16/9] md:aspect-[21/9] object-cover scale-105"
          loading="eager"
          fetchPriority="high"
        />
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        aria-label="Previous photo"
        className="absolute left-4 md:left-8 top-[24vh] md:top-[30vh] -translate-y-1/2 z-30 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label="Next photo"
        className="absolute right-4 md:right-8 top-[24vh] md:top-[30vh] -translate-y-1/2 z-30 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot indicators */}
      <div className="absolute top-[38vh] md:top-[48vh] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === idx
                ? 'w-7 bg-[#FF9933] shadow-md'
                : 'w-2 bg-white/60 hover:bg-white shadow-sm'
            }`}
          />
        ))}
      </div>

      {/* Slide counter pill */}
      <div className="absolute top-28 right-6 md:right-12 z-30 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono tracking-wider border border-white/20 shadow-md">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default PackageHeroSlideshow;
