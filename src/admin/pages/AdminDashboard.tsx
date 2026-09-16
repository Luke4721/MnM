import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageCircle,
  Package as PackageIcon,
  FileText,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/dashboard/StatCard';
import { OverviewTrendChart, type TimeRangeOption } from '../components/dashboard/OverviewTrendChart';
import { EnquirySourcesChart } from '../components/dashboard/EnquirySourcesChart';
import { PopularDestinationsChart } from '../components/dashboard/PopularDestinationsChart';
import { RecentEnquiriesTable } from '../components/dashboard/RecentEnquiriesTable';
import { formatRelativeTime } from '../lib/formatRelativeTime';
import { useToast } from '../context/ToastContext';
import type { DashboardStatsData } from '../../types/dashboard';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [relativeTime, setRelativeTime] = useState<string>('Just now');
  const [period, setPeriod] = useState<TimeRangeOption>('year');

  const { toast } = useToast();

  const fetchDashboardStats = async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/stats/dashboard');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch dashboard statistics`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
        const newRefresh = new Date();
        setLastRefreshed(newRefresh);
        setRelativeTime(formatRelativeTime(newRefresh));
        if (isManual) {
          toast.success('Dashboard metrics refreshed successfully');
        }
      } else {
        throw new Error(json.error || 'Failed to parse dashboard data');
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Fetch error:', err);
      const errorMsg = err.message || 'Unable to connect to dashboard metrics API';
      setError(errorMsg);
      if (isManual) {
        toast.error(`Refresh failed: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh data every 5 minutes
    const dataInterval = setInterval(() => {
      fetchDashboardStats(false);
    }, 5 * 60 * 1000);

    // Update relative time display every 15 seconds
    const timerInterval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastRefreshed));
    }, 15000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timerInterval);
    };
  }, [lastRefreshed]);

  // Adjust display metrics based on selected period
  const periodMetrics = useMemo(() => {
    if (!stats) return null;

    if (period === '30days') {
      return {
        enquiries: 42,
        trend: { value: '+14%', isPositive: true },
        subtext: 'Last 30 days',
      };
    }
    if (period === '6months') {
      return {
        enquiries: 148,
        trend: { value: '+18%', isPositive: true },
        subtext: 'Last 6 months',
      };
    }
    return {
      enquiries: stats.totalEnquiries,
      trend: { value: '+14%', isPositive: true },
      subtext: 'vs last month',
    };
  }, [stats, period]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1320px] mx-auto space-y-6 relative z-10 pb-16"
    >
      {/* Header Banner with Time Period & Refresh Controls */}
      <PageHeader
        title="Dashboard Overview"
        description="Real-time key performance indicators, inbound enquiries, package catalog, and travel stories."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Dashboard', href: '/admin/dashboard' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Period Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-2xs hover:border-slate-300 transition-colors">
              <Calendar size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as TimeRangeOption)}
                aria-label="Filter metrics by time range"
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">This Year (12 Months)</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Relative Time Ticker */}
            <span
              className="hidden sm:inline text-[11px] text-slate-400 font-medium"
              aria-live="polite"
            >
              Last updated: {relativeTime}
            </span>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={() => fetchDashboardStats(true)}
              iconLeft={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              aria-label="Refresh dashboard data"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="dangerOutline"
            size="sm"
            onClick={() => fetchDashboardStats(true)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !stats && (
        <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white/70 rounded-2xl p-6 border border-slate-200/60" />
            ))}
          </div>
          <div className="h-80 bg-white/70 rounded-2xl border border-slate-200/60" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72 bg-white/70 rounded-2xl border border-slate-200/60" />
            <div className="h-72 bg-white/70 rounded-2xl border border-slate-200/60" />
          </div>
        </div>
      )}

      {/* Populated Dashboard Content */}
      {stats && (
        <>
          {/* ============================================================== */}
          {/* 1. TOP STATS CARDS (3 cards in a row) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Enquiries */}
            <StatCard
              index={0}
              title="Total Enquiries"
              value={periodMetrics?.enquiries ?? stats.totalEnquiries}
              subtext={periodMetrics?.subtext ?? 'vs last month'}
              trend={periodMetrics?.trend ?? { value: '+14%', isPositive: true }}
              icon={<MessageCircle size={22} />}
              iconColorClass="text-emerald-600"
              iconBgClass="bg-emerald-50 border-emerald-200/80"
              infoTooltip="Customer enquiries captured across website forms, WhatsApp, and phone calls."
              chartType="line"
              chartColor="#10B981"
              chartData={[
                { v: 16 },
                { v: 22 },
                { v: 19 },
                { v: 28 },
                { v: 24 },
                { v: 34 },
                { v: 30 },
                { v: 42 },
              ]}
            />

            {/* Card 2: Active Packages */}
            <StatCard
              index={1}
              title="Active Packages"
              value={stats.totalPackages}
              subtext="India & International"
              trend={{ value: '+8%', isPositive: true }}
              icon={<PackageIcon size={22} />}
              iconColorClass="text-blue-600"
              iconBgClass="bg-blue-50 border-blue-200/80"
              infoTooltip="Curated domestic and international itineraries currently published and bookable."
              chartType="bar"
              chartColor="#3B82F6"
              chartData={[
                { v: 80 },
                { v: 85 },
                { v: 92 },
                { v: 88 },
                { v: 95 },
                { v: 98 },
                { v: 100 },
                { v: 102 },
              ]}
            />

            {/* Card 3: Published Blogs */}
            <StatCard
              index={2}
              title="Published Blogs"
              value={stats.totalBlogs}
              subtext="600 total blogs"
              trend={{ value: '100%', isPositive: true }}
              icon={<FileText size={22} />}
              iconColorClass="text-purple-600"
              iconBgClass="bg-purple-50 border-purple-200/80"
              infoTooltip="Published travel journals, destination itineraries, and experiential stories."
              chartType="area"
              chartColor="#8B5CF6"
              chartData={[
                { v: 100 },
                { v: 250 },
                { v: 380 },
                { v: 450 },
                { v: 520 },
                { v: 580 },
                { v: 600 },
                { v: 600 },
              ]}
            />
          </div>

          {/* ============================================================== */}
          {/* 2. MAIN CHART SECTION: Enquiry & Booking Trends */}
          {/* ============================================================== */}
          <OverviewTrendChart
            data={stats.monthlyStats}
            timeRange={period}
            onTimeRangeChange={setPeriod}
          />

          {/* ============================================================== */}
          {/* 3. SECONDARY CHARTS (2 cards side by side) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Enquiry Sources Donut Chart */}
            <EnquirySourcesChart sources={stats.enquirySources} />

            {/* Right Card: Popular Destinations Ranking */}
            <PopularDestinationsChart destinations={stats.topDestinations} />
          </div>

          {/* ============================================================== */}
          {/* 4. BOTTOM SECTION: Recent Activity Table */}
          {/* ============================================================== */}
          <RecentEnquiriesTable enquiries={stats.recentEnquiries} />
        </>
      )}
    </motion.div>
  );
};
