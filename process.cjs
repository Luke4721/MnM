const fs = require('fs');

const dataStr = fs.readFileSync('src/data/mnm_database.json', 'utf8');
const data = JSON.parse(dataStr);

const packages = data.packages;

const clusters = {
  'Andaman': ['andaman-package', 'andaman-package-p-2', 'andaman-and-nicobar-islands-package'],
  'Kashmir Package': ['kashmir-package', 'kashmir-package-with-doodhpathri'],
  'Keralam Package': ['keralam-package', 'keralam-package-2p', 'keralam-package-2'],
  'Sikkim Package': ['sikkim-package', 'sikkim-package-best-seller', 'sikkim-package-advanture'],
  'Kailash Mansarova Yatra': [
    'kaiilash-mansarova-yatra-fixed-departure-2026-overland-ex-kathmandu-p-2', 
    'kaiilash-mansarova-yatra-fixed-departure-2026-heli-trip-ex-kathmandu-p-3', 
    'kaiilash-mansarova-yatra-fixed-departure-2026-heli-trip-ex-lucknow-p-1'
  ],
  'Bhutan': ['7-nights-bhutan', '4-nights-bhutan'],
  'Sri Lanka': ['sri-lanka-6-nights-7-days', 'sri-lanka-05-nights-06-days'],
  'Shimla Manali': ['shimla-manali-', 'shimla-manali-12', 'shimla-manali-332'],
  'Shimla': ['shimla-232', 'shimla-7356'],
  'Manali': ['manali-231', 'manali-09']
};

const toRemove = new Set();
const idToPkg = new Map();
packages.forEach(p => idToPkg.set(p.id, p));

for (const [clusterName, ids] of Object.entries(clusters)) {
  const primaryId = ids[0];
  const primary = idToPkg.get(primaryId);
  if (!primary) continue;
  
  if (!primary.variants) {
    primary.variants = [];
  }
  
  for (let i = 1; i < ids.length; i++) {
    const altId = ids[i];
    const alt = idToPkg.get(altId);
    if (!alt) continue;
    
    // Extract variant name
    let vName = alt.name.replace(primary.name, '').trim();
    if (!vName) {
      if (alt.name.toLowerCase().includes('doodhpathri')) vName = 'With Doodhpathri';
      else if (alt.name.toLowerCase().includes('best seller')) vName = 'Best Seller';
      else if (alt.name.toLowerCase().includes('advanture')) vName = 'Adventure';
      else if (alt.name.toLowerCase().includes('2p')) vName = '2P';
      else if (alt.name.toLowerCase().includes('2')) vName = '2';
      else vName = alt.name; // Fallback
    } else {
      // Cleanup common prefixes
      vName = vName.replace(/^[-(\s]+/, '').replace(/[-)\s]+$/, '');
    }
    
    if(vName === "") {
        vName = "Variant " + i;
    }
    
    primary.variants.push({
      id: alt.id,
      name: vName,
      price: alt.price,
      priceINR: alt.priceINR,
      duration: alt.duration
    });
    
    toRemove.add(alt.id);
  }
}

let newPackages = packages.filter(p => !toRemove.has(p.id));

// Part 2: SEO Optimization
// For all the remaining primary packages, rewrite their `name` and `description` (overview) 
// to be highly attractive and SEO-optimized. Add a new `metaDescription` field to each package (150-160 chars).

function optimizeSEO(pkg) {
  const origName = pkg.name;
  let seoName = pkg.name;
  let desc = pkg.overview || "";
  let meta = "";
  
  if (origName.includes("Keralam")) {
    seoName = "Mesmerizing Kerala Backwaters & Munnar Holiday";
    desc = "Experience the best of Kerala with our hand-crafted itinerary covering lush green Munnar hills, serene backwaters of Alleppey, and rich cultural heritage. Let the magic of God's Own Country rejuvenate your senses on this unforgettable journey.";
    meta = "Book the ultimate Kerala holiday package. Explore Munnar's tea gardens, Alleppey's backwaters, and pristine beaches. Enjoy a mesmerizing getaway!";
  } else if (origName.includes("Kashmir")) {
    seoName = "Heaven on Earth: Ultimate Kashmir Valley Tour";
    desc = "Discover the surreal beauty of Kashmir with our premium tour package. From gliding on Dal Lake in a Shikara to marveling at the snow-capped peaks of Gulmarg and Pahalgam, experience a slice of paradise that will leave you spellbound.";
    meta = "Experience the best of Kashmir. Visit Srinagar, Gulmarg, and Pahalgam. Book your dream Kashmir holiday package today for an unforgettable mountain escape.";
  } else if (origName.includes("Andaman")) {
    seoName = "Tropical Andaman Islands & Pristine Beaches Getaway";
    desc = "Dive into the crystal-clear waters of the Andaman Islands. Explore historic Port Blair, relax on the world-renowned Radhanagar Beach in Havelock, and witness breathtaking underwater life. The perfect tropical paradise awaits.";
    meta = "Discover the Andaman Islands! pristine beaches, scuba diving, and historic Port Blair. Book your tropical Andaman holiday package for a perfect vacation.";
  } else if (origName.includes("Sikkim")) {
    seoName = "Enchanting Sikkim & Darjeeling Himalayan Adventure";
    desc = "Embark on a majestic Himalayan adventure in Sikkim. Experience the vibrant culture of Gangtok, witness the stunning beauty of Tsomgo Lake, and enjoy the breathtaking views of the Kanchenjunga range.";
    meta = "Explore the majestic Himalayas with our Sikkim holiday packages. Visit Gangtok, Darjeeling, and experience breathtaking mountain views and local culture.";
  } else if (origName.includes("Ayodhya Tour")) {
    seoName = "Spiritual Ayodhya Ram Mandir Pilgrimage Tour";
    meta = "Book a divine Ayodhya pilgrimage tour. Visit the grand Ram Mandir, Hanuman Garhi, and witness the spectacular Saryu Aarti. Experience ultimate spirituality.";
  } else if (origName.includes("Golden Triangle")) {
    seoName = "Iconic India: Golden Triangle Heritage Tour";
    meta = "Explore the Golden Triangle of India. Visit Delhi, Agra's Taj Mahal, and Jaipur's royal palaces. A perfect cultural and historical tour awaits.";
  } else if (origName.includes("Classic India")) {
    seoName = "Timeless India: Classic Heritage & Culture Tour";
    meta = "Discover India's timeless heritage. A classic cultural tour through ancient cities, majestic palaces, and vibrant traditions. Book your Indian journey today.";
  } else if (origName.includes("Rajasthan")) {
    seoName = "Royal Rajasthan: Forts, Palaces & Desert Safari Tour";
    meta = "Experience the grandeur of Royal Rajasthan. Visit magnificent forts in Jaipur, Jodhpur, Udaipur, and enjoy a desert safari in Jaisalmer. Book now!";
  } else if (origName.includes("Himachal")) {
    seoName = "Scenic Himachal: Majestic Mountains & Valleys Retreat";
    meta = "Plan your scenic Himachal getaway. Explore Shimla, Manali, and Dalhousie. Enjoy snow-capped peaks, lush valleys, and serene Himalayan landscapes.";
  } else if (origName.includes("Leh") || origName.includes("Ladakh")) {
    seoName = "Epic Leh Ladakh Adventure & Pangong Lake Expedition";
    meta = "Embark on an epic Leh Ladakh adventure. Visit Pangong Lake, Nubra Valley, and ancient monasteries. Book your ultimate Himalayan road trip today.";
  } else {
    // Generic SEO transformation for others
    seoName = `Explore ${pkg.name}: Exclusive Holiday & Tour Package`;
    meta = `Book your unforgettable ${pkg.name} tour package today. Discover amazing attractions, rich culture, and beautiful landscapes. Perfect for your next getaway!`;
  }
  
  // Truncate meta to 160 chars gracefully
  if (meta.length > 160) {
    meta = meta.substring(0, 157) + "...";
  }
  
  if (desc && !pkg.overview) {
      pkg.overview = desc;
  }
  
  // Just update the main ones, for descriptions let's add a generic attractive prefix if it wasn't specially handled
  if (pkg.overview && !origName.includes("Keralam") && !origName.includes("Kashmir") && !origName.includes("Andaman") && !origName.includes("Sikkim")) {
      pkg.overview = "Embark on an extraordinary journey. " + pkg.overview;
  } else if (!pkg.overview) {
      pkg.overview = `Experience the wonder of ${pkg.name}. This exclusive tour package offers breathtaking sights, comfortable accommodations, and memories that will last a lifetime. Book now and start your adventure.`;
  }
  
  pkg.name = seoName;
  pkg.metaDescription = meta;
}

newPackages.forEach(pkg => {
  optimizeSEO(pkg);
});

data.packages = newPackages;

fs.writeFileSync('src/data/mnm_database.json', JSON.stringify(data, null, 2), 'utf8');
console.log("Processed and saved successfully.");
