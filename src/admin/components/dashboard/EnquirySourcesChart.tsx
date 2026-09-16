import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { EnquirySource } from '../../../types/dashboard';
import { useCountUp } from '../../hooks/useCountUp';

interface EnquirySourcesChartProps {
  sources?: EnquirySource[];
}

const SOURCE_COLORS: Record<string, string> = {
  website: '#3B82F6', // Blue
  whatsapp: '#10B981', // Emerald
  phone: '#8B5CF6',   // Purple
  email: '#F59E0B',   // Amber
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website Form',
  whatsapp: 'WhatsApp Direct',
  phone: 'Phone Call',
  email: 'Direct Email',
};

const EnquirySourcesChartComponent: React.FC<EnquirySourcesChartProps> = ({ sources = [] }) => {
  const chartData = sources.map((s) => ({
    name: SOURCE_LABELS[s.source] || s.source,
    value: s.count,
    percentage: s.percentage,
    color: SOURCE_COLORS[s.source] || '#94a3b8',
    sourceKey: s.source,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const animatedTotal = useCountUp(total, 1000);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-xs flex flex-col justify-between transition-shadow duration-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Enquiry Sources
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            All Channels
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Channel breakdown of inquiries captured across web forms, WhatsApp, and calls.
        </p>
      </div>

      {/* Donut Chart */}
      <div className="h-52 w-full my-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-lg text-xs space-y-1">
                      <div className="font-extrabold text-slate-900">{data.name}</div>
                      <div className="text-slate-600 font-medium">
                        <span className="font-bold text-slate-900">{data.value}</span> enquiries ({data.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Metric */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 tracking-tight leading-none tabular-nums">
            {animatedTotal}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Total Leads
          </span>
        </div>
      </div>

      {/* Color-coded Legend */}
      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 font-medium truncate">{item.name}</span>
            </div>
            <span className="font-bold text-slate-900 ml-1 tabular-nums">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EnquirySourcesChart = React.memo(EnquirySourcesChartComponent);
