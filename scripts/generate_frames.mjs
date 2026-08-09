import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const framesDir = path.join(__dirname, '../public/frames');

if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

console.log('Generating 60 placeholder ocean frames...');

const width = 1920;
const height = 1080;
const totalFrames = 60;

for (let i = 1; i <= totalFrames; i++) {
  const frameStr = i.toString().padStart(3, '0');
  const filepath = path.join(framesDir, `ocean_frame_${frameStr}.svg`);
  
  // Create a moving gradient and wave to simulate water
  const offset = (i / totalFrames) * 100;
  
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#001f3f;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#0074D9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7FDBFF;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#oceanGrad)" />
    
    <!-- Moving Wave -->
    <path d="M0,${height/2} Q${width/4},${height/2 - 200 + offset * 2} ${width/2},${height/2} T${width},${height/2} L${width},${height} L0,${height} Z" fill="#001122" opacity="0.6"/>
  </svg>`;

  fs.writeFileSync(filepath, svg);
}

console.log(`Successfully generated ${totalFrames} frames in public/frames/`);
