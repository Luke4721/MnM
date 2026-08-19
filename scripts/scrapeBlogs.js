import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://mnmtravels.com/blog';
const OUTPUT_FILE = path.join(__dirname, '../src/data/blogs_database.json');

const fallbacks = [
  {
    id: 1,
    title: "10 Hidden Gems in Europe for 2026",
    slug: "10-hidden-gems-europe-2026",
    date: "Aug 10, 2026",
    author: "Sarah Jenkins",
    excerpt: "Discover the most beautiful and less crowded spots across Europe.",
    content: "Europe is full of surprises. While Paris and Rome are always great, there are countless hidden gems waiting to be explored. From the picturesque villages of the Cotswolds to the stunning coastline of the Algarve, here are 10 places you need to add to your bucket list.",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "A Culinary Journey through Asia",
    slug: "culinary-journey-asia",
    date: "Aug 05, 2026",
    author: "Mike Chen",
    excerpt: "From street food to fine dining, explore the diverse flavors of Asia.",
    content: "Asian cuisine is incredibly diverse, offering everything from spicy curries in Thailand to delicate sushi in Japan. Embark on a culinary journey with us as we explore the rich flavors and unique culinary traditions of this vibrant continent.",
    image: "https://images.unsplash.com/photo-1548624317-a006db23a1d9?q=80&w=800&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "The Ultimate Guide to Safari in Africa",
    slug: "ultimate-guide-safari-africa",
    date: "Jul 28, 2026",
    author: "Emma Stone",
    excerpt: "Everything you need to know before embarking on your first African safari.",
    content: "A safari in Africa is a once-in-a-lifetime experience. Witnessing the Big Five in their natural habitat is truly awe-inspiring. Whether you're planning a luxury lodge stay or a rugged camping adventure, our guide covers all the essentials.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Backpacking South America: Tips and Tricks",
    slug: "backpacking-south-america",
    date: "Jul 15, 2026",
    author: "David Lee",
    excerpt: "A comprehensive guide for budget travelers exploring South America.",
    content: "South America is a backpacker's paradise, offering stunning landscapes, vibrant cultures, and affordable travel options. Learn how to navigate the continent on a budget, from finding cheap accommodation to taking local transport.",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop",
    readTime: "10 min read"
  },
  {
    id: 5,
    title: "Winter Wonderland: Skiing in the Swiss Alps",
    slug: "skiing-swiss-alps",
    date: "Feb 12, 2026",
    author: "Hannah Bauer",
    excerpt: "Hit the slopes in one of the most famous skiing destinations in the world.",
    content: "The Swiss Alps offer some of the best skiing in the world, with pristine slopes, stunning scenery, and cozy alpine villages. Discover the top resorts, what to pack, and tips for a perfect winter getaway.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
    readTime: "7 min read"
  }
];

async function scrapeBlogs() {
  try {
    console.log(`Fetching from ${TARGET_URL}...`);
    // Using an AbortController with a 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(TARGET_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const blogs = [];
    
    // Attempt to scrape based on common blog structures
    $('article, .post, .blog-item').each((i, el) => {
      const title = $(el).find('h1, h2, h3, .post-title, .title').text().trim();
      if (!title) return; // Skip if no title
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let image = $(el).find('img').attr('src');
      const excerpt = $(el).find('.excerpt, p').first().text().trim();
      const date = $(el).find('.date, time').text().trim() || new Date().toLocaleDateString();
      const author = $(el).find('.author, .byline').text().trim() || 'Admin';
      
      // Fallback image if relative or missing
      if (!image || image.startsWith('/')) {
         image = fallbacks[i % fallbacks.length].image;
      }
      
      blogs.push({
        id: i + 1,
        title,
        slug,
        date,
        author,
        excerpt: excerpt || title,
        content: `<p>${excerpt || 'Full content not extracted.'}</p>`, // basic fallback
        image,
        readTime: "5 min read"
      });
    });

    if (blogs.length === 0) {
      throw new Error("No articles found on the page.");
    }
    
    console.log(`Successfully scraped ${blogs.length} articles.`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogs, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.warn(`Scraping failed: ${error.message}`);
    console.log("Using fallback blog data...");
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fallbacks, null, 2));
    console.log(`Saved fallback data to ${OUTPUT_FILE}`);
  }
}

scrapeBlogs();
