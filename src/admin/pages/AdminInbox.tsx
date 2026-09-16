import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Search, Clock, RefreshCw, Phone, User } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AdminInbox: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL =
    'https://p86hnz1tyf.execute-api.us-east-1.amazonaws.com/prod/enquiries';

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEnquiries(data);
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.error('[AdminInbox] Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;
    const q = searchQuery.toLowerCase().trim();
    return enquiries.filter((enq) => {
      return (
        enq.name?.toLowerCase().includes(q) ||
        enq.email?.toLowerCase().includes(q) ||
        enq.phone?.toLowerCase().includes(q) ||
        enq.packageName?.toLowerCase().includes(q) ||
        enq.message?.toLowerCase().includes(q)
      );
    });
  }, [enquiries, searchQuery]);

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 relative z-10 pb-16">
      {/* Header */}
      <PageHeader
        title="Enquiry Inbox"
        description="Customer trip queries, custom package requests, and lead enquiries."
        breadcrumbs={[
          { label: 'App', href: '/admin/inbox' },
          { label: 'Inbox', href: '/admin/inbox' },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            iconLeft={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            onClick={fetchEnquiries}
          >
            Refresh
          </Button>
        }
      />

      {/* Main Container */}
      <Card className="min-h-[60vh] flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search enquiries by name, email, package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconLeft={<Search size={15} />}
            />
          </div>

          <span className="text-xs text-gray-500 font-medium self-end sm:self-auto">
            Showing <strong className="text-gray-900">{filteredEnquiries.length}</strong> of{' '}
            {enquiries.length} enquiries
          </span>
        </div>

        {/* Content Viewport */}
        <div className="p-6 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <LoadingSpinner size="lg" variant="primary" />
              <span className="text-[13px] font-medium">Loading customer enquiries...</span>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <div className="w-16 h-16 rounded-3xl bg-white/60 border border-white/60 flex items-center justify-center shadow-sm">
                <Mail size={32} className="stroke-[1.5] text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No enquiries found</p>
              <p className="text-xs text-gray-400 max-w-sm text-center">
                {searchQuery
                  ? 'Try searching with different terms or clear the search filter.'
                  : 'New customer enquiries from package booking forms will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnquiries.map((enq) => (
                <div
                  key={enq.id || enq.timestamp}
                  className="p-5 rounded-2xl border border-white/60 bg-white/60 hover:bg-white/90 hover:shadow-md transition-all shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {enq.name?.charAt(0)?.toUpperCase() || <User size={18} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{enq.name}</h3>
                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 mt-0.5">
                          {enq.email && (
                            <a
                              href={`mailto:${enq.email}`}
                              className="hover:text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Mail size={12} /> {enq.email}
                            </a>
                          )}
                          {enq.phone && (
                            <a
                              href={`tel:${enq.phone}`}
                              className="hover:text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Phone size={12} /> {enq.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 flex items-center gap-1 self-start sm:self-auto bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      <Clock size={12} />
                      {enq.timestamp ? new Date(enq.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/60 p-3 rounded-xl border border-white/60">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Package
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enq.packageName || 'General Query'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Type
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enq.travelType || 'Standard'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Budget
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enq.budget || 'Flexible'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">
                        Travelers
                      </span>
                      <span className="font-semibold text-gray-900">
                        {enq.travelers || '1'}
                      </span>
                    </div>
                  </div>

                  {enq.message && (
                    <p className="text-gray-700 text-xs italic border-l-2 border-[#FF9933] pl-3 py-1 bg-orange-50/30 rounded-r-lg">
                      "{enq.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminInbox;
