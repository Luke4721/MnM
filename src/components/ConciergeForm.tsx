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
    <div className="bg-gray-50 dark:bg-black w-full flex justify-center py-12 px-4 transition-colors duration-500">
      <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 w-full max-w-2xl">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-wider text-center uppercase">Design Your Journey</h2>
        
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
              <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">01 / DETAILS</p>
              <input
                type="text"
                name="name"
                placeholder="FULL NAME"
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-6 py-4 mb-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all shadow-sm"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-6 py-4 mb-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all shadow-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="PHONE NUMBER"
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-6 py-4 mb-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all shadow-sm"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <div className="flex justify-end mt-8">
                <button type="button" className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,0,60,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,0,60,0.6)] transition-all" onClick={handleNext}>NEXT STEP</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">02 / INTERESTS</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <label key={service} className={`cursor-pointer w-full bg-white dark:bg-zinc-800 border ${formData.service === service ? 'border-[#FF9933] ring-2 ring-[#FF9933]/20' : 'border-gray-200 dark:border-zinc-700'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white transition-all shadow-sm flex items-center gap-3`}>
                    <input
                      type="radio"
                      name="service"
                      value={service}
                      checked={formData.service === service}
                      onChange={handleChange}
                      className="accent-[#FF9933] w-4 h-4"
                    />
                    <span className="font-medium">{service}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center mt-10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest text-sm font-bold transition-colors"
                >
                  PREVIOUS
                </button>
                <button type="button" className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,0,60,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,0,60,0.6)] transition-all" onClick={handleNext}>NEXT STEP</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">03 / CONFIRMATION</p>
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">READY TO EXPLORE?</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto">
                  Our expert travel concierge will review your interest in <strong className="text-gray-900 dark:text-white">{formData.service || 'our services'}</strong> and contact you at <strong className="text-gray-900 dark:text-white">{formData.email}</strong>.
                </p>
              </div>
              <div className="flex justify-between items-center mt-10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest text-sm font-bold transition-colors"
                >
                  PREVIOUS
                </button>
                <button type="submit" className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,0,60,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,0,60,0.6)] transition-all">SUBMIT INQUIRY</button>
              </div>
            </div>
          )}
        </motion.div>
      </form>
      </div>
    </div>
  );
};
