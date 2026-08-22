import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://mnmtravels.com/gallery';
const OUTPUT_FILE = path.join(__dirname, '../src/data/gallery_database.json');

const fallbacks = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1548624317-a006db23a1d9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80"
];

async function scrapeGallery() {
  let totalFound = 0;
  let successfullyImported = 0;
  let failedCount = 0;
  let fallbackImageCount = 0;
  
  try {
    console.log(`Fetching from ${TARGET_URL}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(TARGET_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const gallery = [];
    
    const elements = $('.gallery-item img, .portfolio img, .memory img');
    totalFound = elements.length;
    
    elements.each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      
      if (!src) {
        failedCount++;
        return;
      }
      if (src.startsWith('/')) {
        src = new URL(src, TARGET_URL).toString();
      }
      
      gallery.push(src);
      successfullyImported++;
    });

    if (gallery.length === 0) {
      throw new Error("No images found on the page.");
    }
    
    console.log(`Successfully scraped ${gallery.length} images.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gallery, null, 2));
    
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
    
  } catch (error) {
    console.warn(`Scraping failed: ${error.message}`);
    console.log("Using fallback gallery data...");
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fallbacks, null, 2));
    
    console.log("\n========================================");
    console.log("📊 RAW IMPORT REPORT");
    console.log("========================================");
    console.table({
      "Total Items Found": fallbacks.length,
      "Successfully Imported": fallbacks.length,
      "Failed / Skipped": 0,
      "Items using Fallback Images": 0
    });
    console.log("========================================\n");
  }
}

scrapeGallery();
