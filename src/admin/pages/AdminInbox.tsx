import { useState, useEffect } from 'react';
import { Mail, Search, Clock } from 'lucide-react';

export const AdminInbox = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // This will be replaced by the user's actual AWS Lambda API endpoint
  const API_URL = 'https://p86hnz1tyf.execute-api.us-east-1.amazonaws.com/prod/enquiries';
  console.log('Using Inbox API:', API_URL);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <div className="flex items-center gap-3">
           <div className="relative flex items-center group">
              <Search size={14} className="absolute left-3.5 text-gray-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search enquiries..." 
                className="pl-10 pr-4 py-2 bg-white/60 border border-white/60 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-64 shadow-sm"
              />
            </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6 min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Mail size={48} className="mb-4 opacity-50" />
            <p>No enquiries yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{enq.name}</h3>
                    <div className="text-sm text-gray-500 flex gap-4">
                      <span>{enq.email}</span>
                      <span>{enq.phone}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(enq.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="my-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                   <div><span className="text-gray-500">Package:</span> <span className="font-semibold">{enq.packageName}</span></div>
                   <div><span className="text-gray-500">Type:</span> <span className="font-semibold">{enq.travelType}</span></div>
                   <div><span className="text-gray-500">Budget:</span> <span className="font-semibold">{enq.budget}</span></div>
                   <div><span className="text-gray-500">Travelers:</span> <span className="font-semibold">{enq.travelers}</span></div>
                </div>
                {enq.message && (
                  <p className="text-gray-700 text-sm italic border-l-2 border-[#FF9933] pl-3 mt-2">{enq.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
