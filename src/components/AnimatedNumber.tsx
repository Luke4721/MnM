import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  formatFn: (val: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, formatFn }) => {
  const springValue = useSpring(value, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = useState(formatFn(value));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    return springValue.onChange((v) => {
      setDisplayValue(formatFn(v));
    });
  }, [springValue, formatFn]);

  return <motion.span>{displayValue}</motion.span>;
};
