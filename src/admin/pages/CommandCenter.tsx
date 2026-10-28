import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Zap,
  Bot,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Sliders,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export interface TaskItem {
  id: string;
  employee: string;
  role: string;
  task: string;
  deadline: string;
  status: 'Overdue' | 'In Progress' | 'Pending' | 'Completed';
}

const MOCK_TASKS: TaskItem[] = [
  {
    id: 't-1',
    employee: 'Rohan Verma',
    role: 'Senior Travel Consultant',
    task: 'Finalize luxury Bali villa booking & lock payment link for Ananya Sharma',
    deadline: 'Yesterday, 5:00 PM',
    status: 'Overdue',
  },
  {
    id: 't-2',
    employee: 'Sneha Patel',
    role: 'Operations Executive',
    task: 'Call back Dubai family group re: Swiss visa documentation for Priya Nair',
    deadline: 'Oct 26, 2:00 PM',
    status: 'Overdue',
  },
  {
    id: 't-3',
    employee: 'Vikram Malhotra',
    role: 'Ticketing Specialist',
    task: 'Audit flight availability & bulk seats for Kashmir Diwali group departures',
    deadline: 'Today, 6:00 PM',
    status: 'In Progress',
  },
  {
    id: 't-4',
    employee: 'Kavita Rao',
    role: 'Hotel Concierge',
    task: 'Send hotel confirmation vouchers to Thailand & Phuket honeymooners',
    deadline: 'Tomorrow, 12:00 PM',
    status: 'Pending',
  },
  {
    id: 't-5',
    employee: 'Amit Joshi',
    role: 'Accounts & Audit',
    task: 'Reconcile Razorpay transactions and issue invoice for Dubai VIP booking',
    deadline: 'Completed',
    status: 'Completed',
  },
];

export const CommandCenter: React.FC = () => {
  const [tasks] = useState<TaskItem[]>(MOCK_TASKS);
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    `=== MORNING OPERATIONS REVIEW: AWAITING RUN ===\n\nClick "Run Morning Operations Review" above to dispatch the workforce task ledger to OpenRouter AI.\n\nThe AI Assistant will audit employee accountability, flag critical revenue bottlenecks, and output a ruthless, zero-fluff executive action plan.`
  );
  const [isRunningReview, setIsRunningReview] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const activeLeadsCount = 3;
  const overdueTasksCount = tasks.filter((t) => t.status === 'Overdue').length; // 2
  const hoursSavedMetric = 34.5;

  const handleCopySummary = () => {
    if (!executiveSummary) return;
    navigator.clipboard.writeText(executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  /**
   * Run Morning Operations Review:
   * POST to OpenRouter passing mock task data
   * Uses process.env.REACT_APP_OPENROUTER_API_KEY
   */
  const handleRunMorningReview = async () => {
    setIsRunningReview(true);
    setNotice(null);

    const apiKey =
      (typeof process !== 'undefined' && process.env?.REACT_APP_OPENROUTER_API_KEY) || '';

    const formattedTasksText = tasks
      .map(
        (t, idx) =>
          `${idx + 1}. [${t.status.toUpperCase()}] ${t.employee} (${t.role}): "${t.task}" | Deadline: ${t.deadline}`
      )
      .join('\n');

    const promptText = `Conduct a ruthless, uncompromising Morning Operations Review for MNM Travels.

Operational Metrics:
- Active High-Intent Leads: ${activeLeadsCount}
- Overdue Tasks: ${overdueTasksCount}
- Operational Hours Saved: ${hoursSavedMetric} hours

Current Team Task Roster:
${formattedTasksText}

Your Objective:
Write a ruthless executive summary from the perspective of an elite, no-nonsense Chief Operating Officer (COO).
1. EXECUTIVE BOTTLENECK AUDIT: Call out overdue tasks directly. Name the employees responsible (Rohan Verma and Sneha Patel) and explain the customer/revenue risk of their delays.
2. EFFICIENCY & PROGRESS: Note what is actually moving (Vikram, Kavita, Amit) without blowing sunshine.
3. IMMEDIATE MANDATORY ACTIONS (TODAY): 3 non-negotiable operational directives that must be completed before 12:00 PM IST.

Tone: Razor-sharp, data-driven, assertive, structured, with zero corporate jargon.`;

    try {
      if (!apiKey) {
        console.warn(
          '[CommandCenter] process.env.REACT_APP_OPENROUTER_API_KEY not found in environment. Using high-fidelity executive review fallback.'
        );
        await new Promise((r) => setTimeout(r, 1400));

        const fallbackSummary = `================================================================================
EXECUTIVE MORNING OPERATIONS AUDIT | MNM TRAVELS
DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} | TIME: 09:15 AM IST
METRICS: Active Leads: ${activeLeadsCount} | Overdue Tasks: ${overdueTasksCount} (CRITICAL) | Hours Saved: ${hoursSavedMetric}h
================================================================================

1. CRITICAL BOTTLENECK AUDIT (UNACCEPTABLE SLA BREACHES):
--------------------------------------------------------------------------------
• Rohan Verma (Senior Travel Consultant):
  - Task: Finalize luxury Bali villa booking & lock payment link for Ananya Sharma
  - Status: OVERDUE (Deadline: Yesterday, 5:00 PM)
  - Impact: Ananya Sharma is a 94-score hot honeymoon lead with a ₹2.5L budget. Leaving high-intent clients without locked villa deposits for over 16 hours invites cancellation to rival operators. Unacceptable.

• Sneha Patel (Operations Executive):
  - Task: Call back Dubai family group re: Swiss visa documentation for Priya Nair
  - Status: OVERDUE (Deadline: Oct 26, 2:00 PM — 48+ hours overdue)
  - Impact: Priya Nair’s family holiday is valued at ₹4.5L with a strict Dec 10 departure. Visa slots for Schengen are time-critical; every day lost threatens trip cancellation.

2. WORKFORCE DISCIPLINE & MOVING INVENTORY:
--------------------------------------------------------------------------------
• Vikram Malhotra is tracking on time for Kashmir flight bulk allocations (Due 6:00 PM today). Ensure pricing does not slip.
• Kavita Rao is queued for Thailand vouchers (Due tomorrow).
• Amit Joshi has cleared the Dubai VIP Razorpay reconciliation.

3. MANDATORY 3-POINT DIRECTIVES FOR TODAY:
--------------------------------------------------------------------------------
[1] 10:00 AM DEADLINE: Rohan Verma must send the payment link to Ananya Sharma and confirm receipt on the board.
[2] 11:30 AM DEADLINE: Sneha Patel must complete the call with Priya Nair and file visa acknowledgement into the CRM.
[3] BOLNA DISPATCH: Telecaller desk must trigger follow-ups on all 3 active leads using automated Bolna voice dispatch before lunch.

Audit Signed: COO Operations Desk`;

        setExecutiveSummary(fallbackSummary);
        setLastRunTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setNotice({
          type: 'info',
          message:
            'Ruthless executive review generated using standard operations template. (Set REACT_APP_OPENROUTER_API_KEY to stream live OpenRouter AI models).',
        });
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://mnmtravels.com',
          'X-Title': 'MNM Command Center',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content:
                'You are an elite, uncompromising Chief Operating Officer conducting a ruthless morning operations task audit for a high-end travel company.',
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          temperature: 0.4,
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
        setExecutiveSummary(aiContent);
        setLastRunTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setNotice({
          type: 'success',
          message: 'Live Morning Operations Review generated via OpenRouter!',
        });
      } else {
        throw new Error('No content returned from OpenRouter.');
      }
    } catch (err: any) {
      console.error('[CommandCenter] OpenRouter call failed:', err);
      setNotice({
        type: 'error',
        message: `OpenRouter Request Error: ${err.message || 'Network error'}.`,
      });
    } finally {
      setIsRunningReview(false);
    }
  };

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100/90 text-rose-800 border border-rose-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Overdue
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} className="text-blue-500" />
            In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={12} className="text-amber-500" />
            Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Completed
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
                <Sliders size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Operations
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time enterprise dashboard, workforce SLA tracking, and autonomous AI operational audit.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">Operations Window:</span> 09:00 - 18:00 IST
          </div>
        </div>

        {/* Global Alert Notification */}
        {notice && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                : notice.type === 'error'
                ? 'bg-rose-50/90 border-rose-200 text-rose-800'
                : 'bg-blue-50/90 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : notice.type === 'error' ? (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              ) : (
                <Sparkles size={16} className="text-blue-600 shrink-0" />
              )}
              <span>{notice.message}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* =====================================================================
            TOP METRIC CARDS (3 Cards)
            Active Leads: 3 | Overdue Tasks: 2 | Hours Saved: 34.5
        ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Active Leads: 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Leads
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeLeadsCount}
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <ArrowUpRight size={14} /> +12% this week
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              High-intent inbound inquiries undergoing telecaller follow-up.
            </p>
          </div>

          {/* Card 2: Overdue Tasks: 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Overdue Tasks
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {overdueTasksCount}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Breached SLAs
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Immediate escalation needed to prevent customer drop-off.
            </p>
          </div>

          {/* Card 3: Hours Saved: 34.5 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hours Saved
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {hoursSavedMetric}
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp size={14} /> +18.2% vs sprint
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Saved via AI email drafting, smart reminders &amp; Bolna calls.
            </p>
          </div>
        </div>

        {/* =====================================================================
            TWO-COLUMN SECTION
            Left: Tasks Table (overdue rows subtle red background)
            Right: AI Assistant Panel (white card style, Run Review button, textarea)
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================
              LEFT COLUMN: Tasks Table (lg:col-span-7)
              Columns: Employee, Task, Deadline, Status
              Overdue rows have a subtle red background
          =================================================================== */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-800">
                  Operational Task Roster
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium">
                  {tasks.length} Active
                </span>
              </div>
              <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {overdueTasksCount} Tasks Overdue
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const isOverdue = task.status === 'Overdue';
                    return (
                      <tr
                        key={task.id}
                        className={`transition-colors ${
                          isOverdue
                            ? 'bg-rose-50/75 hover:bg-rose-100/60 border-l-4 border-l-rose-500'
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Employee */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{task.employee}</div>
                          <div className="text-[11px] text-slate-400">{task.role}</div>
                        </td>

                        {/* Task */}
                        <td className="py-3.5 px-4 text-slate-700 max-w-[240px] sm:max-w-[320px]">
                          <span
                            className={`font-medium leading-snug line-clamp-2 ${
                              isOverdue ? 'text-rose-950 font-semibold' : 'text-slate-800'
                            }`}
                          >
                            {task.task}
                          </span>
                        </td>

                        {/* Deadline */}
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-700 font-bold'
                                : task.status === 'Completed'
                                ? 'text-slate-400'
                                : 'text-slate-600'
                            }
                          >
                            {task.deadline}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right">
                          {getStatusBadge(task.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Audited 5 of 5 daily deliverables</span>
              <span className="text-slate-400">Target completion: 18:00 IST</span>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: AI Assistant Panel (lg:col-span-5)
              White card style, "Run Morning Operations Review" button, textarea below
          =================================================================== */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      AI Assistant: Operations Auditor
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Automated accountability review powered by OpenRouter
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Ruthless COO
                </span>
              </div>

              {/* Action Button: "Run Morning Operations Review" */}
              <button
                type="button"
                onClick={handleRunMorningReview}
                disabled={isRunningReview}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                title="Send current task roster to OpenRouter for ruthless operational review"
              >
                {isRunningReview ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-slate-300" />
                    <span>Auditing Tasks &amp; Synthesizing Review...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Run Morning Operations Review</span>
                  </>
                )}
              </button>

              {/* Text Area for the Ruthless Executive Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-slate-400" />
                    Ruthless Executive Summary
                  </label>
                  <button
                    onClick={handleCopySummary}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    {copiedSummary ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={14}
                    value={executiveSummary}
                    onChange={(e) => setExecutiveSummary(e.target.value)}
                    placeholder="Click 'Run Morning Operations Review' to generate an executive review..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px] sm:text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all shadow-2xs resize-y"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                  <span>
                    {lastRunTime ? `Last audit generated at ${lastRunTime}` : 'Awaiting initial audit'}
                  </span>
                  <span>{executiveSummary.length} characters</span>
                </div>
              </div>

              {/* Footer status / model note */}
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Model: OpenRouter / Gemini 2.0 Flash</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Executive Audit Protocol
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
