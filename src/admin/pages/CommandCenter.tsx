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
  employee: 'Anirudh' | 'Nishi';
  role: string;
  task: string;
  deadline: string;
  status: 'Overdue' | 'In Progress' | 'Pending' | 'Completed';
}

const ACTUAL_TEAM_TASKS: TaskItem[] = [
  {
    id: 't-1',
    employee: 'Anirudh',
    role: 'Operations & Itinerary Lead',
    task: 'Finalize Bali itinerary for Ananya Sharma',
    deadline: 'Yesterday, 5:00 PM',
    status: 'Overdue',
  },
  {
    id: 't-2',
    employee: 'Anirudh',
    role: 'Operations & Itinerary Lead',
    task: 'Coordinate with Rajasthan hotels for Priya Nair',
    deadline: 'Oct 26, 2:00 PM',
    status: 'Overdue',
  },
  {
    id: 't-3',
    employee: 'Nishi',
    role: 'Content & Web Strategy',
    task: 'Upload new MnM blog posts',
    deadline: 'Today, 4:00 PM',
    status: 'In Progress',
  },
  {
    id: 't-4',
    employee: 'Nishi',
    role: 'Content & Web Strategy',
    task: 'Update SEO tags',
    deadline: 'Tomorrow, 12:00 PM',
    status: 'Pending',
  },
];

export const CommandCenter: React.FC = () => {
  const [tasks] = useState<TaskItem[]>(ACTUAL_TEAM_TASKS);
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    `=== MORNING OPERATIONS REVIEW: AWAITING RUN ===\n\nClick "Run Morning Operations Review" to audit Anirudh and Nishi's active operational task queue via OpenRouter AI.\n\nThe AI Auditor evaluates overdue bottlenecks, calculates revenue exposure, and outputs a ruthless executive action mandate for today.`
  );
  const [isRunningReview, setIsRunningReview] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const activeLeadsCount = 3;
  const overdueTasksCount = tasks.filter((t) => t.status === 'Overdue').length; // 2 (Anirudh's 2 tasks)
  const hoursSavedMetric = 34.5;

  const handleCopySummary = () => {
    if (!executiveSummary) return;
    navigator.clipboard.writeText(executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  /**
   * Run Morning Operations Review
   * Uses import.meta.env.VITE_OPENROUTER_KEY per specifications
   * Sends actual team tasks (Anirudh & Nishi) to OpenRouter
   */
  const handleRunMorningReview = async () => {
    setIsRunningReview(true);
    setNotice(null);

    const apiKey =
      import.meta.env.VITE_OPENROUTER_KEY ||
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      (typeof process !== 'undefined' && process.env?.REACT_APP_OPENROUTER_API_KEY) ||
      '';

    const formattedTasksText = tasks
      .map(
        (t, idx) =>
          `${idx + 1}. [${t.status.toUpperCase()}] ${t.employee} (${t.role}): "${t.task}" | Deadline: ${t.deadline}`
      )
      .join('\n');

    const promptText = `Conduct a ruthless, uncompromising Morning Operations Review for MNM Travels.

Operational Metrics:
- Active High-Intent Leads: ${activeLeadsCount} (Ananya Sharma ₹2.5L, Priya Nair ₹4.5L, Rajesh Menon ₹1.75L)
- Overdue Tasks: ${overdueTasksCount} (Critical Bottleneck)
- Workforce Operational Hours Saved: ${hoursSavedMetric} hours

Actual Team Task Roster:
${formattedTasksText}

Your Review Directives:
1. EXECUTIVE BOTTLENECK AUDIT: Call out Anirudh directly for the 2 overdue tasks ("Finalize Bali itinerary for Ananya Sharma" and "Coordinate with Rajasthan hotels for Priya Nair"). Calculate the revenue risk (₹7.0L combined across Bali and Rajasthan) and explain why leaving high-net-worth clients waiting past deadline is unacceptable.
2. CONTENT & SEO CADENCE: Review Nishi's workflow on "Upload new MnM blog posts" and "Update SEO tags". Demand strict completion before today's 4:00 PM cutoff to sustain organic inbound acquisition.
3. THREE MANDATORY REMEDIATION DIRECTIVES FOR TODAY: Specify exact cutoffs (10:30 AM, 12:00 PM, 3:00 PM) for Anirudh and Nishi. Zero fluff, razor-sharp corporate accountability.`;

    try {
      if (!apiKey) {
        console.warn(
          '[CommandCenter] import.meta.env.VITE_OPENROUTER_KEY not set. Using actual team audit fallback.'
        );
        await new Promise((r) => setTimeout(r, 1200));

        const fallbackSummary = `================================================================================
EXECUTIVE MORNING OPERATIONS AUDIT | MNM TRAVELS
DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} | AUDITOR: COO OPERATIONS DESK
METRICS: Active Leads: ${activeLeadsCount} | Overdue Tasks: ${overdueTasksCount} (CRITICAL) | Hours Saved: ${hoursSavedMetric}h
================================================================================

1. CRITICAL BOTTLENECK AUDIT — ANIRUDH (OPERATIONS LEAD):
--------------------------------------------------------------------------------
• Task 1: "Finalize Bali itinerary for Ananya Sharma"
  - Status: OVERDUE (Deadline was Yesterday, 5:00 PM — 16+ hours SLA breach)
  - Commercial Exposure: Ananya Sharma is a Lead Score 94 honeymoon client with a ₹2.5L budget. Every hour of delay increases drop-off risk to competing luxury operators. Unacceptable.

• Task 2: "Coordinate with Rajasthan hotels for Priya Nair"
  - Status: OVERDUE (Deadline: Oct 26, 2:00 PM — 48+ hours elapsed)
  - Commercial Exposure: Priya Nair represents a ₹4.5L corporate delegation (15 pax). Heritage palace room blocks in Jaipur release inventory rapidly. Anirudh must lock this down this morning.

Total Pipeline at Risk under Anirudh: ₹7,00,000 INR.

2. CONTENT & MARKETING PIPELINE — NISHI:
--------------------------------------------------------------------------------
• Task 1: "Upload new MnM blog posts" (Due Today, 4:00 PM — In Progress).
• Task 2: "Update SEO tags" (Due Tomorrow, 12:00 PM — Pending).
Nishi's editorial queue is tracking within limits, but blog publishing cannot slip past 4:00 PM. Traffic momentum depends on consistent indexing.

3. MANDATORY 3-POINT DIRECTIVES FOR TODAY:
--------------------------------------------------------------------------------
[1] 10:30 AM HARD CUTOFF: Anirudh must finalize the Bali itinerary, send the payment link to Ananya Sharma, and update the CRM board.
[2] 12:00 PM HARD CUTOFF: Anirudh must confirm the Rajasthan palace rates with the Udaipur/Jaipur hotel desks for Priya Nair's 15-pax offsite.
[3] 4:00 PM HARD CUTOFF: Nishi must complete the blog uploads, verify schema tags, and deploy the sitemap update.

Audit Status: Escalated to Executive Operations Desk`;

        setExecutiveSummary(fallbackSummary);
        setLastRunTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setNotice({
          type: 'info',
          message:
            'Ruthless executive review generated using team schedule. (To stream live OpenRouter models, configure VITE_OPENROUTER_KEY in your .env.local).',
        });
        return;
      }

      // Live POST request to OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin || 'https://mnmtravels.com',
          'X-Title': 'MNM Command Center',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content:
                'You are an elite, uncompromising Chief Operating Officer conducting a ruthless morning operations task audit for an ultra-luxury travel company.',
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100/90 text-rose-800 border border-rose-300/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Overdue
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Clock size={12} className="text-blue-500" />
            In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <AlertCircle size={12} className="text-amber-500" />
            Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-2xl shadow-xs">
                <Sliders size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Operations
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Active workforce monitoring (Anirudh &amp; Nishi), SLA accountability, and automated AI operations auditing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">Shift Window:</span>
            <span>09:00 - 18:00 IST</span>
          </div>
        </div>

        {/* Global Alert Notification */}
        {notice && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : notice.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
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
              className="text-slate-400 hover:text-slate-700 text-xs font-semibold px-1"
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Leads
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeLeadsCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight size={14} /> +12% this week
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Ananya Sharma (₹2.5L), Priya Nair (₹4.5L), Rajesh Menon (₹1.75L).
            </p>
          </div>

          {/* Card 2: Overdue Tasks: 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overdue Tasks
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {overdueTasksCount}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Anirudh: 2 Tasks Overdue
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Bali and Rajasthan proposals require immediate executive release.
            </p>
          </div>

          {/* Card 3: Hours Saved: 34.5 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hours Saved
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {hoursSavedMetric}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp size={14} /> +18.2% vs sprint
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Automated via Company Brain, AI email drafting &amp; Bolna voice calls.
            </p>
          </div>
        </div>

        {/* =====================================================================
            TWO-COLUMN SECTION
            Left: Tasks Table (Anirudh & Nishi; overdue rows subtle red background)
            Right: AI Assistant Panel (white card style, Run Review button, textarea)
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================
              LEFT COLUMN: Tasks Table (lg:col-span-7)
              Columns: Employee, Task, Deadline, Status
              Overdue rows have a subtle red background
          =================================================================== */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-500" />
                <h2 className="text-sm font-bold text-slate-800">
                  Actual Team Task Roster (Anirudh &amp; Nishi)
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                  {tasks.length} Active Tasks
                </span>
              </div>
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                {overdueTasksCount} Tasks Overdue
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
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
                            : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Employee */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                task.employee === 'Anirudh'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {task.employee[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{task.employee}</div>
                              <div className="text-[11px] text-slate-400">{task.role}</div>
                            </div>
                          </div>
                        </td>

                        {/* Task */}
                        <td className="py-3.5 px-4 text-slate-700 max-w-[240px] sm:max-w-[320px]">
                          <span
                            className={`font-semibold leading-snug line-clamp-2 ${
                              isOverdue ? 'text-rose-950 font-bold' : 'text-slate-800'
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
                                : 'text-slate-600 font-medium'
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

            <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Auditing Anirudh (2 tasks) &amp; Nishi (2 tasks)</span>
              <span className="text-slate-400 font-medium">Daily Target: 100% SLA Resolution</span>
            </div>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: AI Assistant Panel (lg:col-span-5)
              White card style, "Run Morning Operations Review" button, textarea below
          =================================================================== */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      AI Assistant: Operations Auditor
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Autonomous accountability review powered by OpenRouter
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  Ruthless COO
                </span>
              </div>

              {/* Action Button: "Run Morning Operations Review" */}
              <button
                type="button"
                onClick={handleRunMorningReview}
                disabled={isRunningReview}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                title="Send current task roster to OpenRouter for ruthless operational review"
              >
                {isRunningReview ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-slate-300" />
                    <span>Auditing Team Tasks &amp; Synthesizing Review...</span>
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-slate-400" />
                    Ruthless Executive Summary
                  </label>
                  <button
                    onClick={handleCopySummary}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {copiedSummary ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied</span>
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
                    rows={13}
                    value={executiveSummary}
                    onChange={(e) => setExecutiveSummary(e.target.value)}
                    placeholder="Click 'Run Morning Operations Review' to generate an executive review..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px] sm:text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all shadow-2xs resize-y"
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
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>Model: VITE_OPENROUTER_KEY</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Executive Protocol Active
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
