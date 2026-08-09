import React from 'react';
import { motion } from 'framer-motion';

export const AtmosphericParticles: React.FC = () => {
  // Generate a set of random particles
  const particles = Array.from({ length: 40 }).map((_, i) => {
    const size = Math.random() * 4 + 1;
    const initialX = Math.random() * 100;
    const initialY = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * -20; // negative delay so they are already moving

    return (
      <motion.div
        key={i}
        initial={{
          x: `${initialX}vw`,
          y: `${initialY}vh`,
          opacity: Math.random() * 0.3 + 0.1,
          scale: size,
        }}
        animate={{
          y: [`${initialY}vh`, `-10vh`], // float up
          x: [`${initialX}vw`, `${initialX + (Math.random() * 10 - 5)}vw`], // drift slightly
          opacity: [0, Math.random() * 0.5 + 0.2, 0], // fade in and out
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          width: '2px',
          height: '2px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          filter: 'blur(1px)',
          boxShadow: '0 0 10px 2px rgba(255,255,255,0.4)',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles}
    </div>
  );
};
