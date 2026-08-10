import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  formatFn: (val: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, formatFn }) => {
  const [displayString, setDisplayString] = useState(formatFn(value));

  useEffect(() => {
    setDisplayString(formatFn(value));
  }, [value, formatFn]);

  return (
    <span style={{ display: 'inline-block', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayString}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums' }}
        >
          {displayString}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
