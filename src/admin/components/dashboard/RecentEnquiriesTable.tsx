import React, { useState } from 'react';
import { Eye, Mail, Phone, Clock, ArrowRight, Download, Inbox as InboxIcon, PlusCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecentEnquiry } from '../../../types/dashboard';
import { EnquiryDetailModal } from './EnquiryDetailModal';
import { exportEnquiriesToCsv } from '../../lib/exportCsv';
import { useToast } from '../../context/ToastContext';

interface RecentEnquiriesTableProps {
  enquiries: RecentEnquiry[];
}

const RecentEnquiriesTableComponent: React.FC<RecentEnquiriesTableProps> = ({ enquiries = [] }) => {
  const [selectedEnquiry, setSelectedEnquiry] = useState<RecentEnquiry | null>(null);
  const { toast } = useToast();

  const handleExportCsv = () => {
    if (!enquiries || enquiries.length === 0) {
      toast.warning('No enquiries available to export');
      return;
    }

    try {
      const filename = `mnm-enquiries-${new Date().toISOString().split('T')[0]}.csv`;
      const success = exportEnquiriesToCsv(enquiries, filename);
      if (success) {
        toast.success(`Successfully exported ${enquiries.length} enquiries to CSV`);
      } else {
        toast.error('Failed to generate CSV export');
      }
    } catch (err: any) {
      console.error('CSV Export error:', err);
      toast.error('Error generating CSV file');
    }
  };

  const getStatusBadge = (status: RecentEnquiry['status']) => {
    switch (status) {
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Converted
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Contacted
          </span>
        );
      case 'new':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            New
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-xs overflow-hidden transition-shadow duration-200 hover:shadow-md">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Recent Enquiries
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Latest incoming trip requests and leads from website visitors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={enquiries.length === 0}
              className="px-3.5 py-2 min-h-[40px] bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label="Export enquiries to CSV spreadsheet"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {/* Link to Inbox */}
            <Link
              to="/admin/inbox"
              className="px-3.5 py-2 min-h-[40px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <span>Open Inbox</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {enquiries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <InboxIcon size={26} />
            </div>
            <div className="max-w-sm space-y-1">
              <h4 className="text-sm font-bold text-slate-800">
                No enquiries yet
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer enquiries through the booking form or WhatsApp will appear here automatically.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/admin/packages"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Package size={14} />
                <span>View Packages</span>
              </Link>
              <Link
                to="/admin/blogs/create"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle size={14} />
                <span>Create Blog</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Interested In</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => setSelectedEnquiry(enq)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for enquiry from ${enq.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEnquiry(enq);
                      }
                    }}
                  >
                    {/* Customer Name */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform"
                          aria-hidden="true"
                        >
                          {enq.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {enq.name}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        {enq.contact.includes('@') ? (
                          <Mail size={13} className="text-slate-400 shrink-0" aria-label="Email" />
                        ) : (
                          <Phone size={13} className="text-slate-400 shrink-0" aria-label="Phone" />
                        )}
                        <span className="truncate max-w-[160px]">{enq.contact}</span>
                      </div>
                    </td>

                    {/* Interested In */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]">
                        {enq.destination}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                        <Clock size={12} aria-hidden="true" />
                        <span>{enq.date}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(enq.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEnquiry(enq);
                        }}
                        className="px-3 py-1.5 min-h-[36px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-slate-200/60 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                        aria-label={`View details for ${enq.name}`}
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <EnquiryDetailModal
        enquiry={selectedEnquiry}
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
      />
    </>
  );
};

export const RecentEnquiriesTable = React.memo(RecentEnquiriesTableComponent);
