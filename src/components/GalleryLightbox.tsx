import React, { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryLightboxProps {
  /** Images in their current (filtered) order, so navigation matches what is on screen. */
  images: string[];
  /** Index into `images`, or null when the lightbox is closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

const iconButtonClass =
  'flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default';

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  images,
  index,
  onClose,
  onNavigate,
}) => {
  const isOpen = index !== null && images.length > 0;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Read the live index through a ref so the keyboard listener can stay mounted
  // across navigation instead of being torn down and re-attached on every step.
  const indexRef = useRef<number | null>(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const step = useCallback(
    (delta: number) => {
      const current = indexRef.current;
      if (current === null || images.length === 0) return;
      onNavigate((current + delta + images.length) % images.length);
    },
    [images.length, onNavigate],
  );

  // Open/close lifecycle: remember the trigger, lock scrolling, focus the dialog.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'ArrowRight') step(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, step]);

  const goPrev = () => step(-1);
  const goNext = () => step(1);

  const currentSrc = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {isOpen && currentSrc && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className={`${iconButtonClass} absolute top-5 right-5 z-10`}
          >
            <X size={20} />
          </button>

          <span className="absolute top-6 left-6 text-white/70 text-xs font-semibold uppercase tracking-[0.2em] tabular-nums">
            {index + 1} / {images.length}
          </span>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className={`${iconButtonClass} absolute left-4 md:left-8 z-10`}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className={`${iconButtonClass} absolute right-4 md:right-8 z-10`}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <motion.img
            key={currentSrc}
            src={currentSrc}
            alt={`Client memory ${index + 1}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] object-contain shadow-2xl"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
