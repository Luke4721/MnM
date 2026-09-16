import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { TopDestination } from '../../../types/dashboard';

interface PopularDestinationsChartProps {
  destinations?: TopDestination[];
}

const DEST_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
];

const PopularDestinationsChartComponent: React.FC<PopularDestinationsChartProps> = ({
  destinations = [],
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-xs flex flex-col justify-between transition-shadow duration-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Popular Destinations
          </h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
            Top 5
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Most requested destinations by volume of customer inquiries.
        </p>
      </div>

      {/* Ranked Horizontal Bars */}
      <div className="space-y-4 my-auto py-2">
        {destinations.map((dest, index) => {
          const colorClass = DEST_COLORS[index % DEST_COLORS.length];
          const targetWidth = `${Math.min(100, Math.max(12, dest.percentage * 3.2))}%`;

          return (
            <div key={dest.name} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  <MapPin size={13} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <span>{dest.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tabular-nums">
                    {dest.count} enquiries
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                    ({dest.percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: targetWidth }}
                  transition={{ duration: 0.85, delay: index * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${colorClass}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Based on verified inquiry records</span>
        <Link
          to="/admin/packages"
          className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors inline-flex items-center gap-0.5"
        >
          <span>View Package Catalog</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export const PopularDestinationsChart = React.memo(PopularDestinationsChartComponent);
