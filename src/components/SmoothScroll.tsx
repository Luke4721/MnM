import React, { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export const SmoothScroll: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const isStandalone =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/pay');

  useEffect(() => {
    if (isStandalone) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      document.documentElement.classList.remove('lenis');
      document.body.classList.remove('lenis');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1,
      orientation: 'vertical',
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis');
      document.body.classList.remove('lenis');
    };
  }, [isStandalone, location.pathname]);

  return <>{children}</>;
};
