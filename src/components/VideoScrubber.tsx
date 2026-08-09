import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const VideoScrubber: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalFrames = 60;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 1920;
    canvas.height = 1080;

    // Preload frames
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const render = (frameIndex: number) => {
      if (images[frameIndex]) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
        
        // Apply dark overlay manually in canvas (since we replaced video opacity trick)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameStr = i.toString().padStart(3, '0');
      img.src = `/frames/ocean_frame_${frameStr}.svg`;
      img.onload = () => {
        loadedCount++;
        // Render first frame immediately once loaded
        if (i === 1) {
          render(0);
        }
      };
      images.push(img);
    }

    const playhead = { frame: 0 };

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        // Calculate which frame we should be on
        const targetFrame = Math.min(
          totalFrames - 1,
          Math.floor(self.progress * totalFrames)
        );
        
        playhead.frame = targetFrame;
        render(playhead.frame);
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="image-sequence"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: -1,
      }}
    />
  );
};
