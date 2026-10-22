import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import initialRouting from '../data/support_routing.json';

interface DestinationHandler {
  type: 'Inbound' | 'Outbound';
  name: string;
  email: string;
  phone: string;
}

export const ConciergeForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [handlers, setHandlers] = useState<Record<string, DestinationHandler>>(
    initialRouting as Record<string, DestinationHandler>
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/site-config?section=routing')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.success && json.data && Object.keys(json.data).length > 0) {
          setHandlers(json.data);
        }
      })
      .catch((err) => {
        console.warn('[ConciergeForm] Using static routing fallback:', err);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitError) setSubmitError(null);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const assignedHelper = formData.destination ? handlers[formData.destination] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          destination: formData.destination,
          message: formData.message,
          assignedHelper,
          honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[ConciergeForm] Submit error:', err);
      setSubmitError(
        err.message || 'Unable to connect to the server. Please try again or call our concierge.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setIsSubmitted(false);
    setSubmitError(null);
    setFormData({ name: '', email: '', phone: '', destination: '', message: '' });
    setHoneypot('');
  };

  return (
    <div className="bg-gray-50 dark:bg-black w-full flex justify-center py-12 px-4 transition-colors duration-500">
      <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 w-full max-w-2xl">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-wider text-center uppercase">
          Design Your Journey
        </h2>

        {/* Success View */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inquiry Received!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                Thank you, <strong className="text-gray-900 dark:text-white">{formData.name}</strong>.
                Our concierge specialist{' '}
                <strong className="text-[#FF9933]">
                  {assignedHelper?.name || 'Lead Specialist'}
                </strong>{' '}
                has received your request for{' '}
                <strong className="text-gray-900 dark:text-white">
                  {formData.destination || 'your custom journey'}
                </strong>{' '}
                and will reach out to you shortly at{' '}
                <strong className="text-gray-900 dark:text-white">
                  {formData.email || formData.phone}
                </strong>.
              </p>
            </div>

            {assignedHelper && (
              <div className="bg-gray-100/80 dark:bg-zinc-800/80 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5 border border-gray-200 dark:border-zinc-700">
                <p className="font-bold text-gray-700 dark:text-zinc-300">
                  Assigned Travel Concierge:
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {assignedHelper.name} ({assignedHelper.type})
                </p>
                <p className="text-gray-600 dark:text-zinc-400">
                  Email: {assignedHelper.email} | Phone: {assignedHelper.phone}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-3.5 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,153,51,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,153,51,0.6)] transition-all text-xs"
            >
              Plan Another Journey
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Honeypot field for bot protection */}
            <input
              type="text"
              name="honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {submitError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{submitError}</p>
              </div>
            )}

            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {step === 1 && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">
                    01 / DETAILS
                  </p>
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
                    <button
                      type="button"
                      disabled={!formData.name || !formData.email || !formData.phone}
                      className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,153,51,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,153,51,0.6)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                      onClick={handleNext}
                    >
                      NEXT STEP
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">
                    02 / DESTINATION
                  </p>

                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-6 py-4 mb-6 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all shadow-sm appearance-none"
                    required
                  >
                    <option value="" disabled>
                      Select your query type / destination
                    </option>
                    {Object.entries(handlers).map(([dest, info]) => (
                      <option key={dest} value={dest}>
                        [{info.type}] {dest}
                      </option>
                    ))}
                  </select>

                  {assignedHelper && (
                    <div className="mt-6 p-6 bg-gray-100 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700">
                      <h4 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                        Assigned Helper
                      </h4>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          readOnly
                          value={assignedHelper.name}
                          className="bg-transparent border-b border-gray-300 dark:border-zinc-600 pb-1 text-gray-900 dark:text-white font-medium focus:outline-none"
                        />
                        <input
                          type="text"
                          readOnly
                          value={assignedHelper.email}
                          className="bg-transparent border-b border-gray-300 dark:border-zinc-600 pb-1 text-gray-900 dark:text-white font-medium focus:outline-none"
                        />
                        <input
                          type="text"
                          readOnly
                          value={assignedHelper.phone}
                          className="bg-transparent border-b border-gray-300 dark:border-zinc-600 pb-1 text-gray-900 dark:text-white font-medium focus:outline-none"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-3 italic">
                        This specialist will handle your {assignedHelper.type.toLowerCase()} request.
                      </p>
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
                    <button
                      type="button"
                      disabled={!formData.destination}
                      className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,153,51,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,153,51,0.6)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                      onClick={handleNext}
                    >
                      NEXT STEP
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-[0.1em] text-sm text-center">
                    03 / CONFIRMATION
                  </p>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      READY TO EXPLORE?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto text-sm">
                      Our expert travel concierge{' '}
                      <strong className="text-gray-900 dark:text-white">
                        {assignedHelper?.name}
                      </strong>{' '}
                      will review your interest in{' '}
                      <strong className="text-gray-900 dark:text-white">
                        {formData.destination}
                      </strong>{' '}
                      and contact you at{' '}
                      <strong className="text-gray-900 dark:text-white">
                        {formData.email}
                      </strong>.
                    </p>
                  </div>

                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Any specific dates, budget, or preferences? (Optional)"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-5 py-3.5 mb-6 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all shadow-sm text-sm"
                  />

                  <div className="flex justify-between items-center mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={isSubmitting}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      PREVIOUS
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 rounded-full bg-[#FF9933] text-white font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(255,153,51,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,153,51,0.6)] transition-all flex items-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      {isSubmitting ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </form>
        )}
      </div>
    </div>
  );
};
