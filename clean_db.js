const fs = require('fs');

const path = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

// Remove duplicates and FAQs
const seen = new Set();
db.packages = db.packages.filter(p => {
  const title = (p.title || p.name).trim();
  
  // Remove FAQs
  if (title.toLowerCase().includes('faq')) return false;
  
  // Remove duplicate titles
  if (seen.has(title)) return false;
  seen.add(title);
  
  return true;
});

// Clean up weird titles
db.packages = db.packages.map(p => {
  let title = (p.title || p.name).trim();
  if (title.includes('Andaman Package  (P 2)')) title = 'Andaman Package';
  if (title.includes('Keralam Package 2P')) title = 'Keralam Package';
  if (title.includes('KAIILASH MANSAROVA YATRA FIXED DEPARTURE')) {
     if (title.includes('Heli Trip') && title.includes('Ex Lucknow')) title = 'Kailash Mansarovar Yatra (Heli Trip ex Lucknow)';
     if (title.includes('Heli Trip') && title.includes('Ex Kathmandu')) title = 'Kailash Mansarovar Yatra (Heli Trip ex Kathmandu)';
     if (title.includes('Overland') && title.includes('Ex Kathmandu')) title = 'Kailash Mansarovar Yatra (Overland ex Kathmandu)';
  }
  
  if (p.title) p.title = title;
  else p.name = title;
  
  return p;
});

fs.writeFileSync(path, JSON.stringify(db, null, 2));
console.log('Cleaned up db packages');
