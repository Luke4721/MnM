import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const variants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] as const } },
  exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] as const } },
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', width: '100%' }}
    >
      {children}
    </motion.div>
  );
};
