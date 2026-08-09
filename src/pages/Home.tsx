import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCurrency } from '../context/CurrencyProvider';
import packages from '../data/tour_packages.json';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { VideoScrubber } from '../components/VideoScrubber';
import { AtmosphericParticles } from '../components/AtmosphericParticles';
import { TiltCard } from '../components/TiltCard';

const ImageWithFallback: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return <div className="skeleton-image" style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

export const Home: React.FC = () => {
  const { currency, convertPrice } = useCurrency();
  const { scrollYProgress } = useScroll();

  // The Plunge Effect: Ocean gets darker as we scroll down
  // Map global scroll 0-0.5 to opacity 0-0.8 on a black overlay
  const plungeOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.85]);

  return (
    <div style={{ position: 'relative' }}>
      {/* 
        Fixed GSAP Video Scrubber Background
      */}
      <VideoScrubber />

      {/* The Plunge Overlay (Darkens ocean on scroll) */}
      <motion.div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: '#000', 
          opacity: plungeOpacity, 
          zIndex: -1,
          pointerEvents: 'none'
        }} 
      />

      {/* Atmospheric Particles (above canvas, below UI) */}
      <AtmosphericParticles />
      
      {/* Hero Section */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '7vw', color: '#ffffff', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          DISCOVER THE <br /> EXTRAORDINARY
        </h1>
        <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', color: '#e0e0e0', textTransform: 'uppercase', letterSpacing: '0.5em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          A New Era of Travel
        </p>
      </div>

      {/* Content Section with Staggered Entrance */}
      <div style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto', display: 'grid', gap: '4rem' }}>
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.85, y: 100 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 20, 
              delay: index * 0.1 // staggered
            }}
          >
            <TiltCard>
              <div 
                className="glass-panel"
                style={{ 
                  display: 'flex', 
                  flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                  overflow: 'hidden',
                  minHeight: '400px',
                  borderRadius: '12px'
                }}
              >
                <div style={{ flex: 1, position: 'relative' }}>
                  <ImageWithFallback src={pkg.img} alt={pkg.name} />
                </div>
                <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#d0d0d0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span>{pkg.days}</span>
                    <AnimatedNumber value={convertPrice(pkg.priceINR, true) as number} formatFn={(val) => {
                      const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency;
                      return `${symbol}${Math.round(val).toLocaleString()}`;
                    }} />
                  </div>
                  <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 400, color: '#fff' }}>{pkg.name}</h3>
                  <p style={{ color: '#b0b0b0', fontSize: '1.1rem', lineHeight: 1.6 }}>{pkg.highlights}</p>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
      
      {/* Extra spacer to allow scrubbing to the end of the video */}
      <div style={{ height: '50vh' }} />
    </div>
  );
};
