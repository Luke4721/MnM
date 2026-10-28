import React, { useState } from 'react';
import {
  Bot,
  User,
  Sparkles,
  Send,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Search,
  BookOpen,
  FolderGit2,
  HelpCircle,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export interface SourceDocument {
  id: string;
  title: string;
  category: 'Luxury Travel' | 'Corporate & MICE' | 'Operations SOP';
  budgetOrSpec: string;
  summary: string;
  fullContent: string;
  tags: string[];
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citedDocumentIds?: string[];
}

export const MOCK_SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    id: 'doc-bali',
    title: 'Bali Honeymoon Package',
    category: 'Luxury Travel',
    budgetOrSpec: '₹2.5L - ₹3.0L per couple',
    summary:
      '7D/6N ultra-luxury honeymoon package featuring private pool villa in Seminyak & Ubud, floating breakfast, Nusa Penida catamaran charter, and VIP airport fast-track.',
    fullContent: `MNM TRAVELS - OFFICIAL PRODUCT SPECIFICATION
TITLE: Bali Honeymoon Package (Signature Luxury Tier)
TARGET BUDGET: ₹2,50,000 - ₹3,00,000 per couple
DURATION: 7 Days / 6 Nights (3N Seminyak + 3N Ubud)

KEY INCLUSIONS:
1. Accommodation: 3 Nights Private Pool Villa at The Kayon Jungle Resort (Ubud) and 3 Nights Beachfront Pool Villa at W Bali (Seminyak).
2. Dining: Daily gourmet breakfast including 1 signature floating breakfast in private pool; 1 four-course candlelit beachside dinner with imported wine.
3. Exclusive Activities:
   - Private catamaran sunset charter to Nusa Penida with snorkeling at Manta Point.
   - 120-minute Balinese couple herbal spa ritual.
   - Ubud sacred monkey forest and Tegalalang rice terrace sunrise photography tour.
4. VIP Logistics: Private luxury Mercedes-Benz airport transfers with expedited VIP immigration fast-track clearance at Denpasar (DPS) Airport.

COMMERCIAL & BOOKING POLICIES:
- Advance Deposit: 30% non-refundable upon slot confirmation.
- Balance Payment: Due 15 days prior to arrival.
- Peak Surcharge: Applied between Dec 20 - Jan 10 (+15%).`,
    tags: ['Bali', 'Honeymoon', 'Private Villa', 'Luxury', 'Nusa Penida'],
    lastUpdated: 'Oct 2026',
  },
  {
    id: 'doc-rajasthan',
    title: 'Rajasthan Corporate Retreat',
    category: 'Corporate & MICE',
    budgetOrSpec: '₹4.0L - ₹5.0L per group (up to 20 pax)',
    summary:
      '4D/3N executive leadership offsite hosted across heritage palace properties in Jaipur & Udaipur with dedicated conference ballroom, royal gala banquet, and desert safari.',
    fullContent: `MNM TRAVELS - CORPORATE MICE ITINERARY SPECIFICATION
TITLE: Rajasthan Corporate Retreat (Executive Leadership Edition)
TARGET BUDGET: ₹4,00,000 - ₹5,00,000 per delegation (Up to 20 executives)
DURATION: 4 Days / 3 Nights (Jaipur & Udaipur Heritage Circuit)

KEY INCLUSIONS:
1. Heritage Palatial Lodging: 20 Premier Heritage Rooms at Alila Fort Bishangarh (Jaipur) or Shiv Niwas Palace (Udaipur).
2. Business & Conference Facilities:
   - Dedicated state-of-the-art conference ballroom with high-speed fiber internet, 4K audiovisual projections, and hybrid conferencing setup.
   - Continuous artisanal tea/coffee service and executive working lunch buffet.
3. Networking & Experiences:
   - Royal Rajasthani welcome with traditional dhol musicians and garland reception.
   - Gala Networking Dinner in the palace courtyard featuring live folk dancers and Sufi musicians.
   - Curated sunset team-building excursion: vintage car rally through old Jaipur or private sunset boat cruise on Lake Pichola.
4. Logistics & Security: 2 dedicated 25-seater luxury Volvo coaches with luggage escorts and dedicated on-ground trip manager available 24/7.

BOOKING & CONTRACT TERMS:
- Contract Confirmation: 50% advance against hotel room block release.
- GST Invoicing: 18% Corporate GST compliant invoicing with Razorpay corporate gateway support.`,
    tags: ['Rajasthan', 'Corporate', 'MICE', 'Heritage Hotel', 'Executive'],
    lastUpdated: 'Oct 2026',
  },
  {
    id: 'doc-turmeric',
    title: 'Turmeric Sourcing SOP',
    category: 'Operations SOP',
    budgetOrSpec: '>= 7.5% Curcumin, < 10% Moisture',
    summary:
      'Standard Operating Procedure for Lakadong & Salem organic turmeric procurement for luxury corporate gifting hampers and wellness guest amenities.',
    fullContent: `MNM TRAVELS & LIVING - STANDARD OPERATING PROCEDURE (SOP-OPS-042)
TITLE: Organic Turmeric Procurement & Quality Assurance Standard
APPLICATION: Luxury client welcome hampers, wellness retreat amenities, and corporate gifting partnerships.

1. BOTANICAL & LAB QUALITY CRITERIA:
- Varietals Permitted: Meghalaya Lakadong Turmeric (Primary) or Erode/Salem Organic Salem Turmeric (Secondary).
- Curcumin Concentration: Strictly >= 7.5% verified via certified third-party HPLC (High-Performance Liquid Chromatography) laboratory assay.
- Moisture Content: Maximum allowable threshold is < 10.0% by weight to inhibit aflatoxin growth.
- Purity Standard: 100% pure organic rhizome powder; zero synthetic fillers, zero artificial colorants (Metanil yellow test strictly negative), and zero heavy metal contaminants.

2. ETHICAL SOURCING & PROCUREMENT PIPELINE:
- Source direct from registered women-led Farmer Producer Organizations (FPOs) in Jaintia Hills, Meghalaya.
- Transparent farm-gate pricing with guaranteed minimum 20% fair-trade premium over regional mandi rates.

3. PACKAGING, STORAGE & COMPLIANCE:
- Packaging: Double-ply food-grade vacuum-sealed barrier pouches inside UV-coated recyclable matte canisters.
- Storage: Climate-controlled warehouse maintained at 18°C - 22°C with relative humidity below 50%.
- Lot Traceability: Every single batch container must print a unique QR code linking to its batch HPLC lab Certificate of Analysis (COA) and harvest date.`,
    tags: ['SOP', 'Turmeric', 'Quality Assurance', 'Corporate Gifting', 'Organic'],
    lastUpdated: 'Oct 2026',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `Hello! I am the **MNM Company Brain**, your internal knowledge intelligence engine.\n\nI have indexed all official company packages, corporate retreat specifications, and operational SOPs. Ask me anything about our Bali Honeymoon Package, Rajasthan Corporate Retreat, or the Turmeric Sourcing SOP.`,
    timestamp: 'Just now',
    citedDocumentIds: ['doc-bali', 'doc-rajasthan', 'doc-turmeric'],
  },
];

const SAMPLE_QUESTIONS = [
  'What is the pricing and villa inclusion for the Bali Honeymoon package?',
  'What facilities are included in the Rajasthan Corporate Retreat for 20 pax?',
  'What are the curcumin and moisture standards in the Turmeric Sourcing SOP?',
  'What is our cancellation policy for the Bali Honeymoon package?',
];

export const CompanyBrain: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<SourceDocument | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [searchDocFilter, setSearchDocFilter] = useState('');
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * Submit Query to Company Brain
   * Uses OpenRouter via import.meta.env.VITE_OPENROUTER_KEY
   * Passes mock source documents as grounded context
   */
  const handleAskQuestion = async (questionText?: string) => {
    const query = (questionText || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setApiNotice(null);

    // Retrieve Vite environment variable
    const openRouterKey =
      import.meta.env.VITE_OPENROUTER_KEY ||
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      (typeof process !== 'undefined' && process.env?.REACT_APP_OPENROUTER_API_KEY) ||
      '';

    // Compile documents into grounded context
    const contextText = MOCK_SOURCE_DOCUMENTS.map(
      (doc) =>
        `=== DOCUMENT: [${doc.id}] ${doc.title} (${doc.category}) ===\nBudget/Specs: ${doc.budgetOrSpec}\nSummary: ${doc.summary}\nFull Content:\n${doc.fullContent}\n`
    ).join('\n\n');

    const systemPrompt = `You are the MNM Travels Company Brain, an internal AI knowledge oracle.
You must answer team questions accurately, authoritatively, and concisely based strictly on the Company Source Documents provided below.

When quoting numbers, inclusions, or SOP rules:
- Be exact with budgets, percentages, hotel names, and test standards.
- Cite the source document by name (e.g. "[Source: Bali Honeymoon Package]").
- Format your response with clean markdown headings and bullet points.

=== COMPANY SOURCE DOCUMENTS ===
${contextText}`;

    try {
      if (!openRouterKey) {
        // Fallback simulation when VITE_OPENROUTER_KEY is not configured in local environment
        console.warn(
          '[CompanyBrain] import.meta.env.VITE_OPENROUTER_KEY not detected. Using grounded knowledge base fallback.'
        );
        await new Promise((resolve) => setTimeout(resolve, 1200));

        let fallbackAnswer = '';
        const q = query.toLowerCase();

        if (q.includes('bali') || q.includes('villa') || q.includes('honeymoon')) {
          fallbackAnswer = `### Bali Honeymoon Package (Signature Luxury Tier)
**Budget**: ₹2.5L - ₹3.0L per couple | **Duration**: 7 Days / 6 Nights

**Key Inclusions:**
- **Accommodations**: 3 Nights Private Pool Villa at The Kayon Jungle Resort (Ubud) + 3 Nights Beachfront Pool Villa at W Bali (Seminyak).
- **Dining**: Daily gourmet breakfasts, 1 floating breakfast in private pool, and 1 candlelit beachside dinner with wine.
- **Experiences**: Private catamaran sunset charter to Nusa Penida, 120-min Balinese couple spa, and Ubud rice terrace sunrise tour.
- **Logistics**: Private Mercedes-Benz transfers with Denpasar VIP airport fast-track immigration.
- **Payment Policy**: 30% non-refundable advance; balance due 15 days prior. Peak surcharge of +15% applies Dec 20 - Jan 10.

*[Source: Bali Honeymoon Package]*`;
        } else if (q.includes('rajasthan') || q.includes('corporate') || q.includes('retreat') || q.includes('pax')) {
          fallbackAnswer = `### Rajasthan Corporate Retreat (Executive Leadership Edition)
**Budget**: ₹4.0L - ₹5.0L per delegation (Up to 20 executives) | **Duration**: 4 Days / 3 Nights

**Key Inclusions:**
- **Accommodations**: 20 Premier Heritage Rooms at Alila Fort Bishangarh (Jaipur) or Shiv Niwas Palace (Udaipur).
- **Conference Infrastructure**: Dedicated high-speed 4K AV conference ballroom with hybrid setup and artisanal working lunch buffet.
- **Networking & Evenings**: Royal Rajasthani welcome with dhol, courtyard Gala Dinner with live Sufi & folk dancers, vintage car rally tour or Lake Pichola boat cruise.
- **Logistics**: 2 luxury 25-seater Volvo coaches with dedicated 24/7 trip manager.
- **Contract Terms**: 50% advance for room block release; 18% Corporate GST compliant.

*[Source: Rajasthan Corporate Retreat]*`;
        } else if (q.includes('turmeric') || q.includes('sop') || q.includes('curcumin') || q.includes('moisture')) {
          fallbackAnswer = `### Turmeric Sourcing SOP (SOP-OPS-042)
**Application**: Welcome hampers, wellness amenities, and corporate gifting.

**Strict Quality Standards:**
- **Curcumin Concentration**: Strictly **>= 7.5%** verified by third-party HPLC assay.
- **Moisture Threshold**: Strictly **< 10.0%** by weight (prevents aflatoxin formation).
- **Varietals**: Meghalaya Lakadong (Primary) or Salem Organic (Secondary). 100% pure; zero fillers, heavy metals, or Metanil yellow.
- **Ethical Sourcing**: Sourced directly from women-led FPOs in Jaintia Hills, Meghalaya with minimum 20% fair-trade premium over mandi rates.
- **Compliance**: Double-ply food-grade vacuum pouches, UV-coated canisters, batch-numbered QR codes linked to lab COA.

*[Source: Turmeric Sourcing SOP]*`;
        } else {
          fallbackAnswer = `Based on the internal MNM Company Brain knowledge base:

1. **Bali Honeymoon Package**: 7D/6N private pool villa package priced at ₹2.5L - ₹3.0L with floating breakfast and Nusa Penida catamaran charter.
2. **Rajasthan Corporate Retreat**: 4D/3N heritage palace offsite priced at ₹4.0L - ₹5.0L for up to 20 pax with dedicated AV ballroom and gala banquets.
3. **Turmeric Sourcing SOP**: High-grade procurement standard requiring >= 7.5% curcumin and < 10% moisture with third-party HPLC testing.

*[Source: MNM Company Brain Knowledge Base]*`;
        }

        const botMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: fallbackAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citedDocumentIds: ['doc-bali', 'doc-rajasthan', 'doc-turmeric'],
        };

        setMessages((prev) => [...prev, botMessage]);
        setApiNotice(
          'Query answered from local grounded documents. To stream live from OpenRouter, set VITE_OPENROUTER_KEY in your .env.local file.'
        );
        return;
      }

      // Live OpenRouter Fetch
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': window.location.origin || 'https://mnmtravels.com',
          'X-Title': 'MNM Company Brain',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `OpenRouter returned HTTP status ${response.status}`
        );
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content?.trim();

      if (aiResponse) {
        const botMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citedDocumentIds: ['doc-bali', 'doc-rajasthan', 'doc-turmeric'],
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('No answer content returned from OpenRouter.');
      }
    } catch (err: any) {
      console.error('[CompanyBrain] Query error:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `**Error connecting to OpenRouter**: ${err.message || 'Network request failed'}.\n\nPlease ensure \`VITE_OPENROUTER_KEY\` is valid and has sufficient credits on OpenRouter.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = MOCK_SOURCE_DOCUMENTS.filter((doc) => {
    const q = searchDocFilter.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-2xl shadow-xs">
                <Sparkles size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Brain</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Knowledge Oracle
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Natural language retrieval over verified package specs, corporate offsite catalogs, and operational SOPs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-800">Knowledge Base:</span>
            <span>3 Active Sources</span>
          </div>
        </div>

        {/* Global Informational Banner */}
        {apiNotice && (
          <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/90 text-blue-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600 shrink-0" />
              <span>{apiNotice}</span>
            </div>
            <button
              onClick={() => setApiNotice(null)}
              className="text-blue-600 hover:text-blue-900 font-semibold px-2 py-0.5 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Two-Column Layout: Chat on Left, Source Documents on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================
              LEFT COLUMN: ChatGPT-Style Chat Window (lg:col-span-7 or 8)
          =================================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col h-[700px] overflow-hidden">
            {/* Chat Window Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Company Brain AI Agent
                  </h3>
                  <p className="text-[11px] text-slate-400">Model: OpenRouter / Gemini 2.5 Flash</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMessages(INITIAL_MESSAGES)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Reset conversation"
                >
                  <RefreshCw size={13} />
                  <span>Clear Chat</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      isAssistant ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                        isAssistant
                          ? 'bg-slate-50/90 text-slate-800 border border-slate-200/90'
                          : 'bg-slate-900 text-white shadow-slate-900/10'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans space-y-2">
                        {msg.text}
                      </div>

                      {/* Assistant citations / copy action */}
                      {isAssistant && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <BookOpen size={12} className="text-indigo-500" />
                            <span>Grounded in Company Documents</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="hover:text-slate-700 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                          >
                            {copiedIndex === msg.id ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-1 font-semibold text-xs">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <RefreshCw size={15} className="animate-spin" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Analyzing Company Brain documents via OpenRouter...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
              <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskQuestion(q)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shrink-0 transition-colors shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200/90 bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                className="flex items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Company Brain about packages, pricing, SOP rules..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <HelpCircle size={15} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Press Enter to send inquiry</span>
                <span>Powered by OpenRouter API</span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: Source Documents Panel (lg:col-span-5 or 4)
          =================================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FolderGit2 size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Source Documents</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  {MOCK_SOURCE_DOCUMENTS.length} Docs
                </span>
              </div>

              {/* Search documents */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Filter knowledge documents..."
                  value={searchDocFilter}
                  onChange={(e) => setSearchDocFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocForModal(doc)}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 cursor-pointer transition-all hover:shadow-xs group space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                          <FileText size={14} />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {doc.title}
                        </h4>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                        {doc.category}
                      </span>
                      <span className="font-mono text-slate-600">{doc.budgetOrSpec}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {doc.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {doc.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/60 text-slate-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredDocs.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No documents match "{searchDocFilter}".
                  </div>
                )}
              </div>

              {/* Panel Footnote */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Grounding: 100% Verified</span>
                <span>Click card to inspect full text</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Document View Modal */}
      {selectedDocForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 relative max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                  {selectedDocForModal.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedDocForModal.title}
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Spec: {selectedDocForModal.budgetOrSpec}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocForModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {selectedDocForModal.fullContent}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Last audited: {selectedDocForModal.lastUpdated}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedDocForModal.fullContent);
                  setSelectedDocForModal(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Copy Full Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyBrain;
