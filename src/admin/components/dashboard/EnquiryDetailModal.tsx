import React from 'react';
import { Mail, Phone, Calendar, Package, DollarSign, Users, X } from 'lucide-react';
import type { RecentEnquiry } from '../../../types/dashboard';

interface EnquiryDetailModalProps {
  enquiry: RecentEnquiry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  enquiry,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !enquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
              {enquiry.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {enquiry.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    enquiry.status === 'converted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : enquiry.status === 'contacted'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {enquiry.status}
                </span>
                <span className="text-xs text-slate-400">ID: {enquiry.id}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} /> Email Address
            </span>
            <div className="font-semibold text-slate-800 break-all">
              {enquiry.email || enquiry.contact}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Phone size={12} /> Contact Number
            </span>
            <div className="font-semibold text-slate-800">
              {enquiry.phone || enquiry.contact}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Package size={12} /> Destination / Package
            </span>
            <div className="font-semibold text-slate-800">
              {enquiry.destination}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Query Date
            </span>
            <div className="font-semibold text-slate-800">
              {enquiry.date}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users size={12} /> Group Size
            </span>
            <div className="font-semibold text-slate-800">
              {enquiry.travelers ? `${enquiry.travelers} Travelers` : '2 Travelers'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign size={12} /> Budget Tier
            </span>
            <div className="font-semibold text-slate-800">
              {enquiry.budget || 'Standard Tier'}
            </div>
          </div>
        </div>

        {/* Message / Requirements Note */}
        {enquiry.message && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Note & Request
            </span>
            <p className="text-slate-700 italic leading-relaxed">
              {enquiry.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          {enquiry.email && (
            <a
              href={`mailto:${enquiry.email}?subject=Monks%20%26%20Monkeys%20Travels%20-%20Your%20Trip%20Query`}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Mail size={13} /> Email Customer
            </a>
          )}
          {enquiry.phone && (
            <a
              href={`tel:${enquiry.phone}`}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Phone size={13} /> Call Customer
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
