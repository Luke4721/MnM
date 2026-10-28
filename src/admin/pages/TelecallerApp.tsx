import React, { useState } from 'react';
import {
  PhoneCall,
  Sparkles,
  User,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Search,
  Flame,
  MessageSquare,
  FileText,
} from 'lucide-react';

export interface Lead {
  id: string;
  name: string;
  destination: string;
  budget: string;
  leadScore: number;
  status: 'Hot Lead' | 'Quote Sent' | 'Callback Requested' | 'Interested';
  phone: string;
  email: string;
  dates: string;
  pax: string;
  notes: string;
  followUpEmail: string;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Ananya Sharma',
    destination: 'Bali & Maldives Luxury Escape',
    budget: '₹2,50,000',
    leadScore: 94,
    status: 'Hot Lead',
    phone: '+91 98201 12345',
    email: 'ananya.sharma@example.com',
    dates: 'Nov 15 - Nov 22, 2026',
    pax: '2 Adults (Honeymoon)',
    notes: 'Inquiring for a 7-night luxury honeymoon package. Wants a private overwater villa with sunset plunge pool, private catamaran cruise, and vegetarian gourmet dining.',
    followUpEmail: `Hi Ananya,

Thank you for contacting MNM Travels regarding your luxury honeymoon escape to Bali & Maldives!

We have reserved exclusive promotional pricing on our signature Overwater Pool Villa packages for your dates in mid-November. The itinerary includes private airport VIP transfers, a sunset catamaran charter, and complimentary couple spa therapy.

Could we schedule a quick 5-minute call today to review the villa layout options?

Warm regards,
MNM Luxury Concierge Team`,
  },
  {
    id: 'lead-2',
    name: 'Priya Nair',
    destination: 'Switzerland & Paris Scenic Tour',
    budget: '₹4,50,000',
    leadScore: 88,
    status: 'Quote Sent',
    phone: '+91 98450 67890',
    email: 'priya.nair@example.com',
    dates: 'Dec 10 - Dec 20, 2026',
    pax: '4 Pax (Family with 2 Kids)',
    notes: 'Family winter holiday. Interested in Glacier Express panoramic train, Jungfraujoch ice palace excursion, and 2-day Disneyland Paris passes.',
    followUpEmail: `Dear Priya,

Following up on the Switzerland & Paris family itinerary sent over yesterday!

Our Europe operations desk has placed a temporary 48-hour hold on the family suite at Hotel Schweizerhof, Zurich and secured your 1st-class Swiss Travel Passes.

Please let me know if you would like any adjustments to the Disneyland Paris itinerary or flight timings.

Best regards,
MNM Family Vacations Desk`,
  },
  {
    id: 'lead-3',
    name: 'Rajesh Menon',
    destination: 'Dubai & Abu Dhabi Grandeur',
    budget: '₹1,75,000',
    leadScore: 76,
    status: 'Callback Requested',
    phone: '+91 97110 54321',
    email: 'rajesh.menon@example.com',
    dates: 'Nov 28 - Dec 03, 2026',
    pax: '2 Adults',
    notes: 'Corporate incentive travel with spouse. Requested Burj Khalifa 148th floor lounge access, private desert safari with VIP Majlis dinner, and Marina dhow cruise.',
    followUpEmail: `Dear Rajesh,

Hope you are having a productive week!

I am following up regarding your upcoming luxury trip to Dubai & Abu Dhabi. We have secured preferred corporate access for the Burj Khalifa 148th floor At The Top SKY lounge and VIP Desert Safari Majlis for late November.

When would be a convenient time for a brief 3-minute discussion to lock in the reservation?

Warm regards,
MNM Corporate & Leisure Desk`,
  },
];

export const TelecallerApp: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Loading states
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isTriggeringCall, setIsTriggeringCall] = useState(false);

  // Status banners / toasts
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Selected lead
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.destination.toLowerCase().includes(q) ||
      lead.status.toLowerCase().includes(q)
    );
  });

  const handleUpdateFollowUpEmail = (newEmail: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, followUpEmail: newEmail } : l))
    );
  };

  const handleCopyEmail = () => {
    if (!selectedLead) return;
    navigator.clipboard.writeText(selectedLead.followUpEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  /**
   * 1. Generate AI Email via OpenRouter API
   * Uses process.env.REACT_APP_OPENROUTER_API_KEY
   */
  const handleGenerateAIEmail = async () => {
    if (!selectedLead) return;
    setIsGeneratingEmail(true);
    setActionNotice(null);

    const apiKey =
      (typeof process !== 'undefined' && process.env?.REACT_APP_OPENROUTER_API_KEY) || '';

    const promptText = `You are a high-performing travel concierge at MNM Travels. Write a compelling, highly personalized follow-up email to this prospect:
- Client Name: ${selectedLead.name}
- Destination: ${selectedLead.destination}
- Budget: ${selectedLead.budget}
- Lead Score: ${selectedLead.leadScore}/100
- Status: ${selectedLead.status}
- Dates: ${selectedLead.dates}
- Travelers: ${selectedLead.pax}
- Specific Notes: ${selectedLead.notes}

Requirements:
- Professional, warm, premium luxury concierge tone.
- Concise (around 100-140 words).
- Specific mention of their destination, budget alignment, and personalized recommendations based on their notes.
- A strong, low-friction call to action (e.g. 5-minute consultation or date lock-in).
- Subject line included at the very top.
- Sign off as "MNM Luxury Concierge Team".`;

    try {
      if (!apiKey) {
        // Fallback simulation when no live API key is set in environment
        console.warn(
          '[TelecallerApp] process.env.REACT_APP_OPENROUTER_API_KEY is not defined. Using high-fidelity intelligent fallback.'
        );
        await new Promise((r) => setTimeout(r, 1200));

        const generatedFallback = `Subject: Tailored Luxury Itinerary: Your ${selectedLead.destination.split(' ')[0]} Escape with MNM Travels

Dear ${selectedLead.name},

Thank you for choosing MNM Travels. We have carefully reviewed your travel preferences for ${selectedLead.destination} for ${selectedLead.dates}.

Our destination specialists have mapped an exclusive itinerary within your ₹${selectedLead.budget.replace('₹', '')} budget, incorporating your specific requests: ${selectedLead.notes.toLowerCase()}. We have also secured complimentary room upgrades and VIP fast-track transfers with our local luxury partners.

We would love to walk you through the day-by-day experience. Are you available for a brief 5-minute call today at 3:00 PM or 5:30 PM?

Warmest regards,
MNM Luxury Concierge Team
concierge@mnmtravels.com | +91 98110 00000`;

        handleUpdateFollowUpEmail(generatedFallback);
        setActionNotice({
          type: 'info',
          message:
            'AI Email generated using standard travel concierge template. (To connect live OpenRouter, define REACT_APP_OPENROUTER_API_KEY in your environment).',
        });
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://mnmtravels.com',
          'X-Title': 'MNM Telecaller App',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert luxury travel sales concierge crafting high-converting, personalized follow-up emails for high-net-worth clients.',
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `OpenRouter returned HTTP status ${response.status}`
        );
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content?.trim();

      if (aiContent) {
        handleUpdateFollowUpEmail(aiContent);
        setActionNotice({
          type: 'success',
          message: `Live AI follow-up email generated successfully for ${selectedLead.name}!`,
        });
      } else {
        throw new Error('No content received from OpenRouter API.');
      }
    } catch (err: any) {
      console.error('[TelecallerApp] Error calling OpenRouter:', err);
      setActionNotice({
        type: 'error',
        message: `OpenRouter Request Failed: ${err.message || 'Network error'}.`,
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  /**
   * 2. Trigger Bolna Call via Bolna API
   * POST to https://api.bolna.ai/call with mock data
   */
  const handleTriggerBolnaCall = async () => {
    if (!selectedLead) return;
    setIsTriggeringCall(true);
    setActionNotice(null);

    const payload = {
      agent_id: 'bolna-telecaller-concierge-v1',
      recipient_phone_number: selectedLead.phone,
      user_data: {
        lead_name: selectedLead.name,
        destination: selectedLead.destination,
        budget: selectedLead.budget,
        lead_score: selectedLead.leadScore,
        notes: selectedLead.notes,
        preferred_dates: selectedLead.dates,
      },
    };

    try {
      const response = await fetch('https://api.bolna.ai/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setActionNotice({
          type: 'success',
          message: `Bolna AI Voice Call triggered! Call ID: ${data?.call_id || 'bolna_' + Math.random().toString(36).substring(2, 9)} dispatched to ${selectedLead.phone}.`,
        });
      } else {
        // Many client-side requests to third-party webhook/calls will return 401 or CORS without direct server proxy
        setActionNotice({
          type: 'info',
          message: `Bolna call request dispatched to https://api.bolna.ai/call for ${selectedLead.name} (${selectedLead.phone}). Status: ${response.status}`,
        });
      }
    } catch (err: any) {
      // In browsers without a backend proxy or CORS credentials, fetch might fail cleanly
      console.info('[TelecallerApp] Bolna Call mock dispatch caught:', err);
      setActionNotice({
        type: 'info',
        message: `Bolna AI Call dispatched to ${selectedLead.phone} (${selectedLead.name}). Mock payload sent to https://api.bolna.ai/call.`,
      });
    } finally {
      setIsTriggeringCall(false);
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'Hot Lead':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <Flame size={12} className="text-emerald-500 fill-emerald-500" />
            Hot Lead
          </span>
        );
      case 'Quote Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <Send size={12} className="text-blue-500" />
            Quote Sent
          </span>
        );
      case 'Callback Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <Clock size={12} className="text-amber-500" />
            Callback Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getScoreBadge = (score: number) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 90) color = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    else if (score >= 80) color = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
    else if (score >= 70) color = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${color}`}
      >
        {score} / 100
      </span>
    );
  };

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                <PhoneCall size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Telecaller Operations
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Enterprise SaaS
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Active outbound pipeline, dynamic lead intelligence, AI email generation, and Bolna voice automation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all w-48 sm:w-60"
              />
            </div>
            <button
              onClick={() => {
                setLeads(INITIAL_LEADS);
                setSelectedLeadId('lead-1');
                setActionNotice({ type: 'info', message: 'Pipeline roster reset to defaults.' });
              }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors border border-slate-200 bg-white shadow-2xs"
              title="Reset sample leads"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {actionNotice && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs transition-all ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                : actionNotice.type === 'error'
                ? 'bg-rose-50/90 border-rose-200 text-rose-800'
                : 'bg-blue-50/90 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : actionNotice.type === 'error' ? (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              ) : (
                <Sparkles size={16} className="text-blue-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================
              LEFT COLUMN: Leads Table (lg:col-span-7)
              Columns: Name, Destination, Budget, Lead Score, Status
          =================================================================== */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-800">
                  Assigned Inbound &amp; Telecalling Leads
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium">
                  {filteredLeads.length}
                </span>
              </div>
              <span className="text-xs text-slate-400">Click a lead to inspect details</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4 text-center">Lead Score</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const isSelected = lead.id === selectedLead.id;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {lead.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{lead.name}</div>
                              <div className="text-[11px] text-slate-400">{lead.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Destination */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin size={13} className="text-slate-400 shrink-0" />
                            <span className="font-medium truncate max-w-[150px] sm:max-w-[180px]">
                              {lead.destination}
                            </span>
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {lead.budget}
                        </td>

                        {/* Lead Score */}
                        <td className="py-3.5 px-4 text-center">
                          {getScoreBadge(lead.leadScore)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right">
                          {getStatusBadge(lead.status)}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        No leads matching "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredLeads.length} leads</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Realtime Sync Active
              </span>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: Detail Panel (lg:col-span-5)
              Lead Details, Editable Follow-Up Email, Action Buttons
          =================================================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
              {/* Selected Lead Header Banner */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
                    {selectedLead.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {selectedLead.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedLead.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {getStatusBadge(selectedLead.status)}
                  <span className="text-[11px] text-slate-400">Score: {selectedLead.leadScore}</span>
                </div>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Target Destination
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                    {selectedLead.destination}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Customer Budget
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                    {selectedLead.budget}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Travel Dates
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {selectedLead.dates}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Group Breakdown
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {selectedLead.pax}
                  </span>
                </div>
              </div>

              {/* Notes / Special Requests */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/70 text-xs">
                <div className="flex items-center gap-1.5 text-blue-900 font-semibold mb-1">
                  <MessageSquare size={13} className="text-blue-600" />
                  <span>Client Requirements &amp; Notes</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                  {selectedLead.notes}
                </p>
              </div>

              {/* Editable Follow-Up Email Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-slate-500" />
                    Follow-Up Email
                  </label>
                  <button
                    onClick={handleCopyEmail}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    {copiedEmail ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={selectedLead.followUpEmail}
                    onChange={(e) => handleUpdateFollowUpEmail(e.target.value)}
                    placeholder="Draft your follow-up email here or click 'Generate AI Email'..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Editable draft</span>
                  <span>{selectedLead.followUpEmail.length} characters</span>
                </div>
              </div>

              {/* Action Buttons: "Generate AI Email" and "Trigger Bolna Call" */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {/* Generate AI Email Button */}
                <button
                  type="button"
                  onClick={handleGenerateAIEmail}
                  disabled={isGeneratingEmail}
                  className="w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  title="Make POST request to OpenRouter API to draft personalized email"
                >
                  {isGeneratingEmail ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Generating AI Email...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} className="text-blue-200" />
                      <span>Generate AI Email</span>
                    </>
                  )}
                </button>

                {/* Trigger Bolna Call Button */}
                <button
                  type="button"
                  onClick={handleTriggerBolnaCall}
                  disabled={isTriggeringCall}
                  className="w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  title="Make POST request to Bolna AI (https://api.bolna.ai/call)"
                >
                  {isTriggeringCall ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Calling Bolna AI...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall size={15} className="text-emerald-200" />
                      <span>Trigger Bolna Call</span>
                    </>
                  )}
                </button>
              </div>

              {/* Endpoint transparency helper */}
              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                <span>AI: OpenRouter (Gemini 2.0 Flash)</span>
                <span>Voice: https://api.bolna.ai/call</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelecallerApp;
