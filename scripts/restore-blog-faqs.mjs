#!/usr/bin/env node
/**
 * restore-blog-faqs.mjs
 * 
 * Re-extracts FAQ sections from legacy MySQL dump (tbl_blog_faqs)
 * and attaches them to the 600+ blogs in src/data/blogs_database.json.
 * 
 * Usage:
 *   node scripts/restore-blog-faqs.mjs [--dry-run] [--no-s3] [--sql <path>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOGS_DB = path.join(ROOT, 'src/data/blogs_database.json');
const REPORT_FILE = path.join(__dirname, 'restore-blog-faqs.report.json');
const DEFAULT_SQL = 'C:\\Users\\Windows\\Downloads\\mnm_backup_complete.sql';

// CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noS3 = args.includes('--no-s3');
const sqlArgIdx = args.indexOf('--sql');
const SQL_PATH = sqlArgIdx !== -1 && args[sqlArgIdx + 1] ? args[sqlArgIdx + 1] : DEFAULT_SQL;

// Decode HTML entities
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

// Escape-aware parser for MySQL dump tuples
function parseTuples(data) {
  const rows = [];
  let row = null;
  let field = '';
  let inString = false;
  let depth = 0;
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    if (inString) {
      if (c === '\\') {
        const next = data[i + 1];
        const esc = { '0': '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a' }[next];
        if (esc !== undefined) { field += esc; i++; }
        else if (next !== undefined) { field += next; i++; }
      } else if (c === "'") {
        inString = false;
      } else {
        field += c;
      }
    } else if (c === "'") {
      inString = true;
    } else if (c === '(') {
      depth++;
      if (depth === 1) { row = []; field = ''; }
    } else if (c === ')') {
      depth--;
      if (depth === 0 && row) {
        row.push(field);
        rows.push(row);
        row = null;
        field = '';
      }
    } else if (c === ',' && depth === 1) {
      row.push(field);
      field = '';
    } else if (depth >= 1) {
      field += c;
    }
  }
  return rows;
}

function cleanQuestion(q) {
  if (!q) return '';
  let str = decodeEntities(q).trim();
  // Strip leading numbering or dot, e.g. ". Can we see...", "1. How..."
  str = str.replace(/^(\d+[.)]|\.)\s*/, '');
  // Fix space before question mark: "Delhi ?" -> "Delhi?"
  str = str.replace(/\s+\?$/, '?');
  // Ensure closing question mark if it ends without punctuation
  if (!str.endsWith('?') && !str.endsWith('.') && !str.endsWith('!')) {
    str += '?';
  }
  return str;
}

function cleanAnswer(a) {
  if (!a) return '';
  let str = decodeEntities(a).trim();
  // Normalize Windows newlines
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return str;
}

async function main() {
  console.log('=== Blog FAQ Restoration Pipeline ===');
  console.log(`Source SQL : ${SQL_PATH}`);
  console.log(`Target DB  : ${BLOGS_DB}`);
  console.log(`Dry Run    : ${dryRun}`);

  if (!fs.existsSync(SQL_PATH)) {
    console.error(`[FATAL] SQL dump not found at: ${SQL_PATH}`);
    process.exit(1);
  }

  console.log('Reading SQL dump...');
  const sqlText = fs.readFileSync(SQL_PATH, 'utf8');

  const faqsMatch = sqlText.match(/INSERT INTO `tbl_blog_faqs` VALUES ([\s\S]*?);(?:\n|\r)/);
  if (!faqsMatch) {
    console.error('[FATAL] INSERT INTO `tbl_blog_faqs` not found in SQL dump.');
    process.exit(1);
  }

  console.log('Parsing `tbl_blog_faqs` rows...');
  const rawRows = parseTuples(faqsMatch[1]);
  console.log(`Parsed ${rawRows.length} raw FAQ rows.`);

  const faqsByBlogId = {};
  for (const r of rawRows) {
    const id = parseInt(r[0], 10);
    const blogId = parseInt(r[1], 10);
    const qRaw = r[2];
    const aRaw = r[3];

    const question = cleanQuestion(qRaw);
    const answer = cleanAnswer(aRaw);

    if (!question || !answer) continue;

    if (!faqsByBlogId[blogId]) {
      faqsByBlogId[blogId] = [];
    }
    faqsByBlogId[blogId].push({ id, question, answer });
  }

  const distinctBlogIdsInSql = Object.keys(faqsByBlogId);
  console.log(`Grouped FAQs for ${distinctBlogIdsInSql.length} legacy blog IDs.`);

  // Load target blogs_database.json
  if (!fs.existsSync(BLOGS_DB)) {
    console.error(`[FATAL] Blogs database not found at: ${BLOGS_DB}`);
    process.exit(1);
  }

  const blogs = JSON.parse(fs.readFileSync(BLOGS_DB, 'utf8'));
  console.log(`Loaded ${blogs.length} blogs from ${BLOGS_DB}.`);

  let matchedBlogsCount = 0;
  let totalFaqsAttached = 0;
  const sampleUpdated = [];

  for (const blog of blogs) {
    const oldId = blog.legacy?.oldId;
    if (oldId && faqsByBlogId[oldId]) {
      const items = faqsByBlogId[oldId].map(item => ({
        question: item.question,
        answer: item.answer,
      }));

      blog.faqs = items;
      matchedBlogsCount++;
      totalFaqsAttached += items.length;

      if (sampleUpdated.length < 5) {
        sampleUpdated.push({
          slug: blog.slug,
          title: blog.title,
          oldId,
          faqCount: items.length,
          firstFaq: items[0],
        });
      }
    } else if (!blog.faqs) {
      blog.faqs = [];
    }
  }

  console.log('\n--- Restoration Summary ---');
  console.log(`Total blogs in database       : ${blogs.length}`);
  console.log(`Blogs updated with FAQs        : ${matchedBlogsCount}`);
  console.log(`Total FAQs restored            : ${totalFaqsAttached}`);
  console.log(`Average FAQs per blog          : ${(totalFaqsAttached / matchedBlogsCount).toFixed(1)}`);
  console.log('\nSample Restored Blogs:');
  console.log(JSON.stringify(sampleUpdated, null, 2));

  const report = {
    timestamp: new Date().toISOString(),
    sqlPath: SQL_PATH,
    rawFaqRows: rawRows.length,
    distinctSqlBlogIds: distinctBlogIdsInSql.length,
    blogsInDatabase: blogs.length,
    matchedBlogsCount,
    totalFaqsAttached,
    sampleUpdated,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote report to ${REPORT_FILE}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Skipping database write and S3 upload.');
    return;
  }

  // 1. Write local blogs_database.json
  fs.writeFileSync(BLOGS_DB, JSON.stringify(blogs, null, 2), 'utf8');
  console.log(`[SUCCESS] Updated ${BLOGS_DB}`);

  // 2. Upload to S3 if configured
  if (!noS3) {
    const envLocalPath = path.resolve(ROOT, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      if (typeof process.loadEnvFile === 'function') {
        try { process.loadEnvFile(envLocalPath); } catch {}
      } else {
        const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const k = trimmed.slice(0, eqIdx).trim();
            let v = trimmed.slice(eqIdx + 1).trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1);
            }
            if (process.env[k] === undefined) process.env[k] = v;
          }
        }
      }
    }

    const BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
    const REGION = process.env.S3_REGION || process.env.AWS_REGION || 'ap-south-1';
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
      try {
        console.log(`[S3] Uploading updated blogs_database.json to s3://${BUCKET}/database/blogs_database.json...`);
        const s3 = new S3Client({
          region: REGION,
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          },
        });
        const cmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: 'database/blogs_database.json',
          Body: JSON.stringify(blogs, null, 2),
          ContentType: 'application/json; charset=utf-8',
        });
        await s3.send(cmd);
        console.log(`[S3] Successfully uploaded to s3://${BUCKET}/database/blogs_database.json`);
      } catch (s3Err) {
        console.error(`[S3 Error] Failed to upload to S3:`, s3Err.message);
      }
    } else {
      console.log(`[S3] AWS credentials not found in env, skipping S3 upload.`);
    }
  }

  // 3. Regenerate lightweight index and individual blog files via server/sync-db.mjs
  console.log('\nRegenerating blog indexes and static JSON files...');
  const { execSync } = await import('node:child_process');
  execSync('node server/sync-db.mjs', { cwd: ROOT, stdio: 'inherit' });
  console.log('\n[DONE] Blog FAQ restoration and synchronization completed successfully.');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
