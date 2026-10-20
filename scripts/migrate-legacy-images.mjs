#!/usr/bin/env node
/**
 * migrate-legacy-images.mjs — Download legacy content images from mnmtravels.in,
 * upload them to AWS S3 under blog-images/legacy/<hash>.<ext>, and rewrite
 * content image URLs in the blogs database.
 *
 * Usage:
 *   node scripts/migrate-legacy-images.mjs [--dry]
 *   node scripts/migrate-legacy-images.mjs --write
 *
 * Default is --dry (dry-run mode). No files are written and nothing is uploaded to S3
 * unless --write is passed.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env.local if present
const envLocalPath = path.join(ROOT, '.env.local');
if (fs.existsSync(envLocalPath)) {
  for (const line of fs.readFileSync(envLocalPath, 'utf-8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

const BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
const REGION = process.env.AWS_REGION || 'ap-south-1';
const CLOUDFRONT = process.env.AWS_CLOUDFRONT_DOMAIN
  ? `https://${process.env.AWS_CLOUDFRONT_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  : `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

const PIXABAY_KEY = process.env.PIXABAY_API_KEY || '';
const BLOGS_DB_PATH = path.join(ROOT, 'src/data/blogs_database.json');
const PUBLIC_BLOGS_DIR = path.join(ROOT, 'public/data/blogs');
const BLOGS_INDEX_PATH = path.join(ROOT, 'src/data/blogs_index.json');

const args = process.argv.slice(2);
const isWrite = args.includes('--write');
const isDry = !isWrite || args.includes('--dry');

console.log('='.repeat(70));
console.log(`🖼️  LEGACY CONTENT IMAGE MIGRATION [${isWrite ? 'WRITE MODE' : 'DRY-RUN MODE'}]`);
console.log('='.repeat(70));

const blogs = JSON.parse(fs.readFileSync(BLOGS_DB_PATH, 'utf8'));

// Identify all content images pointing to mnmtravels.in
const imageReferences = [];
const imageRegex = /(?:https?:\/\/)?(?:www\.)?mnmtravels\.in[^\s"'<>)]+/gi;

for (const b of blogs) {
  const content = b.content || '';
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const url = match[0];
    if (url.includes('/images/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url)) {
      imageReferences.push({ blogSlug: b.slug, url });
    }
  }
}

const uniqueUrls = [...new Set(imageReferences.map(i => i.url))];
console.log(`Found ${imageReferences.length} total image references across blogs.`);
console.log(`Found ${uniqueUrls.length} unique image URLs to migrate.`);

// Map each unique URL to its stable hash filename and S3 key
const imageMap = new Map();
for (const u of uniqueUrls) {
  // Hash the original URL
  const hash = crypto.createHash('md5').update(u).digest('hex');
  let ext = '.png';
  try {
    const parsed = new URL(u);
    const pExt = path.extname(parsed.pathname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(pExt)) {
      ext = pExt;
    }
  } catch {}
  const filename = `${hash}${ext}`;
  const s3Key = `blog-images/legacy/${filename}`;
  const newUrl = `${CLOUDFRONT}/${s3Key}`;
  imageMap.set(u, {
    originalUrl: u,
    filename,
    s3Key,
    newUrl,
    ext,
  });
}

// Fallback search keywords for the 10 images that are missing from legacy server
const fallbackQueries = {
  '785919a65a6acab2fba20ea25e975b44.png': 'majuli assam temple',
  'fc80fb1b46beb98d9f934293e388cafc.png': 'kamalabari satra majuli',
  '9185a2414b74a4cbb723afe6f0ea8d77.png': 'dakhinpat satra majuli',
  '19b6b589acda22d8c7c86d268edeb0c1.png': 'majuli island culture',
  '04e7f19b3628d1ac31e504d1c9553637.png': 'samaguri satra mask majuli',
  'a52af79a8e142a5a861d764ff05fc63b.png': 'gangtok mg marg sikkim',
  '61a063516f71a55b216d4c37f43a1149.png': 'tsomgo lake sikkim snow',
  '9ad4ab8e37e50116c83640c01e111ecf.png': 'nathula pass sikkim border',
  '0cb68bd46c38bd19bde674e75496445f.png': 'north sikkim yumthang valley',
  '363bd07517d149e794668023f3bd63ce.png': 'pelling skywalk sikkim kanchenjunga',
};

// If dry-run, output summary and exit
if (isDry) {
  console.log('\n--- SAMPLE PROPOSED IMAGE REPLACEMENTS (First 10 of ' + uniqueUrls.length + ') ---');
  let i = 0;
  for (const [orig, item] of imageMap.entries()) {
    if (i++ >= 10) break;
    console.log(`Original: ${orig}`);
    console.log(`S3 Key:   ${item.s3Key}`);
    console.log(`New URL:  ${item.newUrl}\n`);
  }

  console.log('--- DRY-RUN SUMMARY ---');
  console.log(`Total blogs affected: ${new Set(imageReferences.map(r => r.blogSlug)).size}`);
  console.log(`Total in-content images to migrate: ${uniqueUrls.length}`);
  console.log(`Target S3 prefix: s3://${BUCKET}/blog-images/legacy/`);
  console.log(`URL prefix: ${CLOUDFRONT}/blog-images/legacy/`);
  console.log(`\nTo execute this migration and upload to S3, run:`);
  console.log(`  node scripts/migrate-legacy-images.mjs --write\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// WRITE MODE EXECUTION
// ---------------------------------------------------------------------------

const s3 = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

async function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const req = https.get('https://mnmtravels.in' + parsed.pathname, { agent: httpsAgent }, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const contentType = res.headers['content-type'] || 'image/png';
          resolve({ buffer: buf, contentType });
        });
      });
      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function fetchPixabayFallback(query) {
  if (!PIXABAY_KEY) throw new Error('No Pixabay API key available');
  const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Pixabay API returned ${res.status}`);
  const data = await res.json();
  if (!data.hits || data.hits.length === 0) {
    // Try broader query
    const words = query.split(' ');
    const fallbackRes = await fetch(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(words[0])}&image_type=photo&per_page=3`);
    const fallbackData = await fallbackRes.json();
    if (fallbackData.hits && fallbackData.hits.length > 0) {
      const imgRes = await fetch(fallbackData.hits[0].largeImageURL || fallbackData.hits[0].webformatURL);
      const arr = await imgRes.arrayBuffer();
      return { buffer: Buffer.from(arr), contentType: 'image/jpeg' };
    }
    throw new Error(`No image found for query: ${query}`);
  }
  const imgUrl = data.hits[0].largeImageURL || data.hits[0].webformatURL;
  const imgRes = await fetch(imgUrl);
  const arr = await imgRes.arrayBuffer();
  return { buffer: Buffer.from(arr), contentType: 'image/jpeg' };
}

async function runImageMigration() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(ROOT, 'backups', `pre-image-migration-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`\n1. Creating local backup at: ${backupDir}`);
  fs.copyFileSync(BLOGS_DB_PATH, path.join(backupDir, 'blogs_database.json'));

  const publicBackupDir = path.join(backupDir, 'public_blogs');
  fs.mkdirSync(publicBackupDir, { recursive: true });
  if (fs.existsSync(PUBLIC_BLOGS_DIR)) {
    for (const f of fs.readdirSync(PUBLIC_BLOGS_DIR)) {
      if (f.endsWith('.json')) {
        fs.copyFileSync(path.join(PUBLIC_BLOGS_DIR, f), path.join(publicBackupDir, f));
      }
    }
  }

  // Backup on S3
  if (process.env.AWS_ACCESS_KEY_ID) {
    try {
      console.log(`2. Backing up S3 database/blogs_database.json...`);
      const backupKey = `database/backups/blogs_database_img_backup_${timestamp}.json`;
      await s3.send(new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/database/blogs_database.json`,
        Key: backupKey,
      }));
      console.log(`   S3 backup created: s3://${BUCKET}/${backupKey}`);
    } catch (err) {
      console.warn(`   Notice: Could not copy S3 backup (${err.message}). Proceeding.`);
    }
  }

  console.log(`\n3. Downloading images and uploading to S3 under blog-images/legacy/...`);
  let uploadedCount = 0;
  let skippedExisting = 0;
  let fallbackCount = 0;
  let errorCount = 0;

  // Process images sequentially or in small batches to respect rate limits
  const entries = [...imageMap.values()];
  const batchSize = 10;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await Promise.all(batch.map(async (item) => {
      // Check if already in S3
      try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: item.s3Key }));
        skippedExisting++;
        return;
      } catch (err) {
        // Does not exist, proceed to upload
      }

      let payload = null;
      try {
        payload = await downloadBuffer(item.originalUrl);
      } catch (dlErr) {
        // Fallback for missing images
        const basename = path.basename(new URL(item.originalUrl).pathname);
        const query = fallbackQueries[basename] || 'india travel tourism';
        try {
          payload = await fetchPixabayFallback(query);
          fallbackCount++;
        } catch (fbErr) {
          console.error(`Failed to download or find fallback for ${item.originalUrl}:`, fbErr.message);
          errorCount++;
          return;
        }
      }

      if (payload && payload.buffer) {
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: item.s3Key,
          Body: payload.buffer,
          ContentType: payload.contentType || 'image/png',
          CacheControl: 'public, max-age=31536000, immutable',
        }));
        uploadedCount++;
      }
    }));
    process.stdout.write(`   Processed ${Math.min(i + batchSize, entries.length)}/${entries.length} images...\r`);
  }

  console.log(`\n\nImage processing summary:`);
  console.log(`   - Uploaded to S3: ${uploadedCount}`);
  console.log(`   - Already in S3 (skipped): ${skippedExisting}`);
  console.log(`   - Fallback stock images used: ${fallbackCount}`);
  console.log(`   - Errors: ${errorCount}`);

  if (errorCount > 0) {
    console.error(`❌ Migration halted with ${errorCount} errors. Not modifying content.`);
    process.exit(1);
  }

  console.log('\n4. Rewriting content image URLs in blogs_database.json...');
  let totalUrlsReplaced = 0;

  for (const b of blogs) {
    if (!b.content) continue;
    let content = b.content;

    for (const [originalUrl, item] of imageMap.entries()) {
      if (content.includes(originalUrl)) {
        const escaped = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(new RegExp(escaped, 'g'), item.newUrl);
        totalUrlsReplaced++;
      }
    }
    b.content = content;
  }

  console.log(`   Replaced ${totalUrlsReplaced} image URLs across blogs.`);

  console.log('\n5. Saving updated src/data/blogs_database.json...');
  fs.writeFileSync(BLOGS_DB_PATH, JSON.stringify(blogs, null, 2), 'utf8');

  console.log('\n6. Updating static public/data/blogs/*.json files...');
  fs.mkdirSync(PUBLIC_BLOGS_DIR, { recursive: true });
  for (const b of blogs) {
    if (b.slug) {
      fs.writeFileSync(
        path.join(PUBLIC_BLOGS_DIR, `${b.slug}.json`),
        JSON.stringify(b),
        'utf8'
      );
    }
  }

  console.log('\n7. Updating src/data/blogs_index.json...');
  const blogsIndex = blogs.map((b) => ({
    id: b.id,
    title: b.title || '',
    slug: b.slug || '',
    excerpt: (b.excerpt || b.content?.replace(/<[^>]*>?/gm, ' ') || '').trim().slice(0, 160),
    featuredImage: b.featuredImage || b.image || '',
    imageAlt: b.imageAlt || b.title || '',
    category: b.category || 'India',
    publishedAt: b.publishedAt || b.createdAt || '',
    readTime: b.readTime || '1 min read',
    status: b.status || 'published',
    featured: !!b.featured,
    tags: Array.isArray(b.tags) ? b.tags : [],
  }));
  fs.writeFileSync(BLOGS_INDEX_PATH, JSON.stringify(blogsIndex), 'utf8');

  if (process.env.AWS_ACCESS_KEY_ID) {
    console.log('\n8. Uploading updated blogs_database.json to S3...');
    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: 'database/blogs_database.json',
        Body: JSON.stringify(blogs),
        ContentType: 'application/json',
      }));
      console.log('   Successfully updated database/blogs_database.json on S3.');
    } catch (err) {
      console.error('   Failed to upload to S3:', err.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 LEGACY IMAGE MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(70));
}

runImageMigration().catch(err => {
  console.error('Image migration failed:', err);
  process.exit(1);
});
