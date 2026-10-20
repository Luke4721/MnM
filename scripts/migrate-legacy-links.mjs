#!/usr/bin/env node
/**
 * migrate-legacy-links.mjs — Migrate in-content legacy URLs to modern paths.
 *
 * Usage:
 *   node scripts/migrate-legacy-links.mjs [--dry]
 *   node scripts/migrate-legacy-links.mjs --write
 *
 * Default is --dry (dry-run mode). No files are written unless --write is passed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, GetObjectCommand, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';

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
const BLOGS_DB_PATH = path.join(ROOT, 'src/data/blogs_database.json');
const PUBLIC_BLOGS_DIR = path.join(ROOT, 'public/data/blogs');
const BLOGS_INDEX_PATH = path.join(ROOT, 'src/data/blogs_index.json');
const BLOGS_VERSION_PATH = path.join(ROOT, 'src/data/blogs_version.json');

const args = process.argv.slice(2);
const isWrite = args.includes('--write');
const isDry = !isWrite || args.includes('--dry');

console.log('='.repeat(70));
console.log(`🚀 LEGACY CONTENT LINK MIGRATION [${isWrite ? 'WRITE MODE' : 'DRY-RUN MODE'}]`);
console.log('='.repeat(70));

const blogs = JSON.parse(fs.readFileSync(BLOGS_DB_PATH, 'utf8'));

// Build lookup maps
const oldUrlToSlug = new Map();
const currentSlugs = new Set();

for (const b of blogs) {
  if (b.slug) currentSlugs.add(b.slug);
  if (b.legacy && b.legacy.oldUrl) {
    oldUrlToSlug.set(b.legacy.oldUrl.trim().toLowerCase(), b.slug);
  }
}

// Manual aliases for legacy typo links found in database
const manualAliases = {
  'rumi-darwaza-luckno': 'rumi-darwaza-lucknow',
  'willingdon dam, junagadh': 'willingdon-dam-junagadh',
  'willingdon-dam,-junagadh': 'willingdon-dam-junagadh',
  'the-lakshmi-vilas-palace': 'the-lakshmi-vilas-palace',
};

/**
 * Resolves a legacy blog reference to a modern slug.
 * Returns null if unresolvable.
 */
function resolveBlogSlug(rawSlug) {
  let clean = rawSlug.trim();
  try {
    clean = decodeURIComponent(clean);
  } catch {}
  const lower = clean.toLowerCase();
  const alias = manualAliases[lower] || lower;

  if (oldUrlToSlug.has(alias)) return oldUrlToSlug.get(alias);
  if (currentSlugs.has(clean)) return clean;
  if (currentSlugs.has(lower)) return lower;

  return null;
}

// Pre-scan all links to verify 100% resolvability before any mutation
const unresolvable = [];
let totalBlogLinks = 0;
let totalPackageLinks = 0;
const replacementDiffs = [];

// Regex to find all mnmtravels.in links (excluding images which are handled separately)
// Pattern matches: (https?://)?(www.)?mnmtravels.in/...
const linkRegex = /(?:https?:\/\/)?(?:www\.)?mnmtravels\.in[^\s"'<>)]+/gi;

for (const b of blogs) {
  const content = b.content || '';
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const originalUrl = match[0];

    // Skip image URLs
    if (originalUrl.includes('/images/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(originalUrl)) {
      continue;
    }

    if (originalUrl.includes('/blog/')) {
      totalBlogLinks++;
      // Extract the slug and optional hash fragment
      let slugPart = originalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?mnmtravels\.in\/blog\/(?:detail\/)?/i, '');
      let hash = '';
      const hashIdx = slugPart.indexOf('#');
      if (hashIdx !== -1) {
        hash = slugPart.slice(hashIdx);
        slugPart = slugPart.slice(0, hashIdx);
      }
      const qIdx = slugPart.indexOf('?');
      if (qIdx !== -1) {
        slugPart = slugPart.slice(0, qIdx);
      }
      slugPart = slugPart.replace(/\/+$/, '');

      const resolvedSlug = resolveBlogSlug(slugPart);
      if (!resolvedSlug) {
        unresolvable.push({ blogSlug: b.slug, originalUrl, extractedSlug: slugPart });
      } else {
        const newUrl = `/blog/${resolvedSlug}${hash}`;
        replacementDiffs.push({
          blogSlug: b.slug,
          type: 'blog',
          from: originalUrl,
          to: newUrl,
        });
      }
    } else if (
      originalUrl.includes('/india-holidays') ||
      originalUrl.includes('/india-holiday-packages') ||
      originalUrl.includes('/kailash-mansarovar')
    ) {
      totalPackageLinks++;
      replacementDiffs.push({
        blogSlug: b.slug,
        type: 'package',
        from: originalUrl,
        to: '/packages',
      });
    } else {
      unresolvable.push({ blogSlug: b.slug, originalUrl, reason: 'unknown path' });
    }
  }
}

// Check if any legacy URL cannot be resolved
if (unresolvable.length > 0) {
  console.error('\n❌ FATAL: Found unresolvable legacy URLs:');
  console.table(unresolvable);
  console.error('\nABORTING: All legacy URLs must resolve to a valid current destination.');
  process.exit(1);
}

console.log(`\n✅ Pre-scan verification complete: 0 unresolvable links found.`);
console.log(`   - Blog links resolved: ${totalBlogLinks}`);
console.log(`   - Package/Holiday links resolved: ${totalPackageLinks}`);
console.log(`   - Total links to migrate: ${replacementDiffs.length}`);

// If in dry-run mode, print sample proposed changes and exit
if (isDry) {
  console.log('\n--- SAMPLE PROPOSED REPLACEMENTS (First 15 of ' + replacementDiffs.length + ') ---');
  for (const diff of replacementDiffs.slice(0, 15)) {
    console.log(`[Blog: ${diff.blogSlug}] (${diff.type})`);
    console.log(`  - FROM: ${diff.from}`);
    console.log(`  + TO:   ${diff.to}`);
  }
  console.log('\n--- DRY-RUN SUMMARY ---');
  console.log(`Total blogs in database: ${blogs.length}`);
  const affectedBlogs = new Set(replacementDiffs.map(d => d.blogSlug));
  console.log(`Affected blogs with links: ${affectedBlogs.size}`);
  console.log(`Total link replacements: ${replacementDiffs.length}`);
  console.log(`\nTo execute these changes, re-run with: node scripts/migrate-legacy-links.mjs --write\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// WRITE MODE EXECUTION
// ---------------------------------------------------------------------------

async function executeMigration() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(ROOT, 'backups', `pre-link-migration-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`\n1. Creating local backup at: ${backupDir}`);
  fs.copyFileSync(BLOGS_DB_PATH, path.join(backupDir, 'blogs_database.json'));

  // Backup public/data/blogs
  const publicBackupDir = path.join(backupDir, 'public_blogs');
  fs.mkdirSync(publicBackupDir, { recursive: true });
  if (fs.existsSync(PUBLIC_BLOGS_DIR)) {
    for (const f of fs.readdirSync(PUBLIC_BLOGS_DIR)) {
      if (f.endsWith('.json')) {
        fs.copyFileSync(path.join(PUBLIC_BLOGS_DIR, f), path.join(publicBackupDir, f));
      }
    }
  }
  console.log(`   Local backup completed.`);

  // S3 backup
  const s3 = new S3Client({
    region: REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    } : undefined,
  });

  if (process.env.AWS_ACCESS_KEY_ID) {
    try {
      console.log(`2. Backing up S3 database/blogs_database.json...`);
      const backupKey = `database/backups/blogs_database_backup_${timestamp}.json`;
      await s3.send(new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/database/blogs_database.json`,
        Key: backupKey,
      }));
      console.log(`   S3 backup created: s3://${BUCKET}/${backupKey}`);
    } catch (err) {
      console.warn(`   Notice: Could not copy S3 backup (${err.message}). Proceeding with local backup.`);
    }
  }

  console.log('\n3. Performing content replacements across blogs...');
  let totalReplaced = 0;

  for (const b of blogs) {
    if (!b.content) continue;
    let content = b.content;

    // Apply replacements for this blog
    const diffsForBlog = replacementDiffs.filter(d => d.blogSlug === b.slug);
    if (diffsForBlog.length === 0) continue;

    for (const diff of diffsForBlog) {
      // Escape URL for regex replacement
      const escaped = diff.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      content = content.replace(regex, diff.to);
      totalReplaced++;
    }

    b.content = content;
  }

  console.log(`   Applied ${totalReplaced} replacements across blogs.`);

  console.log('\n4. Writing updated src/data/blogs_database.json...');
  fs.writeFileSync(BLOGS_DB_PATH, JSON.stringify(blogs, null, 2), 'utf8');

  console.log('\n5. Updating public/data/blogs/[slug].json files...');
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

  console.log('\n6. Updating src/data/blogs_index.json...');
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

  // Upload to S3 if credentials available
  if (process.env.AWS_ACCESS_KEY_ID) {
    console.log('\n7. Uploading updated blogs_database.json to S3...');
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
  console.log('🎉 CONTENT LINK MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(70));
}

executeMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
