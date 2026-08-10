import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';

import agencyData from '../data/agency_data.json';

const services = agencyData.services;

export const Services: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <PageTransition>
      <div style={{ height: '120px', width: '100%', flexShrink: 0 }}></div>
      <div className="page-content pt-32 md:pt-40" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '4rem', textAlign: 'center' }}>Holiday <span className="text-gradient">Ideas</span></h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              className="glass"
              style={{ padding: '2rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              onHoverStart={() => setHoveredIndex(idx)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2rem', zIndex: 2, position: 'relative' }}>{service.title}</h2>
                <motion.span
                  animate={{ rotate: hoveredIndex === idx ? 90 : 0 }}
                  style={{ fontSize: '2rem', color: 'var(--primary-color)', zIndex: 2, position: 'relative' }}
                >
                  &rarr;
                </motion.span>
              </div>
              
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden', zIndex: 2, position: 'relative' }}
                  >
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{service.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover background effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredIndex === idx ? 1 : 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(152,195,58,0.1), transparent)',
                  zIndex: 1,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};
