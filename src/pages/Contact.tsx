import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { ConciergeForm } from '../components/ConciergeForm';
import { motion } from 'framer-motion';

export const Contact: React.FC = () => {
  return (
    <PageTransition>
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Get a <span className="text-gradient">Quote</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
              Be it adventure, culinary, musical journey's or luxury, every interest has its own unique experience! We believe there are always stories to be created and more to be shared, and travel makes this possible.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p><strong>Email:</strong> concierge@mnmtravels.com</p>
              <p><strong>Phone:</strong> +91 (123) 456-7890</p>
              <p><strong>Address:</strong> Delhi, India</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ConciergeForm />
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};
