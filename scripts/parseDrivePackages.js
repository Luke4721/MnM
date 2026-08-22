import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '../src/data/raw_packages');
const DB_PATH = path.join(__dirname, '../src/data/mnm_database.json');

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      // Exclude temp word files
      if (!file.startsWith('~$') && !file.endsWith('.tmp')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Directory ${RAW_DIR} does not exist. Create it and add raw json files.`);
    return;
  }

  const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  const allFiles = getAllFiles(RAW_DIR);
  const rawFiles = allFiles.filter(f => f.endsWith('.json') || f.endsWith('.docx'));

  console.log(`Found ${rawFiles.length} raw package files.`);
  
  let totalFound = rawFiles.length;
  let successfullyImported = 0;
  let failedCount = 0;
  let fallbackImageCount = 0;

  // 1. Ensure existing packages have a slug
  dbData.packages = dbData.packages.map(pkg => {
    if (!pkg.slug) {
      pkg.slug = slugify(pkg.title || pkg.name || pkg.id);
    }
    return pkg;
  });

  // 2. Merge new packages
  for (const filePath of rawFiles) {
    try {
      if (filePath.endsWith('.json')) {
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        let imageToUse = rawData.heroImage;
        if (!imageToUse || imageToUse.startsWith('/')) {
          imageToUse = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
          fallbackImageCount++;
        }
        
        // Convert to compatible schema
        const formattedPrice = `₹${rawData.startingPrice.toLocaleString('en-IN')}`;
        const nights = rawData.durationNights < 10 ? `0${rawData.durationNights}` : rawData.durationNights;
        const days = rawData.durationDays < 10 ? `0${rawData.durationDays}` : rawData.durationDays;
        const formattedDuration = `${nights} Nights / ${days} Days`;
        
        const compatiblePackage = {
          // Legacy compatibility properties
          id: rawData.id.toString(),
          slug: rawData.slug || slugify(rawData.title),
          title: rawData.title,
          name: rawData.title,
          price: formattedPrice,
          priceINR: rawData.startingPrice,
          duration: formattedDuration,
          nights: formattedDuration,
          days: formattedDuration,
          locations: rawData.destination,
          location: rawData.destination,
          highlights_old: `Locations: ${rawData.destination}`, 
          category: rawData.category,
          type: "Domestic", // Fallback
          image_url: imageToUse,
          img: imageToUse,
          image: imageToUse,
          
          // New schema properties
          startingPrice: rawData.startingPrice,
          rating: rawData.rating,
          reviewsCount: rawData.reviewsCount,
          heroImage: imageToUse,
          gallery: rawData.gallery || [],
          overview: rawData.overview || "",
          highlights: rawData.highlights || [],
          itinerary: rawData.itinerary || [],
          inclusions: rawData.inclusions || [],
          exclusions: rawData.exclusions || [],
          durationNights: rawData.durationNights,
          durationDays: rawData.durationDays,
          destination: rawData.destination
        };

        const existingIndex = dbData.packages.findIndex(p => p.id === compatiblePackage.id);
        if (existingIndex > -1) {
          dbData.packages[existingIndex] = { ...dbData.packages[existingIndex], ...compatiblePackage };
        } else {
          dbData.packages.push(compatiblePackage);
        }
        successfullyImported++;
      } else if (filePath.endsWith('.docx')) {
        const result = await mammoth.extractRawText({path: filePath});
        const text = result.value;
        
        const fileName = path.basename(filePath, '.docx');
        const parentFolder = path.basename(path.dirname(filePath));
        
        // Regex for Title and Duration
        const durationRegex = /(\d+)\s*N\s*-\s*(\d+)\s*D/i;
        const durationMatch = fileName.match(durationRegex) || text.match(durationRegex);
        let nights = 3;
        let days = 4;
        let formattedDuration = "03 Nights / 04 Days";
        if (durationMatch) {
            nights = parseInt(durationMatch[1]);
            days = parseInt(durationMatch[2]);
            const nStr = nights < 10 ? `0${nights}` : nights;
            const dStr = days < 10 ? `0${days}` : days;
            formattedDuration = `${nStr} Nights / ${dStr} Days`;
        }
        
        let title = fileName.replace(durationRegex, '').replace(/[_-]/g, ' ').trim();
        if (title.toLowerCase() === 'common faq' || title.toLowerCase() === 'itinerary') {
          title = `${parentFolder} Package`;
        }

        const imageToUse = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
        fallbackImageCount++;

        const slug = slugify(title);
        const compatiblePackage = {
          id: slug,
          slug: slug,
          title: title,
          name: title,
          price: "₹15,000",
          priceINR: 15000,
          duration: formattedDuration,
          nights: formattedDuration,
          days: formattedDuration,
          locations: parentFolder,
          location: parentFolder,
          category: "Popular",
          type: "Domestic",
          image_url: imageToUse,
          img: imageToUse,
          image: imageToUse,
          startingPrice: 15000,
          rating: 4.8,
          reviewsCount: 15,
          heroImage: imageToUse,
          gallery: [],
          overview: text.substring(0, 500) + '...',
          highlights: [],
          itinerary: [{ day: 1, title: "Arrival", description: text.substring(0, 300) }],
          inclusions: [],
          exclusions: [],
          durationNights: nights,
          durationDays: days,
          destination: parentFolder
        };

        const existingIndex = dbData.packages.findIndex(p => p.id === compatiblePackage.id);
        if (existingIndex > -1) {
          dbData.packages[existingIndex] = { ...dbData.packages[existingIndex], ...compatiblePackage };
        } else {
          dbData.packages.push(compatiblePackage);
        }
        successfullyImported++;
      }
    } catch (error) {
      console.error(`Failed to parse ${path.basename(filePath)}: ${error.message}`);
      failedCount++;
    }
  }

  // Save back to db
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
  console.log('Successfully updated mnm_database.json');
  
  console.log("\n========================================");
  console.log("📊 RAW IMPORT REPORT");
  console.log("========================================");
  console.table({
    "Total Items Found": totalFound,
    "Successfully Imported": successfullyImported,
    "Failed / Skipped": failedCount,
    "Items using Fallback Images": fallbackImageCount
  });
  console.log("========================================\n");
}

main().catch(console.error);
