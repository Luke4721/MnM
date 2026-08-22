import fs from 'fs';
import path, { dirname } from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, '../src/data/blogs_database.json');

const browserHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
};

async function runMigration() {
  try {
    // 1. Load Current State
    let currentBlogs = [];
    if (fs.existsSync(DB_PATH)) {
      currentBlogs = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
    const existingSlugs = new Set(currentBlogs.map(b => b.slug));

    console.log("Scraping raw PHP HTML...");
    // Try common PHP blog endpoints
    const endpoints = ['blog.php', 'blogs.php', 'news.php', 'articles.php'];
    let html = null;

    for (let endpoint of endpoints) {
      const response = await fetch(`https://monks-n-monkeys.com/${endpoint}`, { headers: browserHeaders });
      if (response.ok) {
         html = await response.text();
         console.log(`Successfully reached /${endpoint}`);
         break;
      }
    }

    if (!html) {
       console.log("Could not find a valid .php blog index. Manual extraction via Drive/CSV required.");
       process.exit();
    }

    const $ = cheerio.load(html);
    // Aggressive fallback extraction (finds anything that looks like an article card)
    const fetchedBlogs = [];
    $('.blog, .article, .news-item, .post, .row, .col-md-4').each((i, el) => {
       const title = $(el).find('h1, h2, h3, h4, .title').first().text().trim();
       if (title && title.length > 5) {
          fetchedBlogs.push({
             id: `legacy-${i}`,
             slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
             title: title,
             excerpt: $(el).find('p').first().text().trim().substring(0, 150) + "...",
             date: new Date().toISOString().split('T')[0],
             author: "MNM Travels"
          });
       }
    });

    // 4. Deduplicate
    const newBlogs = fetchedBlogs.filter(b => !existingSlugs.has(b.slug));

    // 5. Merge & Save
    if (newBlogs.length > 0) {
      const mergedBlogs = [...currentBlogs, ...newBlogs];
      fs.writeFileSync(DB_PATH, JSON.stringify(mergedBlogs, null, 2));
    }

    // 6. Strict Reporting Table
    console.log("\n========================================");
    console.log("🚀 MIGRATION & DEDUPLICATION REPORT");
    console.log("========================================");
    console.table({
      "Existing Records": existingSlugs.size,
      "Total Fetched": fetchedBlogs.length,
      "Duplicates Skipped": fetchedBlogs.length - newBlogs.length,
      "New Records Added": newBlogs.length
    });
    console.log("========================================\n");

  } catch (err) {
    console.error("Migration script failed:", err);
  }
}

runMigration();
