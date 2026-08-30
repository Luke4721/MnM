import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const reelsData = [
  {
    id: 1,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083043/Kerala.mp4",
    title: "Kerala",
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083049/JAIPUR.mp4",
    title: "Jaipur",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083051/SPITI.mp4",
    title: "Spiti",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083052/Goa_1.mp4",
    title: "Goa",
  },
];

const ReelCard: React.FC<{ src: string; title: string; setHovered: (h: boolean) => void }> = ({ src, title, setHovered }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="relative h-[500px] sm:h-[600px] w-[300px] sm:w-[350px] shrink-0 rounded-2xl overflow-hidden cursor-pointer group bg-black shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Tokai-style Play Icon overlay - Mobile Only */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
          <svg className="w-6 h-6 text-white ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0 text-center">
        <h3 className="text-white text-3xl md:text-4xl font-serif italic tracking-wider drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity">{title}</h3>
      </div>
    </div>
  );
};

export const ReelsCarousel: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Duplicate array 3 times for seamless infinite loop
  const duplicatedReels = [...reelsData, ...reelsData, ...reelsData];

  return (
    <div className="bg-[#f9f8f4] dark:bg-zinc-950 py-24 border-t border-gray-200 dark:border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <div className="text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Discover Reels</h2>
          <div className="w-12 h-1 bg-[#D97736]"></div>
        </div>
      </div>

      <div className="w-full relative overflow-hidden">
        <motion.div 
          className="flex gap-6 w-max px-4"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ 
            ease: "linear", 
            duration: 30, // 30 seconds for one full cycle
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{
            animationPlayState: isHovered ? 'paused' : 'running'
          }}
        >
          {duplicatedReels.map((reel, idx) => (
            <ReelCard 
              key={`${reel.id}-${idx}`} 
              src={reel.src} 
              title={reel.title} 
              setHovered={setIsHovered}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
