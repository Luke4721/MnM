import React, { useState } from 'react';
import { motion } from 'framer-motion';
import agencyData from '../data/agency_data.json';

const services = agencyData.services.map(s => s.title);

export const ConciergeForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted', formData);
    alert('Thank you. Our concierge will contact you shortly.');
    setStep(1);
    setFormData({ name: '', email: '', phone: '', service: '' });
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      <h2 style={{ marginBottom: '3rem', fontSize: '2rem' }}>DESIGN YOUR JOURNEY</h2>
      
      <form onSubmit={handleSubmit}>
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {step === 1 && (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>01 / DETAILS</p>
              <input
                type="text"
                name="name"
                placeholder="FULL NAME"
                className="premium-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="EMAIL ADDRESS"
                className="premium-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="PHONE NUMBER"
                className="premium-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="editorial-button" onClick={handleNext}>NEXT STEP</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>02 / INTERESTS</p>
              <div className="radio-group">
                {services.map((service) => (
                  <label key={service} className="custom-radio">
                    <input
                      type="radio"
                      name="service"
                      value={service}
                      checked={formData.service === service}
                      onChange={handleChange}
                    />
                    <span className="radio-label">{service}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  PREVIOUS
                </button>
                <button type="button" className="editorial-button" onClick={handleNext}>NEXT STEP</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>03 / CONFIRMATION</p>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 300 }}>READY TO EXPLORE?</h3>
              <p style={{ marginBottom: '3rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Our expert travel concierge will review your interest in <strong style={{color: 'white'}}>{formData.service || 'our services'}</strong> and contact you at <strong style={{color: 'white'}}>{formData.email}</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  PREVIOUS
                </button>
                <button type="submit" className="editorial-button">SUBMIT INQUIRY</button>
              </div>
            </div>
          )}
        </motion.div>
      </form>
    </div>
  );
};
