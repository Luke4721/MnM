#!/usr/bin/env node
/**
 * generate-blog-sitemap.mjs — Generate an XML sitemap for the blog:
 * the /blog listing plus one URL per published blog (600 entries).
 *
 * Usage:
 *   node scripts/generate-blog-sitemap.mjs [--site https://www.example.com]
 *
 * The site URL comes from --site, then the SITE_URL / VITE_SITE_URL env
 * vars, defaulting to https://www.mnmtravels.com (the canonical origin —
 * the bare domain redirects to www). Output:
 *   public/sitemap-blogs.xml
 *
 * Reference it from robots.txt:
 *   Sitemap: https://<your-domain>/sitemap-blogs.xml
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOGS_DB = path.join(ROOT, 'src/data/blogs_database.json');
const OUT_FILE = path.join(ROOT, 'public', 'sitemap-blogs.xml');

const args = process.argv.slice(2);
const siteIdx = args.indexOf('--site');
const site = (
  siteIdx !== -1 && args[siteIdx + 1] ? args[siteIdx + 1]
    : process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.mnmtravels.com'
).replace(/\/$/, '');

const blogs = JSON.parse(fs.readFileSync(BLOGS_DB, 'utf-8'));
const published = blogs
  .filter((b) => b.status === 'published' && b.slug)
  .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

const entries = [
  { loc: `${site}/blog`, changefreq: 'daily', priority: '0.9' },
  ...published.map((b) => ({
    loc: `${site}/blog/${b.slug}`,
    lastmod: (b.publishedAt || '').split('T')[0] || undefined,
    changefreq: 'monthly',
    priority: '0.7',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ''}    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(OUT_FILE, xml, 'utf-8');
console.log(`Wrote ${entries.length} URLs (${published.length} blog posts) -> ${path.relative(ROOT, OUT_FILE)}`);
console.log(`Site URL: ${site}`);
console.log('Add to robots.txt:  Sitemap: ' + site + '/sitemap-blogs.xml');
