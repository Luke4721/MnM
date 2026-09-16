#!/usr/bin/env node
/**
 * migrate-blogs.mjs — Migrate blogs from the legacy MySQL dump (mnmtravels)
 * into the new site's blog collection (src/data/blogs_database.json).
 *
 * Usage:
 *   node scripts/migrate-blogs.mjs [--sql <path-to-dump.sql>] [--dry-run]
 *
 * What it does:
 *   1. Parses every `INSERT INTO \`tbl_blogs\` VALUES ...` statement in the
 *      dump with an escape-aware SQL tokenizer (handles \' \" \\ \n \r \t).
 *   2. Transforms each legacy row into the new blog schema (slug, seo,
 *      publishedAt, category names, readTime, etc.).
 *      - HTML-entity-encoded content is decoded to real HTML.
 *      - Slugs are generated from titles (SEO-friendly, deduplicated).
 *   3. Upserts into src/data/blogs_database.json keyed on legacy.oldId —
 *      idempotent: re-running replaces previously migrated rows, never
 *      duplicates them. Legacy placeholder entries (empty content) whose
 *      title matches a migrated blog are removed.
 *   4. Writes src/data/blog_categories.json (category_id 1 -> India,
 *      2 -> International).
 *   5. Logs progress and writes a report to scripts/migrate-blogs.report.json.
 *
 * Legacy tbl_blogs columns (positional, from the dump's CREATE TABLE):
 *   0 id, 1 heading, 2 url, 3 category_id, 4 status, 5 short_description,
 *   6 description, 7 title (meta), 8 meta_description, 9 meta_keywords,
 *   10 author, 11 date, 12 image, 13 image_name, 14 thumbnail,
 *   15 display_home, 16 datetime
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOGS_DB = path.join(ROOT, 'src/data/blogs_database.json');
const CATEGORIES_DB = path.join(ROOT, 'src/data/blog_categories.json');
const REPORT_FILE = path.join(__dirname, 'migrate-blogs.report.json');
const DEFAULT_SQL = 'C:\\Users\\Windows\\Downloads\\mnm_backup_complete.sql';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sqlArgIdx = args.indexOf('--sql');
const SQL_PATH = sqlArgIdx !== -1 && args[sqlArgIdx + 1] ? args[sqlArgIdx + 1] : DEFAULT_SQL;

// ---------------------------------------------------------------------------
// SQL parsing (escape-aware)
// ---------------------------------------------------------------------------

/**
 * Parse the VALUES payload of one INSERT statement into rows of fields.
 * Mirrors MySQL dump escaping rules inside single-quoted strings:
 *   \0 \b \n \r \t \Z \' \" \\  (anything else: the char itself)
 */
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

/** Extract every `INSERT INTO `tbl_blogs` VALUES ...;` payload from the dump. */
function extractBlogInserts(sqlText) {
  const rows = [];
  const re = /INSERT INTO `tbl_blogs` VALUES ([\s\S]*?);\r?\n/g;
  let m;
  while ((m = re.exec(sqlText)) !== null) {
    rows.push(...parseTuples(m[1]));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Transform helpers
// ---------------------------------------------------------------------------

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', copy: '©', reg: '®', trade: '™', deg: '°',
  eacute: 'é', esmall: 'ê', agrave: 'à', egrave: 'è', ugrave: 'ù', ccedil: 'ç',
};

/** Decode HTML entities. Rows in the legacy DB are inconsistently encoded —
 *  some store raw HTML, others entity-escaped HTML. Decoding is a no-op for
 *  the raw rows and fixes the escaped ones. */
function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const replacement = NAMED_ENTITIES[name.toLowerCase()];
      return replacement !== undefined ? replacement : match;
    });
}

/** URL-friendly slug from a title: diacritics folded, non-alphanumerics to
 *  hyphens, capped at 80 chars on a word boundary, lowercased. */
function slugify(title) {
  const base = String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics left by NFKD
    .replace(/[''']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  if (base.length <= 80) return base;
  const cut = base.slice(0, 80);
  const lastHyphen = cut.lastIndexOf('-');
  return (lastHyphen > 40 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/g, '');
}

const normalizeTitle = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '');

const stripHtml = (html) => decodeEntities(String(html))
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const readTimeFor = (html) => {
  const words = stripHtml(html).split(' ').filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const CATEGORY_MAP = { '1': 'India', '2': 'International' };
const STATUS_MAP = { '1': 'published', '0': 'draft' };

const sqlValue = (v) => (v === 'NULL' ? null : v);

/** Transform one legacy row into the new blog schema. `stableId` reuses the
 *  UUID of a previously migrated copy of the same legacy blog so re-runs
 *  don't churn ids. */
function transformBlog(row, slug, stableId) {
  const oldId = Number(row[0]);
  const heading = decodeEntities(sqlValue(row[1]) || '');
  const content = decodeEntities(sqlValue(row[6]) || '');
  const shortDescription = decodeEntities(sqlValue(row[5]) || '');
  const excerpt = (shortDescription || stripHtml(content).slice(0, 160)).trim();
  const publishedAt = (sqlValue(row[16]) || '').replace(' ', 'T');
  const oldImage = sqlValue(row[12]);

  return {
    // -- new schema ---------------------------------------------------------
    id: stableId || crypto.randomUUID(),
    title: heading,
    slug,
    content,
    excerpt,
    featuredImage: `https://picsum.photos/seed/mnm-blog-${oldId}/800/600`, // placeholder; replaced with stock images later
    category: CATEGORY_MAP[row[3]] || 'India',
    publishedAt,
    status: STATUS_MAP[row[4]] || 'draft',
    featured: row[15] === '1',
    author: sqlValue(row[10]) || 'MNM Team',
    imageAlt: sqlValue(row[13]) || heading,
    readTime: readTimeFor(content),
    date: sqlValue(row[11]) || '',
    seo: {
      title: decodeEntities(sqlValue(row[7]) || '') || heading,
      description: decodeEntities(sqlValue(row[8]) || '') || excerpt,
      keywords: decodeEntities(sqlValue(row[9]) || '') || '',
    },
    // -- legacy reference (for redirects / image replacement) ----------------
    legacy: {
      source: 'mnmtravels_sql',
      oldId,
      oldUrl: sqlValue(row[2]) || '',
      oldImage: oldImage || '',
      oldThumbnail: sqlValue(row[14]) || '',
    },
    // -- compat alias: current pages read `image` ----------------------------
    image: `https://picsum.photos/seed/mnm-blog-${oldId}/800/600`,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const startedAt = Date.now();
  console.log(`Legacy SQL dump : ${SQL_PATH}`);
  console.log(`Target database : ${BLOGS_DB}${dryRun ? ' (dry run — not written)' : ''}`);

  if (!fs.existsSync(SQL_PATH)) {
    console.error(`[FATAL] SQL dump not found: ${SQL_PATH}`);
    process.exit(1);
  }
  console.log('Reading SQL dump...');
  const sqlText = fs.readFileSync(SQL_PATH, 'utf-8');
  const legacyRows = extractBlogInserts(sqlText);
  console.log(`Parsed ${legacyRows.length} legacy blog rows from the dump.`);
  if (legacyRows.length === 0) {
    console.error('[FATAL] No tbl_blogs rows found — is this the right dump?');
    process.exit(1);
  }

  const errors = [];
  const seenOldIds = new Set();
  const migrated = [];
  const slugCounts = new Map();

  // Load the existing collection first so re-runs can keep stable ids.
  const existing = JSON.parse(fs.readFileSync(BLOGS_DB, 'utf-8'));
  const stableIdByOldId = new Map(
    existing
      .filter((b) => b.legacy?.source === 'mnmtravels_sql')
      .map((b) => [b.legacy.oldId, b.id])
  );

  legacyRows.forEach((row, idx) => {
    try {
      const oldId = Number(row[0]);
      if (!Number.isFinite(oldId)) throw new Error(`bad id: ${row[0]}`);
      if (seenOldIds.has(oldId)) throw new Error(`duplicate legacy id ${oldId} in dump`);
      seenOldIds.add(oldId);

      const title = decodeEntities(sqlValue(row[1]) || '');
      if (!title) throw new Error('empty heading');

      const base = slugify(title);
      let slug = base;
      let n = 2;
      while (slugCounts.has(slug)) slug = `${base}-${n++}`;
      slugCounts.set(slug, 1);

      migrated.push(transformBlog(row, slug, stableIdByOldId.get(oldId)));
      if ((idx + 1) % 50 === 0) console.log(`  transformed ${idx + 1}/${legacyRows.length}...`);
    } catch (err) {
      errors.push({ index: idx, heading: row[1], error: String(err.message) });
    }
  });

  // ----- merge with existing collection (idempotent upsert) ---------------
  const migratedTitles = new Set(migrated.map((b) => normalizeTitle(b.title)));
  const migratedOldIds = new Set(migrated.map((b) => b.legacy.oldId));

  const kept = [];
  let replacedMigrated = 0;
  let replacedPlaceholders = 0;
  for (const entry of existing) {
    const isPreviouslyMigrated = entry.legacy?.source === 'mnmtravels_sql'
      && migratedOldIds.has(entry.legacy.oldId);
    if (isPreviouslyMigrated) { replacedMigrated++; continue; } // re-migrate fresh
    const isMatchingPlaceholder = !entry.content
      && migratedTitles.has(normalizeTitle(entry.title));
    if (isMatchingPlaceholder) { replacedPlaceholders++; continue; } // real content supersedes
    kept.push(entry);
  }

  // Guard against slug collisions with kept entries.
  const takenSlugs = new Set(kept.map((b) => b.slug));
  for (const blog of migrated) {
    if (takenSlugs.has(blog.slug)) {
      const base = blog.slug;
      let n = 2;
      while (takenSlugs.has(`${base}-${n}`)) n++;
      blog.slug = `${base}-${n}`;
    }
    takenSlugs.add(blog.slug);
  }

  // Migrated (real, dated) first, newest first; legacy placeholders after.
  const finalBlogs = [
    ...migrated.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    ...kept,
  ];

  // ----- categories --------------------------------------------------------
  const categories = [
    { id: 1, name: 'India', slug: 'india' },
    { id: 2, name: 'International', slug: 'international' },
  ];

  // ----- report ------------------------------------------------------------
  const byCategory = migrated.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});
  const report = {
    ranAt: new Date().toISOString(),
    sqlPath: SQL_PATH,
    legacyRowsParsed: legacyRows.length,
    migratedCount: migrated.length,
    errors: errors.length,
    errorDetails: errors,
    existingBefore: existing.length,
    previouslyMigratedReplaced: replacedMigrated,
    placeholderEntriesReplaced: replacedPlaceholders,
    untouchedExistingEntries: kept.length,
    finalCollectionSize: finalBlogs.length,
    byCategory,
    featuredCount: migrated.filter((b) => b.featured).length,
    statusBreakdown: migrated.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {}),
    durationMs: Date.now() - startedAt,
  };

  console.log('--- Migration Summary ---');
  console.log(`Legacy rows parsed          : ${report.legacyRowsParsed}`);
  console.log(`Migrated                    : ${report.migratedCount}`);
  console.log(`Errors                      : ${report.errors}`);
  console.log(`By category                 : ${JSON.stringify(byCategory)}`);
  console.log(`Featured (display_home=1)   : ${report.featuredCount}`);
  console.log(`Re-run replacements         : ${replacedMigrated}`);
  console.log(`Placeholder entries removed : ${replacedPlaceholders}`);
  console.log(`Untouched existing entries  : ${kept.length}`);
  console.log(`Final collection size       : ${report.finalCollectionSize}`);
  if (errors.length) {
    console.log('Row errors:');
    errors.forEach((e) => console.log(`  [row ${e.index}] ${e.heading}: ${e.error}`));
  }

  if (dryRun) {
    console.log('Dry run — nothing written.');
  } else {
    fs.writeFileSync(BLOGS_DB, JSON.stringify(finalBlogs, null, 2) + '\n', 'utf-8');
    fs.writeFileSync(CATEGORIES_DB, JSON.stringify(categories, null, 2) + '\n', 'utf-8');
    console.log(`Wrote ${finalBlogs.length} blogs -> ${path.relative(ROOT, BLOGS_DB)}`);
    console.log(`Wrote ${categories.length} categories -> ${path.relative(ROOT, CATEGORIES_DB)}`);
  }
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + '\n', 'utf-8');
  console.log(`Report -> ${path.relative(ROOT, REPORT_FILE)}`);
  console.log(`Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);

  if (errors.length > 0) process.exitCode = 2;
}

main();
