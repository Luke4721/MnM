import React, { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let activeLenis: Lenis | null = null;

/** Global helper to instantly scroll to top via Lenis with native window fallback */
export function scrollToTop(immediate = true): void {
  if (typeof window !== 'undefined') {
    if (activeLenis) {
      activeLenis.scrollTo(0, { immediate, force: true });
    } else if ((window as any).lenis?.scrollTo) {
      (window as any).lenis.scrollTo(0, { immediate, force: true });
    }
    window.scrollTo({ top: 0, behavior: immediate ? 'instant' : 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

export const SmoothScroll: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const isStandalone =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/pay');

  // 1. Manage Lenis lifecycle (instantiate for public routes, disable for standalone admin/pay desk)
  useEffect(() => {
    // Disable automatic browser scroll restoration to prevent retention across SPA navigations
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (isStandalone) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      activeLenis = null;
      if (typeof window !== 'undefined') {
        (window as any).lenis = undefined;
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
    activeLenis = lenis;
    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis;
    }

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
      activeLenis = null;
      if (typeof window !== 'undefined') {
        (window as any).lenis = undefined;
      }
      document.documentElement.classList.remove('lenis');
      document.body.classList.remove('lenis');
    };
  }, [isStandalone]);

  // 2. Global Scroll-to-Top on Route Change
  useEffect(() => {
    // If navigating to a hash anchor, scroll to the targeted element
    if (location.hash) {
      const targetEl = document.querySelector(location.hash);
      if (targetEl) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(targetEl as HTMLElement, { immediate: true });
        } else {
          (targetEl as HTMLElement).scrollIntoView();
        }
        return;
      }
    }

    const resetScroll = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true, force: true });
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Instant scroll to top on route change
    resetScroll();

    // Re-verify on consecutive frames & after page transitions
    const raf1 = requestAnimationFrame(() => {
      resetScroll();
      requestAnimationFrame(resetScroll);
    });

    const t1 = setTimeout(resetScroll, 50);
    const t2 = setTimeout(resetScroll, 150);
    const t3 = setTimeout(resetScroll, 420); // covers Framer Motion AnimatePresence exit transition

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, location.search]);

  return <>{children}</>;
};
