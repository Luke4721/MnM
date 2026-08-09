import React, { useRef, useState, type ReactNode } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  radius?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, radius = 30 }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Track normalized pointer coordinates (-1 to 1)
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate center of element
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Distance from center
    const distX = clientX - centerX;
    const distY = clientY - centerY;

    // Apply radius constraint for the pull
    const pullX = Math.min(Math.max(distX, -radius), radius);
    const pullY = Math.min(Math.max(distY, -radius), radius);

    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{
        x,
        y,
        display: 'inline-block',
        cursor: 'pointer'
      }}
    >
      {children}
    </motion.div>
  );
};
