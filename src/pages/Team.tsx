import React, { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { TeamCard } from '../components/TeamCard';
import type { TeamMember } from '../components/TeamCard';
import initialTeamData from '../data/team.json';
import { motion } from 'framer-motion';

export const Team: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(initialTeamData);

  useEffect(() => {
    fetch('/api/admin/site-config?section=team')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTeam(json.data);
        }
      })
      .catch((err) => {
        console.warn('[Team] Using build-time team data fallback:', err);
      });
  }, []);

  return (
    <PageTransition>
      <div className="pt-36 pb-24 min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
              Meet Our <span className="text-[#FF9933]">Team</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              The passionate experts behind your unforgettable journeys.
            </p>
            <div className="w-20 h-1 bg-[#FF9933] mx-auto mt-8"></div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <TeamCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
