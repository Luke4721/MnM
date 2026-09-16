import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { useCountUp } from '../../hooks/useCountUp';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  iconBgClass?: string;
  infoTooltip?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  chartType?: 'line' | 'bar' | 'area';
  chartData?: Array<{ v: number }>;
  chartColor?: string;
  index?: number;
}

const StatCardComponent: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  iconColorClass = 'text-indigo-600',
  iconBgClass = 'bg-indigo-50 border-indigo-100',
  infoTooltip,
  trend,
  chartType = 'line',
  chartData = [
    { v: 10 },
    { v: 18 },
    { v: 15 },
    { v: 24 },
    { v: 20 },
    { v: 32 },
    { v: 28 },
    { v: 38 },
  ],
  chartColor = '#3B82F6',
  index = 0,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Extract numeric portion for count-up animation if possible
  const numericValue = typeof value === 'number'
    ? value
    : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;

  const animatedCount = useCountUp(numericValue, 1100);
  const displayValue = typeof value === 'number' || !isNaN(Number(String(value).replace(/,/g, '')))
    ? animatedCount.toLocaleString()
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.015 }}
      className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between group relative"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {title}
            </span>
            {infoTooltip && (
              <div
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                tabIndex={0}
                role="tooltip"
                aria-label={infoTooltip}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
              >
                <button
                  type="button"
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                  className="text-slate-300 hover:text-slate-500 transition-colors p-0.5 rounded-full focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer"
                  aria-label={`Info about ${title}`}
                >
                  <Info size={13} />
                </button>

                {showTooltip && (
                  <div className="absolute left-0 bottom-full mb-2 w-52 p-2.5 bg-slate-900/95 text-white text-[11px] rounded-xl shadow-xl backdrop-blur-xs z-30 pointer-events-none leading-relaxed animate-in fade-in zoom-in-95 duration-150">
                    {infoTooltip}
                    <div className="absolute top-full left-3 -mt-1 border-4 border-transparent border-t-slate-900/95" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2 tabular-nums">
            {displayValue}
          </div>
        </div>

        {/* Icon in colored circle */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${iconBgClass} ${iconColorClass} shadow-xs group-hover:scale-105 transition-transform`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 pt-2 border-t border-slate-100/60">
        <div className="space-y-1">
          {trend ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp size={12} className="shrink-0" />
                ) : (
                  <TrendingDown size={12} className="shrink-0" />
                )}
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{subtext}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium block">
              {subtext}
            </span>
          )}
        </div>

        {/* Mini sparkline chart */}
        <div className="w-24 h-11 shrink-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={chartColor}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <Bar
                  dataKey="v"
                  fill={chartColor}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`areaGrad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={chartColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#areaGrad-${title.replace(/\s+/g, '')})`}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export const StatCard = React.memo(StatCardComponent);
