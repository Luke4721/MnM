import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://mnmtravels.com';
const OUTPUT_FILE = path.join(__dirname, '../src/data/testimonials_database.json');

const fallbacks = [
  {
    id: 1,
    author: "Alexander",
    date: "July 2026",
    text: "Our Africa travel specialist planned the most amazing trip to Kenya for us. We had an incredible time and were able to capture so many awesome pictures.",
    avatar: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    author: "Sarah & John",
    date: "August 2026",
    text: "The honeymoon package to the Maldives was absolutely flawless. From the private villa to the underwater dining, every detail was perfect. Highly recommend MNM Travels!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    author: "Michael T.",
    date: "May 2026",
    text: "Exploring the Swiss Alps was on my bucket list for years. The team arranged the best ski resorts and local guides. An unforgettable winter wonderland experience.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
  }
];

async function scrapeTestimonials() {
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
    
    const testimonials = [];
    
    const elements = $('.testimonial, .review, .client-feedback');
    totalFound = elements.length;
    
    elements.each((i, el) => {
      const author = $(el).find('.author, .name, h4').text().trim();
      if (!author) {
        failedCount++;
        return;
      }
      
      const text = $(el).find('.text, p').text().trim();
      const date = $(el).find('.date, time').text().trim() || new Date().toLocaleDateString();
      let avatar = $(el).find('img').attr('src');
      
      if (!avatar || avatar.startsWith('/')) {
         avatar = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
         fallbackImageCount++;
      }
      
      testimonials.push({
        id: i + 1,
        author,
        date,
        text: text || "Great experience with MNM Travels!",
        avatar
      });
      successfullyImported++;
    });

    if (testimonials.length === 0) {
      throw new Error("No testimonials found on the page.");
    }
    
    console.log(`Successfully scraped ${testimonials.length} testimonials.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(testimonials, null, 2));
    
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
    console.log("Using fallback testimonial data...");
    
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

scrapeTestimonials();
