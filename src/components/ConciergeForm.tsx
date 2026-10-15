import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Localized data mapping for destinations and handlers
const destinationHandlers: Record<string, { type: 'Inbound' | 'Outbound', name: string, email: string, phone: string }> = {
  'Vietnam': { type: 'Outbound', name: 'Alice Smith', email: 'alice.outbound@mnmtravels.com', phone: '+91-9876543210' },
  'Thailand': { type: 'Outbound', name: 'Alice Smith', email: 'alice.outbound@mnmtravels.com', phone: '+91-9876543210' },
  'Kerala': { type: 'Inbound', name: 'Rahul Sharma', email: 'rahul.inbound@mnmtravels.com', phone: '+91-1234567890' },
  'Rajasthan': { type: 'Inbound', name: 'Rahul Sharma', email: 'rahul.inbound@mnmtravels.com', phone: '+91-1234567890' },
  'Europe': { type: 'Outbound', name: 'John Doe', email: 'john.europe@mnmtravels.com', phone: '+91-1122334455' },
  'Kashmir': { type: 'Inbound', name: 'Neha Gupta', email: 'neha.kashmir@mnmtravels.com', phone: '+91-9988776655' },
  'Maldives': { type: 'Outbound', name: 'John Doe', email: 'john.europe@mnmtravels.com', phone: '+91-1122334455' }
};

export const ConciergeForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    setFormData({ name: '', email: '', phone: '', destination: '' });
  };

  const assignedHelper = formData.destination ? destinationHandlers[formData.destination] : null;

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
              <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">02 / DESTINATION</p>
              
              <select
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-6 py-4 mb-6 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all shadow-sm appearance-none"
                required
              >
                <option value="" disabled>Select your query type</option>
                {Object.entries(destinationHandlers).map(([dest, info]) => (
                  <option key={dest} value={dest}>
                    [{info.type}] {dest}
                  </option>
                ))}
              </select>

              {assignedHelper && (
                <div className="mt-6 p-6 bg-gray-100 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700">
                  <h4 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Assigned Helper</h4>
                  <div className="flex flex-col gap-2">
                    <input type="text" readOnly value={assignedHelper.name} className="bg-transparent border-b border-gray-300 dark:border-zinc-600 pb-1 text-gray-900 dark:text-white font-medium focus:outline-none" />
                    <input type="text" readOnly value={assignedHelper.email} className="bg-transparent border-b border-gray-300 dark:border-zinc-600 pb-1 text-gray-900 dark:text-white font-medium focus:outline-none" />
                    <input type="text" readOnly value={assignedHelper.phone} className="bg-transparent border-b border-gray-300 dark:border-zinc-600 pb-1 text-gray-900 dark:text-white font-medium focus:outline-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-3 italic">This specialist will handle your {assignedHelper.type.toLowerCase()} request.</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest text-sm font-bold transition-colors"
                >
                  PREVIOUS
                </button>
                <button type="button" disabled={!formData.destination} className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,0,60,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,0,60,0.6)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none" onClick={handleNext}>NEXT STEP</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">03 / CONFIRMATION</p>
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">READY TO EXPLORE?</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto">
                  Our expert travel concierge <strong className="text-gray-900 dark:text-white">{assignedHelper?.name}</strong> will review your interest in <strong className="text-gray-900 dark:text-white">{formData.destination}</strong> and contact you at <strong className="text-gray-900 dark:text-white">{formData.email}</strong>.
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

