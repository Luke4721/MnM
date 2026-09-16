import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { MonthlyStat } from '../../../types/dashboard';

export type TimeRangeOption = '30days' | '6months' | 'year' | 'all';

interface OverviewTrendChartProps {
  data: MonthlyStat[];
  timeRange?: TimeRangeOption;
  onTimeRangeChange?: (range: TimeRangeOption) => void;
}

const OverviewTrendChartComponent: React.FC<OverviewTrendChartProps> = ({
  data,
  timeRange: controlledTimeRange,
  onTimeRangeChange,
}) => {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRangeOption>('year');
  const activeTimeRange = controlledTimeRange || internalTimeRange;

  const handleRangeChange = (newRange: TimeRangeOption) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    } else {
      setInternalTimeRange(newRange);
    }
  };

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (activeTimeRange === '30days') {
      return data.slice(-2); // Last 2 month buckets representing recent 30-60 day trajectory
    }
    if (activeTimeRange === '6months') {
      return data.slice(-6); // Last 6 months
    }
    if (activeTimeRange === 'year') {
      return data.slice(-12); // Last 12 months
    }
    return data; // 'all'
  }, [data, activeTimeRange]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-xs transition-shadow duration-200 hover:shadow-md">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Enquiry & Booking Trends
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Monthly inbound queries vs confirmed bookings across India & International itineraries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6] ring-2 ring-blue-100" />
              <span className="text-slate-700">Enquiries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] ring-2 ring-amber-100" />
              <span className="text-slate-700">Confirmed Bookings</span>
            </div>
          </div>

          {/* Time Range Selector */}
          <select
            value={activeTimeRange}
            onChange={(e) => handleRangeChange(e.target.value as TimeRangeOption)}
            aria-label="Select trend time range"
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl outline-none hover:bg-slate-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year (12 Months)</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Blue Gradient for Enquiries */}
              <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
              {/* Orange/Amber Gradient for Bookings */}
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              dx={-5}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const enqVal = payload[0]?.value;
                  const bookVal = payload[1]?.value;
                  const revVal = payload[0]?.payload?.revenue;

                  return (
                    <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-xs space-y-2 min-w-[170px] animate-in fade-in duration-100">
                      <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>{label}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Metrics</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-blue-600 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Enquiries:
                        </span>
                        <span className="tabular-nums">{enqVal}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-amber-600 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Bookings:
                        </span>
                        <span className="tabular-nums">{bookVal}</span>
                      </div>
                      {revVal && (
                        <div className="flex items-center justify-between gap-3 text-slate-500 text-[11px] pt-1.5 border-t border-slate-100">
                          <span>Est. Revenue:</span>
                          <span className="font-bold text-slate-800 tabular-nums">
                            ₹{Number(revVal).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="enquiries"
              name="Enquiries"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorEnquiries)"
              isAnimationActive={true}
              animationDuration={1100}
              animationEasing="ease-in-out"
            />

            <Area
              type="monotone"
              dataKey="bookings"
              name="Confirmed Bookings"
              stroke="#F59E0B"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBookings)"
              isAnimationActive={true}
              animationDuration={1100}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const OverviewTrendChart = React.memo(OverviewTrendChartComponent);
