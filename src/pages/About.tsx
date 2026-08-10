import React from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import agencyData from '../data/agency_data.json';

export const About: React.FC = () => {
  const { agency } = agencyData;

  return (
    <PageTransition>
      <div style={{ height: '120px', width: '100%', flexShrink: 0 }}></div>
      <div className="page-content pt-32 md:pt-40" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Our <span className="text-gradient">Heritage</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Discovering a better way to travel since {agency.founded}.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <div className="glass" style={{ padding: '3rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Welcome to {agency.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                {agency.mission}
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                {agency.description}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            style={{ position: 'relative', height: '600px', borderRadius: '24px', overflow: 'hidden' }}
          >
            <img
              src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800"
              alt="About Us"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg-color), transparent)' }} />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
