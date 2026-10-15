import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TeamMember {
  id: string;
  name: string;
  photo_url: string;
  email: string;
  branch: string;
  phone_number: string;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({ member, index }) => {
  const photoSrc = React.useMemo(() => {
    const raw = member.photo_url || '';
    if (!raw) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop';
    if (raw.includes('images.unsplash.com')) {
      const sep = raw.includes('?') ? '&' : '?';
      return `${raw}${sep}fm=webp&w=256&h=256`;
    }
    return raw;
  }, [member.photo_url]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white dark:bg-zinc-900 rounded-3xl p-8 flex flex-col items-center text-center shadow-md border border-gray-100 dark:border-zinc-800 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-[#FF9933]/20 group-hover:border-[#FF9933]/50 transition-colors duration-300">
        <img
          src={photoSrc}
          alt={member.name}
          loading="lazy"
          width={256}
          height={256}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop';
          }}
        />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1">
        <MapPin size={14} />
        {member.branch}
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <a
          href={`mailto:${member.email}`}
          className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[#FF9933] hover:text-white dark:hover:bg-[#FF9933] dark:hover:text-white transition-colors duration-300 shadow-sm"
          title={`Email ${member.name}`}
        >
          <Mail size={20} />
        </a>
        <a
          href={`tel:${member.phone_number}`}
          className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[#FF9933] hover:text-white dark:hover:bg-[#FF9933] dark:hover:text-white transition-colors duration-300 shadow-sm"
          title={`Call ${member.name}`}
        >
          <Phone size={20} />
        </a>
      </div>
    </motion.div>
  );
};
