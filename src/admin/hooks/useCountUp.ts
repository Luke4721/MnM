import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp
 * Smoothly animates a numeric value from its previous value (or 0) to `endValue` over `duration` ms.
 */
export function useCountUp(
  endValue: number,
  duration: number = 1000
): number {
  const [count, setCount] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = endValue;
    prevValueRef.current = endValue;

    if (from === to && count === to) return;

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic formula: 1 - (1 - progress)^3
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * easeOutProgress);

      setCount(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [endValue, duration]);

  return count;
}
