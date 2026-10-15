import React, { useEffect, useState } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingItem {
  query: string;
  clicks: number;
  impressions: number;
}

export const TrendingDestinations: React.FC = () => {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending');
        const json = await res.json();
        if (json.success && json.data) {
          setTrending(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch trending destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading || trending.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-700">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-orange-500" size={24} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">🔥 Trending This Month</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trending.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-black rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize truncate">
                {item.query}
              </span>
              <TrendingUp size={16} className="text-green-500 flex-shrink-0" />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Surging in searches ({item.clicks} clicks)
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
