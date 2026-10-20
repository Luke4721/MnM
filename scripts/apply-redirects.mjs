import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BLOGS_DB = path.join(ROOT, 'src/data/blogs_database.json');
const VERCEL_JSON = path.join(ROOT, 'vercel.json');

const blogs = JSON.parse(fs.readFileSync(BLOGS_DB, 'utf8'));
const vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));

const redirects = [];
const seenSources = new Set();
const seenDestinations = new Map();

// 1. Specific blog redirects for all changed posts (legacy.oldUrl -> slug)
for (const b of blogs) {
  if (!b.legacy || !b.legacy.oldUrl) continue;
  const oldSlug = b.legacy.oldUrl.trim();
  const currentSlug = b.slug.trim();

  if (oldSlug === currentSlug) continue; // Unchanged slug

  const source = `/blog/${oldSlug}`;
  const destination = `/blog/${currentSlug}`;

  if (seenSources.has(source)) {
    console.error(`FATAL: Duplicate redirect source: ${source}`);
    process.exit(1);
  }
  seenSources.add(source);

  if (seenDestinations.has(destination)) {
    seenDestinations.get(destination).push(source);
  } else {
    seenDestinations.set(destination, [source]);
  }

  redirects.push({
    source,
    destination,
    permanent: true,
  });
}

// 2. Legacy package / section redirects
const legacySectionRedirects = [
  { source: '/india-holiday-packages/:path*', destination: '/packages', permanent: true },
  { source: '/india-holidays/:path*', destination: '/packages', permanent: true },
  { source: '/kailash-mansarovar', destination: '/packages', permanent: true },
  { source: '/kailash-mansarovar/:path*', destination: '/packages', permanent: true },
  { source: '/blog/detail/:slug', destination: '/blog/:slug', permanent: true },
];

for (const r of legacySectionRedirects) {
  if (!seenSources.has(r.source)) {
    seenSources.add(r.source);
    redirects.push(r);
  }
}

// Check for redirect chains
const allSources = new Set(redirects.map(r => r.source));
const chains = redirects.filter(r => allSources.has(r.destination));
if (chains.length > 0) {
  console.error('FATAL: Found redirect chains:', chains);
  process.exit(1);
}

// Check for collisions (multiple old URLs mapping to same current slug)
const collisions = [...seenDestinations.entries()].filter(([dest, sources]) => sources.length > 1);
if (collisions.length > 0) {
  console.warn('NOTICE: Multiple legacy URLs map to same current slug:', collisions);
} else {
  console.log('Zero collisions found across all legacy blog slugs.');
}

// Put redirects into vercelConfig at the top
const newVercelConfig = {
  redirects,
  headers: vercelConfig.headers || [],
  functions: vercelConfig.functions || {},
  rewrites: vercelConfig.rewrites || [],
};

fs.writeFileSync(VERCEL_JSON, JSON.stringify(newVercelConfig, null, 2) + '\n', 'utf8');
console.log(`Successfully wrote ${redirects.length} redirects to vercel.json (${redirects.length - legacySectionRedirects.length} blog-specific + ${legacySectionRedirects.length} section wildcards).`);
