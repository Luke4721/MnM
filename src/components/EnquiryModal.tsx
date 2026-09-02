import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mail, Phone, CheckCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  variantName?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, packageName, variantName }) => {
  const [travelType, setTravelType] = useState('Leisure');
  const [budget, setBudget] = useState('Standard');
  const [travelers, setTravelers] = useState('2');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const travelTypes = ['Leisure', 'Adventure', 'Honeymoon', 'Family'];
  const budgets = ['Budget', 'Standard', 'Premium', 'Luxury'];
  const travelersOptions = ['1', '2', '3-5', '6+'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const API_URL = 'https://p86hnz1tyf.execute-api.us-east-1.amazonaws.com/prod/enquiries'; // Replace with actual AWS API URL for enquiries

    const enquiryData = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      packageName: `${packageName}${variantName ? ' - ' + variantName : ''}`,
      travelType,
      budget,
      travelers,
      message,
      timestamp: new Date().toISOString()
    };

    try {
      // If placeholder, we simulate success
      if (API_URL.includes('PLACEHOLDER')) {
        console.log('Simulated API Call to AWS with data:', enquiryData);
        // Fallback for testing: still open mail client if they haven't set up the API yet
        const subject = `Enquiry for ${packageName}${variantName ? ' - ' + variantName : ''}`;
        const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nPackage: ${packageName}\nTravel Type: ${travelType}\nBudget: ${budget}\nTravelers: ${travelers}\n\nSpecial Requests:\n${message}`;
        window.location.href = `mailto:bharatreviews.mnm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enquiryData)
        });
        if (!response.ok) throw new Error('API Error');
      }
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      alert('Failed to send enquiry. Please try again or email bharatreviews.mnm@gmail.com directly.');
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setIsSuccess(false), 300);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8"
        >
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Thank You!</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Your email client has been opened. We look forward to helping you plan your perfect trip!
              </p>
              <button 
                onClick={handleClose}
                className="mt-8 px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:-translate-y-0.5 transition-transform"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Plan Your Trip</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Enquiring about <span className="font-semibold text-[#FF9933]">{packageName}</span>
                {variantName && <span className="text-gray-400"> ({variantName})</span>}
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Visual Selectors */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Travel Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {travelTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTravelType(type)}
                      className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all duration-200 ${
                        travelType === type 
                          ? 'border-[#FF9933] bg-[#FF9933]/10 text-[#FF9933] shadow-sm' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-[#FF9933]/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Budget Range</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {budgets.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all duration-200 ${
                        budget === b 
                          ? 'border-[#FF9933] bg-[#FF9933]/10 text-[#FF9933] shadow-sm' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-[#FF9933]/50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Travelers</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {travelersOptions.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTravelers(t)}
                      className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all duration-200 ${
                        travelers === t 
                          ? 'border-[#FF9933] bg-[#FF9933]/10 text-[#FF9933] shadow-sm' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-[#FF9933]/50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-700/50 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#FF9933] transition-colors text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#FF9933] transition-colors text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="relative md:col-span-2">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel" 
                    required
                    placeholder="Phone Number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#FF9933] transition-colors text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <textarea 
                    placeholder="Any special requests or details?" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#FF9933] transition-colors text-gray-900 dark:text-white resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-[#FF9933] text-white font-bold text-lg shadow-lg shadow-[#FF9933]/30 hover:-translate-y-0.5 hover:shadow-[#FF9933]/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Send Enquiry <Send size={20} />
            </button>
          </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
