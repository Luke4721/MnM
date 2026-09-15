import React, { useRef } from 'react';

/**
 * ⬇️ PASTE YOUR YOUTUBE LINKS HERE ⬇️
 *
 * Replace the "#" in `youtubeUrl` for each reel below, for example:
 *   youtubeUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
 *   youtubeUrl: "https://www.youtube.com/shorts/XXXXXXXXXXX"
 *
 * Both the reel preview and its "Watch Full Video" button open this URL in a
 * new tab. While a value is still "#" the click is ignored, so the page does
 * not jump to the top — no code change is needed once the real links are in.
 */
const reelsData = [
  {
    id: 1,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083043/Kerala.mp4",
    title: "Kerala",
    youtubeUrl: "#", // TODO: paste the Kerala full video link here
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083049/JAIPUR.mp4",
    title: "Jaipur",
    youtubeUrl: "#", // TODO: paste the Jaipur full video link here
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083051/SPITI.mp4",
    title: "Spiti",
    youtubeUrl: "#", // TODO: paste the Spiti full video link here
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/q5nbzqmp/video/upload/q_auto/v1788083052/Goa_1.mp4",
    title: "Goa",
    youtubeUrl: "#", // TODO: paste the Goa full video link here
  },
];

const PLACEHOLDER_LINK = '#';

interface ReelCardProps {
  src: string;
  title: string;
  youtubeUrl: string;
}

const ReelCard: React.FC<ReelCardProps> = ({ src, title, youtubeUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
  };

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch the full ${title} video on YouTube`}
      onClick={(event) => {
        // A placeholder href would otherwise jump the page back to the top.
        if (youtubeUrl === PLACEHOLDER_LINK) event.preventDefault();
      }}
      className="relative flex h-[500px] sm:h-[600px] w-[300px] sm:w-[350px] shrink-0 flex-col justify-end rounded-2xl overflow-hidden cursor-pointer group bg-black shadow-lg no-underline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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

      <div className="relative z-10 p-8 w-full transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0 text-center">
        <h3 className="text-white text-3xl md:text-4xl font-serif italic tracking-wider drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity">{title}</h3>

        <span className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white border border-white/50 bg-white/10 backdrop-blur-md group-hover:bg-[#FF9933] group-hover:border-[#FF9933] transition-colors duration-300">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch Full Video
        </span>
      </div>
    </a>
  );
};

export const ReelsCarousel: React.FC = () => {
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
        <div className="flex gap-6 w-max px-4 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {duplicatedReels.map((reel, idx) => (
            <ReelCard
              key={`${reel.id}-${idx}`}
              src={reel.src}
              title={reel.title}
              youtubeUrl={reel.youtubeUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
