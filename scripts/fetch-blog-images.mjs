#!/usr/bin/env node
/**
 * fetch-blog-images.mjs — Fetch relevant stock images for the migrated blogs
 * and upload them directly to S3 (nothing is written to /public).
 *
 * Usage:
 *   node scripts/fetch-blog-images.mjs [flags]
 *
 * Flags:
 *   --preview            Show the top 3 scored image choices per blog before
 *                        downloading; approve/reject interactively (when run
 *                        in a terminal) or print-only (when piped/CI).
 *   --dry-run            Search and score, but upload nothing and write no
 *                        files (progress/audit are not persisted).
 *   --force-replace      Re-fetch every blog, overwriting existing images
 *                        (alias: --force).
 *   --retry-failed       Re-process blogs recorded in failed-blogs.json.
 *   --only <substring>   Only process blogs whose slug contains substring.
 *   --limit N            Process at most N blogs.
 *   --extract-only       Print the query ladder per blog and exit (offline).
 *
 * How relevance works (v2 — the first version accepted any search result,
 * which produced bears for Reiek and kebabs for Assam):
 *   1. Query ladder built from the blog title's primary phrase (destination
 *      name before the first : , | or dash), enriched with a region (Indian
 *      states / world regions found in the corpus) and attraction type words
 *      (beach, temple, trek, plantation, ...) from title + SEO keywords +
 *      first 400 chars of content.
 *        "North Bay Island - The Adventure Capital..." ->
 *          ["north bay island andaman beach", "north bay island andaman",
 *           "north bay island", "andaman beach", "andaman tourism"]
 *   2. Every returned image is scored against the query: context terms
 *      (region + types) must match, primary terms add a bonus.
 *   3. Images containing animals/food/object words that are NOT part of the
 *      blog's own vocabulary are hard-rejected (a tiger image is fine for
 *      Ranthambore, not for Reiek).
 *   4. Minimum score defaults to 0.8 (IMAGE_RELEVANCE_MIN).
 *   5. Manual overrides: scripts/image-search-overrides.json
 *        { "blog-slug": "custom query", "other-slug": ["q1", "q2"] }
 *      Override queries bypass the relevance threshold — you asked for them.
 *   6. Audit trail: scripts/image-audit.json records the query, source,
 *      photo id, score and matched terms for every chosen image.
 *
 * Resume: scripts/image-progress.json (slug -> url) is saved after every
 * batch of 20; re-running skips completed blogs unless --force-replace.
 *
 * Environment (real env wins, then .env.local, then .env):
 *   AWS credentials via the standard SDK chain, plus
 *   S3_BUCKET, AWS_REGION, AWS_CLOUDFRONT_DOMAIN (optional),
 *   UNSPLASH_ACCESS_KEY, PEXELS_API_KEY,
 *   IMAGE_FETCH_DELAY_MS (default 1000), IMAGE_RELEVANCE_MIN (default 0.8).
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOGS_DB = path.join(ROOT, 'src/data/blogs_database.json');
const PROGRESS_FILE = path.join(__dirname, 'image-progress.json');
const FAILED_FILE = path.join(__dirname, 'failed-blogs.json');
const AUDIT_FILE = path.join(__dirname, 'image-audit.json');
const USED_IDS_FILE = path.join(__dirname, 'image-used-ids.json');
const OVERRIDES_FILE = path.join(__dirname, 'image-search-overrides.json');
const DEFAULT_OVERRIDES = '{}';

const BATCH_SIZE = 20;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 630;
const TOP_CANDIDATES = 3;
const MAX_PAGES = 3; // search result pages tried when page 1 is all duplicates
const VARIETY_TERMS = ['aerial', 'landscape', 'scenic']; // query modifiers for dupe escape
// When Pixabay's CDN throttle trips, the provider is benched for this long
// before being retried (the throttle state decays with quiet time).
const PIXABAY_BLOCK_MS = 10 * 60_000;
let pixabayBlockedUntil = 0;

// ---------------------------------------------------------------------------
// .env loading (no dotenv dependency)
// ---------------------------------------------------------------------------
for (const file of ['.env.local', '.env']) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : undefined;
};

const dryRun = flag('--dry-run');
const preview = flag('--preview');
const force = flag('--force-replace') || flag('--force');
const dedupe = flag('--dedupe');
const retryFailed = flag('--retry-failed');
const extractOnly = flag('--extract-only');
const onlyFilter = opt('--only');
const LIMIT = Number(opt('--limit') || Infinity);

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || '';
const PIXABAY_KEY = process.env.PIXABAY_API_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || '';
const CLOUDFRONT = (process.env.AWS_CLOUDFRONT_DOMAIN || '')
  .replace(/^https?:\/\//, '').replace(/\/$/, '');
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
const DELAY_MS = Number(process.env.IMAGE_FETCH_DELAY_MS || 1000);
// Pixabay allows ~5,000 requests/hour, so it paces much faster than the rest.
const PIXABAY_DELAY_MS = Number(process.env.IMAGE_PIXABAY_DELAY_MS || 200);
// Pause after each image download to stay polite to the stock CDNs (the
// earlier 429s turned out to be Pixabay's hotlink protection, fixed via the
// Referer header; this just keeps request pressure low).
const DOWNLOAD_DELAY_MS = Number(process.env.IMAGE_DOWNLOAD_DELAY_MS || 1000);
const RELEVANCE_MIN = Number(process.env.IMAGE_RELEVANCE_MIN || 0.8);
const RATE_LIMIT_WAIT_MS = Number(process.env.IMAGE_RATELIMIT_WAIT_MS || 61000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Vocabulary for keyword extraction
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
  'near', 'from', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'this',
  'that', 'these', 'those', 'it', 'its', 'as', 'your', 'you', 'how', 'reach',
  'what', 'why', 'when', 'where', 'which', 'all', 'about', 'more', 'than',
  'into', 'amid', 'amidst', 'complete', 'ultimate', 'essential', 'famous',
  'most', 'beautiful', 'popular', 'top', 'best', 'guide', 'guides', 'tourism',
  'tourist', 'tour', 'tours', 'travel', 'trips', 'trip', 'visit', 'visiting',
  'visitor', 'explore', 'exploring', 'exploration', 'place', 'places', 'thing',
  'things', 'do', 'does', 'tips', 'tip', 'destinations', 'destination',
  'history', 'historic', 'historical', 'heritage', 'journey', 'experience',
  'experiences', 'world', 's', 'india', 'indian', 'capital', 'jewel', 'hidden',
  'gem', 'wonder', 'wonderland', 'paradise', 'heaven', 'must',
]);

// Multi-word regions are matched first so "sri lanka" wins over "lanka".
// NOTE: specific villages/attractions (e.g. Reiek) deliberately NOT here —
// they belong to the primary phrase; regions provide the broader context.
const REGIONS = [
  'sri lanka', 'new zealand', 'andaman', 'nicobar', 'port blair', 'havelock',
  'mizoram', 'aizawl', 'assam', 'meghalaya', 'shillong', 'manipur',
  'nagaland', 'tripura', 'arunachal pradesh', 'arunachal', 'sikkim',
  'gangtok', 'west bengal', 'kolkata', 'darjeeling', 'odisha', 'orissa',
  'bhubaneswar', 'puri', 'bihar', 'jharkhand', 'chhattisgarh',
  'madhya pradesh', 'madhya', 'uttar pradesh', 'uttar', 'agra', 'varanasi',
  'lucknow', 'delhi', 'new delhi', 'punjab', 'amritsar', 'haryana',
  'himachal pradesh', 'himachal', 'manali', 'shimla', 'kashmir', 'srinagar',
  'ladakh', 'leh', 'uttarakhand', 'rishikesh', 'haridwar', 'nainital',
  'mussoorie', 'dehradun', 'rajasthan', 'jaipur', 'udaipur', 'jodhpur',
  'jaisalmer', 'pushkar', 'bikaner', 'mount abu', 'gujarat', 'ahmedabad',
  'dwarka', 'somnath', 'maharashtra', 'mumbai', 'pune', 'nashik', 'goa',
  'karnataka', 'bangalore', 'bengaluru', 'mysore', 'mysuru', 'hampi',
  'coorg', 'hyderabad', 'telangana', 'andhra pradesh', 'andhra',
  'vishakhapatnam', 'tamil nadu', 'tamil', 'chennai', 'madurai',
  'rameswaram', 'kanyakumari', 'ooty', 'kodaikanal', 'kerala', 'kochi',
  'alleppey', 'alappuzha', 'munnar', 'wayanad', 'thiruvananthapuram',
  'trivandrum', 'kovalam', 'varkala', 'pondicherry', 'kumarakom', 'thekkady',
  'nepal', 'bhutan', 'tibet', 'maldives', 'mauritius', 'seychelles', 'dubai',
  'abu dhabi', 'singapore', 'malaysia', 'thailand', 'bangkok', 'vietnam',
  'cambodia', 'indonesia', 'bali', 'japan', 'tokyo', 'south korea', 'china',
  'hong kong', 'macau', 'switzerland', 'france', 'paris', 'italy', 'rome',
  'venice', 'spain', 'barcelona', 'germany', 'netherlands', 'amsterdam',
  'greece', 'santorini', 'turkey', 'cappadocia', 'egypt', 'morocco',
  'australia', 'usa', 'russia', 'london', 'scotland', 'africa', 'europe',
  'asia',
];

// Regions grouped for the broadest (but still relevant) fallback query.
const REGION_GROUPS = {
  mizoram: 'northeast india', 'arunachal pradesh': 'northeast india',
  arunachal: 'northeast india', manipur: 'northeast india',
  meghalaya: 'northeast india', nagaland: 'northeast india',
  tripura: 'northeast india', assam: 'northeast india', sikkim: 'northeast india',
  andaman: 'andaman islands', nicobar: 'andaman islands', havelock: 'andaman islands',
  'port blair': 'andaman islands',
};

const ATTRACTION_TYPES = [
  'beach', 'island', 'fort', 'palace', 'temple', 'church', 'monastery',
  'mosque', 'tomb', 'museum', 'market', 'bazaar', 'lake', 'waterfall',
  'garden', 'plantation', 'park', 'national park', 'wildlife', 'sanctuary',
  'safari', 'trekking', 'mountain', 'hill', 'valley', 'desert', 'dunes',
  'backwater', 'backwaters', 'houseboat', 'glacier', 'peak', 'cave', 'bridge',
  'dam', 'ruins', 'monument', 'statue', 'zoo', 'theme park', 'amusement park',
  'rafting', 'camping', 'scuba', 'snorkeling', 'kayaking', 'birdwatching',
  'adventure',
];

// Hard-reject vocabulary. An image whose text contains one of these words is
// rejected UNLESS the word (or the blog's own corpus) also mentions it — a
// tiger photo is exactly right for a Ranthambore tiger-safari blog.
const ANIMAL_WORDS = [
  'bear', 'dog', 'puppy', 'cat', 'kitten', 'lion', 'tiger', 'leopard',
  'elephant', 'monkey', 'deer', 'zebra', 'giraffe', 'wolf', 'fox', 'horse',
  'cow', 'bull', 'snake', 'crocodile', 'fish', 'dolphin', 'whale', 'turtle',
  'peacock', 'squirrel', 'rabbit', 'panda', 'kangaroo', 'camel', 'goat',
  'sheep', 'pig', 'hamster', 'owl', 'eagle', 'parrot', 'sparrow', 'crow',
];
const FOOD_WORDS = [
  'kebab', 'kabab', 'burger', 'pizza', 'sandwich', 'dessert', 'cake', 'pastry',
  'bread', 'curry', 'biryani', 'samososa', 'samosa', 'paratha', 'breakfast',
  'brunch', 'lunch', 'dinner', 'snack', 'cuisine', 'dish', 'meal', 'recipe',
  'restaurant', 'cafe', 'coffee cup', 'cocktail', 'wine glass', 'beer',
];
const OBJECT_WORDS = [
  'clock', 'wristwatch', 'laptop', 'keyboard', 'smartphone', 'cellphone',
  'headphones', 'book stack', 'stationery', 'pen', 'furniture', 'sofa',
  'chair', 'cutlery', 'plates', 'shoes', 'sneakers', 'makeup', 'jewellery',
  'jewelry',
];
const NEGATIVE_WORDS = [...ANIMAL_WORDS, ...FOOD_WORDS, ...OBJECT_WORDS];

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
const stripHtml = (html) => String(html)
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z#0-9]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** Very light stemmer: "hills"->"hill". Only trailing plural "s" is folded. */
const stem = (w) => (w.length > 3 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w);

const words = (text) => (String(text).toLowerCase().match(/[a-z]{3,}/g) || []);

// Synonym groups folded to a canonical form before comparison, so an image
// described as "green hills of Mizoram" matches a "mountain" query term.
const SYNONYM_GROUPS = [
  ['mountain', 'hill', 'mount', 'peak'],
  ['trekking', 'trek', 'hike', 'hiking', 'trail'],
  ['beach', 'seaside', 'shore', 'coast', 'coastline'],
  ['island', 'isle'],
  ['fort', 'fortress'],
  ['temple', 'shrine', 'mandir'],
  ['church', 'cathedral', 'basilica'],
  ['market', 'bazaar'],
  ['wildlife', 'jungle', 'forest', 'wilderness'],
  ['lake', 'lakeside'],
];
const CANON = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const w of group) CANON.set(w, group[0]);
}
const canon = (w) => CANON.get(stem(w)) || stem(w);

/** Canonical word set of a text — used for term matching. */
const textCanonSet = (text) => new Set(words(text).map(canon));

/**
 * Term matching with word boundaries and synonym folding. Fixes two classes
 * of bug: substring matches ("dam" inside "andaman") and vocabulary misses
 * ("hills" vs "mountain"). Multi-word terms match as raw phrases.
 */
function makeMatcher(text) {
  const lower = ` ${String(text).toLowerCase()} `;
  const set = textCanonSet(text);
  return {
    has: (term) => {
      const t = String(term).toLowerCase();
      if (t.includes(' ')) return lower.includes(` ${t} `) || lower.includes(`${t} `);
      return set.has(canon(t));
    },
  };
}

// ---------------------------------------------------------------------------
// Keyword extraction (v2)
// ---------------------------------------------------------------------------
/**
 * Build the search plan for a blog:
 *   primaryTerms — the destination/subject: significant words from the title's
 *                  first clause (before : , | — - ( ) )
 *   region       — a state/region mentioned in title, SEO keywords, or first
 *                  400 chars of content
 *   types        — attraction-type words from the same corpus
 *   subjectTerms — animal words the blog itself mentions (a tiger-safari blog
 *                  should match tiger photos)
 *   queries      — the fallback ladder, most specific first, e.g.
 *                  ["north bay island andaman beach", "north bay island
 *                   andaman", "north bay island", "andaman beach",
 *                   "andaman tourism", "andaman islands travel"]
 */
export function extractSearchPlan(blog) {
  const title = stripHtml(blog.title);
  const seoKeywords = stripHtml(blog.seo?.keywords || '');
  const contentHead = stripHtml(blog.content).slice(0, 400);
  const corpus = `${title} ${seoKeywords} ${contentHead}`;
  const corpusMatcher = makeMatcher(corpus);

  // Primary phrase: first clause of the title, before any separator.
  const firstClause = title.split(/:|\||—|–|,|\(| - /)[0] || title;
  const primaryTerms = [...new Set(words(firstClause).filter((w) => !STOPWORDS.has(w)))].slice(0, 5);

  // Region: prefer a mention in the title itself, then anywhere in the corpus.
  let region = null;
  for (const r of REGIONS) {
    if (title.toLowerCase().includes(r)) { region = r; break; }
  }
  if (!region) {
    for (const r of REGIONS) {
      if (corpusMatcher.has(r)) { region = r; break; }
    }
  }

  // Attraction types present in the corpus (word-boundary matched). Types
  // overlapping the primary phrase are kept — the per-query word dedup
  // already avoids "assam tea gardens garden" — because they matter as
  // context for scoring and for type-based fallback queries.
  const types = [];
  for (const t of ATTRACTION_TYPES) {
    if (corpusMatcher.has(t) && !types.some((x) => canon(x) === canon(t))) {
      types.push(t);
    }
    if (types.length >= 3) break;
  }

  // Animal subjects the blog is actually about (Ranthambore -> tiger).
  const subjectTerms = ANIMAL_WORDS.filter((a) => corpusMatcher.has(a)).slice(0, 2);

  const contextTerms = [region, ...types, ...subjectTerms].filter(Boolean);

  // Build the query ladder, deduplicating words within each query. Queries in
  // `lastResort` accept a relaxed relevance bar: they are type-only ("park
  // india") escapes for obscure places whose names return nothing, where an
  // on-topic image beats the default placeholder.
  const queries = [];
  const lastResort = new Set();
  const push = (...parts) => {
    const seen = new Set();
    const clean = parts.join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w && !seen.has(w) && seen.add(w))
      .join(' ')
      .trim();
    if (clean && !queries.includes(clean)) queries.push(clean);
    return clean;
  };

  if (region) {
    push(primaryTerms.join(' '), region, types.slice(0, 2).join(' '));
    push(primaryTerms.join(' '), region);
  } else if (types.length) {
    push(primaryTerms.join(' '), types.slice(0, 2).join(' '));
  }
  push(primaryTerms.join(' '), subjectTerms.join(' '));
  if (region) {
    push(region, types.slice(0, 2).join(' '));
    push(region, 'tourism');
    const group = REGION_GROUPS[region];
    if (group) push(group, 'travel');
  }
  if (types.length) {
    lastResort.add(push(types.slice(0, 2).join(' '), 'india'));
    lastResort.add(push(types[0], 'india'));
    lastResort.add(push(types[0]));
  }

  return { primaryTerms, region, types, subjectTerms, contextTerms, queries, lastResort, corpus };
}

/** Merge manual overrides into a plan. Override queries come first and are
 *  trusted (relevance threshold is waived for them). */
function applyOverrides(plan, blog, overrides) {
  const override = overrides[blog.slug];
  if (!override) return { ...plan, overrideUsed: null };
  const overrideQueries = (Array.isArray(override) ? override : [override])
    .map((q) => String(q).trim().toLowerCase())
    .filter(Boolean);
  return {
    ...plan,
    queries: [...overrideQueries, ...plan.queries.filter((q) => !overrideQueries.includes(q))],
    overrideUsed: overrideQueries[0],
  };
}

// ---------------------------------------------------------------------------
// Stock photo search (landscape, >= 1200x630) with descriptive text
// ---------------------------------------------------------------------------
class RateLimitError extends Error {
  constructor(api) {
    super(`rate limited by ${api} (HTTP 429)`);
    this.name = 'RateLimitError';
  }
}

async function fetchJson(url, headers, api) {
  const res = await fetch(url, { headers });
  if (res.status === 429) throw new RateLimitError(api);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

let rateLimitStrikes = 0;

/**
 * Call a stock API with rate-limit self-pacing: on HTTP 429 wait (growing
 * up to 5 minutes, since these APIs reset hourly) and retry. A long
 * migration simply slows down instead of failing blogs.
 */
async function callEngine(engine, query, page) {
  try {
    const result = await engine(query, page);
    rateLimitStrikes = 0;
    return result;
  } catch (err) {
    if (err instanceof RateLimitError) {
      rateLimitStrikes++;
      const wait = Math.min(300_000, RATE_LIMIT_WAIT_MS * rateLimitStrikes);
      console.warn(`    [rate-limit] ${err.message} — waiting ${Math.round(wait / 1000)}s before retrying...`);
      await sleep(wait);
      return callEngine(engine, query, page);
    }
    throw err;
  }
}

async function searchUnsplash(query, page = 1) {
  const data = await fetchJson(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}`
    + `&orientation=landscape&per_page=30&content_filter=high&page=${page}`,
    { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    'Unsplash',
  );
  return (data.results || [])
    .filter((p) => p.width >= MIN_WIDTH && p.height >= MIN_HEIGHT && p.width > p.height)
    .map((p) => ({
      id: p.id,
      width: p.width,
      height: p.height,
      downloadUrl: `${p.urls.raw}&w=1600&q=80&fm=jpg&fit=max`,
      source: 'unsplash',
      text: [p.alt_description, p.description,
        (p.links?.html || '').split('/photos/')[1] || ''].join(' ').toLowerCase(),
    }));
}

async function searchPexels(query, page = 1) {
  const data = await fetchJson(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}`
    + `&orientation=landscape&size=large&per_page=30&page=${page}`,
    { Authorization: PEXELS_KEY },
    'Pexels',
  );
  return (data.photos || [])
    .filter((p) => p.width >= MIN_WIDTH && p.height >= MIN_HEIGHT && p.width > p.height)
    .map((p) => ({
      id: String(p.id),
      width: p.width,
      height: p.height,
      downloadUrl: p.src.large2x || p.src.large,
      source: 'pexels',
      text: (p.alt || '').toLowerCase(),
    }));
}

// Primary provider: ~5,000 requests/hour means it is queried first and paced
// at PIXABAY_DELAY_MS instead of the conservative 1s used for the others.
async function searchPixabay(query, page = 1) {
  const data = await fetchJson(
    `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}`
    + `&image_type=photo&orientation=horizontal&per_page=30&page=${page}`,
    {},
    'Pixabay',
  );
  return (data.hits || [])
    .filter((p) => p.imageWidth >= MIN_WIDTH && p.imageHeight >= MIN_HEIGHT
      && p.imageWidth > p.imageHeight)
    .map((p) => ({
      id: String(p.id),
      width: p.imageWidth,
      height: p.imageHeight,
      downloadUrl: p.largeImageURL,
      source: 'pixabay',
      // tags ("aizawl, mizoram, hills") + the descriptive page-URL slug
      text: `${p.tags || ''} ${(p.pageURL || '').split('/photos/')[1] || ''}`
        .toLowerCase().replace(/[-_,]+/g, ' '),
    }));
}

// ---------------------------------------------------------------------------
// Relevance scoring
// ---------------------------------------------------------------------------
/**
 * Score a candidate image against the blog's search plan.
 *
 * placeMatch — 1.0  every primary (destination) term matches the image text
 *              0.9  some primary term matches
 *              0.75 the region matches
 *              0    neither
 * matchedContext — how many context terms (region, attraction types, subject
 *              animals) the image text contains.
 *
 * score    — an image passes the 0.8 threshold when it is anchored to the
 *            blog's place (region or destination) AND matches at least one
 *            context term. The destination phrase matching everything scores
 *            a perfect 1.0. Anything else lands below 0.8: e.g. a random
 *            beach photo for a Delhi fort blog matches no context (0.0), a
 *            same-country-but-wrong-region photo with no shared vocabulary
 *            stays well under threshold.
 */
export function scoreCandidate(candidate, plan) {
  const text = candidate.text || '';
  const matcher = makeMatcher(text);
  const queryTerms = [...plan.primaryTerms, ...plan.contextTerms];

  // Hard reject: animal/food/object vocabulary the blog never uses itself.
  if (text) {
    const corpusMatcher = makeMatcher(plan.corpus);
    for (const bad of NEGATIVE_WORDS) {
      if (matcher.has(bad) && !queryTerms.includes(bad) && !corpusMatcher.has(bad)) {
        return { score: 0, matched: [], hardReject: bad };
      }
    }
  }

  const matchedPrimary = plan.primaryTerms.filter((t) => matcher.has(t));
  const matchedContext = plan.contextTerms.filter((t) => matcher.has(t));
  const matchedSubject = plan.subjectTerms.filter((t) => matcher.has(t));

  const regionMatched = plan.region ? matcher.has(plan.region) : false;
  const placeMatch = Math.max(
    plan.primaryTerms.length && matchedPrimary.length === plan.primaryTerms.length
      ? 1
      : matchedPrimary.length ? 0.9 : 0,
    regionMatched ? 0.75 : 0,
    // A subject the blog is explicitly about (tiger for a tiger reserve)
    // anchors the image even when the place itself is not named.
    matchedSubject.length ? 0.75 : 0,
  );

  let score;
  if (placeMatch === 1 && plan.contextTerms.length === 0) {
    score = 1; // destination-named image, no context to cross-check
  } else if (placeMatch >= 0.75 && matchedContext.length >= 1) {
    score = 0.8 + (placeMatch === 1 ? 0.2 : 0);
  } else if (placeMatch === 1) {
    score = 0.6; // right name, wrong kind of imagery — keep looking
  } else {
    score = placeMatch * 0.5
      + (plan.contextTerms.length ? matchedContext.length / plan.contextTerms.length : 0) * 0.3;
  }

  return {
    score,
    matched: [...matchedPrimary, ...matchedContext],
    hardReject: null,
  };
}

// ---------------------------------------------------------------------------
// S3
// ---------------------------------------------------------------------------
const objectKeyFor = (blog) => `blog-images/${blog.slug}.jpg`;
const publicUrlFor = (key) => CLOUDFRONT
  ? `https://${CLOUDFRONT}/${key}`
  : `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

async function uploadToS3(key, body) {
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return publicUrlFor(key);
}

async function s3ObjectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false;
    throw err;
  }
}

const DEFAULT_KEY = process.env.DEFAULT_IMAGE_KEY || 'blog-images/default-travel.jpg';
const DEFAULT_UNSPLASH_RAW =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80&fm=jpg&fit=max';

async function downloadImage(url, attempt = 0) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MNMImageMigration/1.0',
      // Pixabay's CDN hotlink-protects image URLs: without a pixabay.com
      // Referer every download is rejected with HTTP 429 (retry-after: 0).
      Referer: 'https://pixabay.com/',
    },
  });
  // Pixabay throttles downloads to ~1 per 20s once its token bucket is
  // drained, and long waits do not help mid-migration. Instead: flag the
  // provider as blocked so subsequent searches fall through to Pexels, with
  // one short retry (the bucket refills ~every 20s) to sneak through.
  if (res.status === 429) {
    if (/pixabay/i.test(url)) {
      pixabayBlockedUntil = Math.max(pixabayBlockedUntil, Date.now() + PIXABAY_BLOCK_MS);
      console.warn(`    [throttle] Pixabay downloads limited — other providers take over for ${PIXABAY_BLOCK_MS / 60000} min`);
      if (attempt === 0) {
        await sleep(25_000);
        return downloadImage(url, attempt + 1);
      }
      throw new Error('download HTTP 429 (Pixabay throttled)');
    }
    const wait = Math.min(300_000, RATE_LIMIT_WAIT_MS * (attempt + 1));
    console.warn(`    [rate-limit] image download 429 — waiting ${Math.round(wait / 1000)}s...`);
    await sleep(wait);
    return downloadImage(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 20_000) throw new Error(`suspiciously small file (${buffer.length} bytes)`);
  // Keep the whole pipeline inside Pixabay's per-minute budget: one search +
  // one download per blog at this pace stays just under ~100 req/60s.
  await sleep(DOWNLOAD_DELAY_MS);
  return buffer;
}

async function ensureDefaultImage() {
  try {
    if (await s3ObjectExists(DEFAULT_KEY)) return publicUrlFor(DEFAULT_KEY);
    console.log('Uploading default placeholder image...');
    const url = await uploadToS3(DEFAULT_KEY, await downloadImage(DEFAULT_UNSPLASH_RAW));
    console.log(`Default placeholder ready: ${url}`);
    return url;
  } catch (err) {
    console.warn(`[warn] could not ensure default image: ${err.message}`);
    return publicUrlFor(DEFAULT_KEY);
  }
}

// ---------------------------------------------------------------------------
// Progress / failure / audit files
// ---------------------------------------------------------------------------
const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
};
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8');

let s3 = null; // initialized in main (null in dry-run / extract-only modes)

// ---------------------------------------------------------------------------
// Search + rank per blog
// ---------------------------------------------------------------------------
/**
 * Walk the query ladder until a query returns FRESH candidates that pass the
 * relevance threshold and are not already used by another blog.
 *
 * Duplicate handling:
 *   - Candidates whose `source:id` is in `usedIds` are skipped and counted.
 *   - If a page has passing candidates but all are duplicates, the next
 *     result page is tried (up to MAX_PAGES).
 *   - If the whole ladder only yields duplicates, variety variants are
 *     appended ("... aerial", "... landscape", "... scenic") so same-region
 *     blogs end up with different photos.
 */
async function searchAndRank(blog, plan, usedIds) {
  // Priority order: Pixabay first (fast limits), then Unsplash, then Pexels.
  // A throttled Pixabay is benched until pixabayBlockedUntil.
  const engines = [];
  if (PIXABAY_KEY && Date.now() >= pixabayBlockedUntil) engines.push(searchPixabay);
  if (UNSPLASH_KEY) engines.push(searchUnsplash);
  if (PEXELS_KEY) engines.push(searchPexels);

  let dupesSkipped = 0;
  const rejected = [];
  const queries = [...plan.queries];
  let variantsAdded = false;

  for (let qi = 0; qi < queries.length; qi++) {
    const query = queries[qi];
    for (const engine of engines) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        let found = [];
        try {
          found = await callEngine(engine, query, page);
        } catch (err) {
          console.warn(`    [warn] search failed (${engine.name} "${query}" p${page}): ${err.message}`);
          break; // engine error -> try the next engine
        }
        // Pixabay's generous limit paces at 0.2s; the others at 1s.
        await sleep(engine === searchPixabay ? PIXABAY_DELAY_MS : DELAY_MS);

        const scored = found
          .map((c) => ({ ...c, ...scoreCandidate(c, plan) }))
          .filter((c) => !c.hardReject);
        // Last-resort type-only queries ("park india") accept any positively
        // matched image (score > 0.05): on-topic beats the placeholder.
        const minScore = plan.lastResort?.has(query) ? 0.05 : RELEVANCE_MIN;
        const passing = scored
          .filter((c) => c.score >= minScore || plan.overrideUsed)
          .sort((a, b) => b.score - a.score
            || (b.text ? 1 : 0) - (a.text ? 1 : 0)
            || b.width - a.width);
        const fresh = passing.filter((c) => !usedIds.has(`${c.source}:${c.id}`));
        dupesSkipped += passing.length - fresh.length;

        if (fresh.length) return { ranked: fresh, query, page, dupesSkipped, rejected };

        if (!passing.length) break; // relevance wall -> next engine, no point paginating

        // Passing results existed but all were duplicates -> next page.
      }
    }

    // Ladder exhausted (or about to be) with duplicates as the blocker ->
    // append variety variants, once. Based on the region-level query when
    // available: obscure place names ("chidiya tapu ... aerial") return
    // nothing, while "andaman tourism aerial" diversifies usefully.
    if (!variantsAdded && dupesSkipped > 0 && qi >= plan.queries.length - 1
        && queries.length < plan.queries.length + VARIETY_TERMS.length) {
      variantsAdded = true;
      const variantBase = (plan.region && plan.queries.find((q) => q.startsWith(plan.region)))
        || plan.queries[0];
      for (const variety of VARIETY_TERMS) queries.push(`${variantBase} ${variety}`);
    }
  }
  return { ranked: [], query: null, page: null, dupesSkipped, rejected };
}

// ---------------------------------------------------------------------------
// Preview mode
// ---------------------------------------------------------------------------
async function ask(rl, question) {
  const answer = (await rl.question(question)).trim().toLowerCase();
  return answer;
}

function printCandidates(blog, plan, ranked, label, dupesSkipped = 0) {
  console.log(`\n${label} ${blog.slug}`);
  console.log(`    title   : ${stripHtml(blog.title).slice(0, 80)}`);
  console.log(`    queries : ${plan.queries.map((q) => `"${q}"`).join('  ->  ')}`);
  if (dupesSkipped) {
    console.log(`    dedupe  : skipped ${dupesSkipped} image${dupesSkipped > 1 ? 's' : ''} already used by other blogs`);
  }
  if (!ranked.length) {
    console.log('    NO RELEVANT IMAGES FOUND (would use default placeholder)');
    return;
  }
  ranked.slice(0, TOP_CANDIDATES).forEach((c, i) => {
    console.log(`    ${i + 1}) [${c.source}] ${c.width}x${c.height}  score ${c.score.toFixed(2)}`
      + `  matched: [${c.matched.join(', ') || '-'}]`);
    console.log(`       "${(c.text || '(no description)').slice(0, 90)}"`);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const startedAt = Date.now();
  const blogs = JSON.parse(fs.readFileSync(BLOGS_DB, 'utf-8'));
  const migrated = blogs.filter((b) => b.legacy?.source === 'mnmtravels_sql');

  // --- extract-only / preview-of-queries mode (works offline) --------------
  if (extractOnly) {
    const subset = migrated
      .filter((b) => !onlyFilter || b.slug.includes(onlyFilter))
      .slice(0, Number.isFinite(LIMIT) ? LIMIT : 10);
    for (const blog of subset) {
      const plan = extractSearchPlan(blog);
      console.log(`\n${blog.slug}`);
      console.log(`  primary : [${plan.primaryTerms.join(', ')}]`);
      console.log(`  region  : ${plan.region || '-'}   types: [${plan.types.join(', ') || '-'}]`);
      console.log(`  ladder  : ${plan.queries.map((q) => `"${q}"`).join('\n            ')}`);
    }
    return;
  }

  if (!S3_BUCKET) {
    console.error('[FATAL] S3_BUCKET is not set (env / .env.local). Aborting.');
    process.exit(1);
  }
  if (!UNSPLASH_KEY && !PEXELS_KEY && !PIXABAY_KEY) {
    console.error('[FATAL] Need at least one of PIXABAY_API_KEY, UNSPLASH_ACCESS_KEY or PEXELS_API_KEY.');
    process.exit(1);
  }

  s3 = new S3Client({ region: REGION || undefined });

  const overrides = readJson(OVERRIDES_FILE, null) ?? (() => {
    writeJson(OVERRIDES_FILE, JSON.parse(DEFAULT_OVERRIDES));
    return {};
  })();

  console.log(`Blogs in database        : ${blogs.length} (${migrated.length} migrated)`);
  console.log(`S3 bucket                : ${S3_BUCKET}${CLOUDFRONT ? ` via CloudFront ${CLOUDFRONT}` : ''}`);
  console.log(`Stock APIs               : ${[PIXABAY_KEY && 'Pixabay (primary)', UNSPLASH_KEY && 'Unsplash', PEXELS_KEY && 'Pexels'].filter(Boolean).join(' + ')}`);
  console.log(`Relevance minimum        : ${RELEVANCE_MIN}`);
  console.log(`Mode                     : ${preview ? 'preview' : dryRun ? 'dry-run' : 'live'}\n`);

  const progress = readJson(PROGRESS_FILE, { completed: {} });
  const previousFailures = readJson(FAILED_FILE, []);
  const audit = readJson(AUDIT_FILE, {});
  const failedBySlug = new Map(previousFailures.map((f) => [f.slug, f]));
  let failures = [];

  const defaultUrl = (dryRun || preview)
    ? publicUrlFor(DEFAULT_KEY)
    : await ensureDefaultImage();

  // --- duplicate tracking ---------------------------------------------------
  // Registry of used photo ids, persisted across runs and seeded with every
  // image currently assigned in the database (keyed source:photoId).
  const registry = readJson(USED_IDS_FILE, {});
  const usedIds = new Set(
    Object.entries(registry).map(([pid, info]) => `${info.source}:${pid}`),
  );
  for (const b of migrated) {
    const c = b.imageCredit;
    if (c?.photoId && !usedIds.has(`${c.source}:${c.photoId}`)) {
      usedIds.add(`${c.source}:${c.photoId}`);
      registry[c.photoId] = { slug: b.slug, source: c.source };
    }
  }

  // Duplicate victims: blogs whose photo is already used by an earlier blog
  // (database order). --dedupe re-fetches them; the first user keeps theirs.
  const firstUserOfPhoto = new Map();
  const duplicateVictims = new Set();
  for (const b of migrated) {
    const c = b.imageCredit;
    if (!c?.photoId) continue;
    const key = `${c.source}:${c.photoId}`;
    if (firstUserOfPhoto.has(key)) duplicateVictims.add(b.slug);
    else firstUserOfPhoto.set(key, b.slug);
  }

  const alreadyHasOurs = (b) => {
    const base = CLOUDFRONT ? `https://${CLOUDFRONT}/` : `https://${S3_BUCKET}.s3.`;
    return typeof b.featuredImage === 'string' && b.featuredImage.startsWith(base);
  };
  const pending = migrated
    .filter((b) => (onlyFilter ? b.slug.includes(onlyFilter) : true))
    .filter((b) => {
      if (force) return true;
      if (dedupe && duplicateVictims.has(b.slug)) return true;
      if (progress.completed[b.slug]) return false;
      if (retryFailed && failedBySlug.has(b.slug)) return true;
      if (failedBySlug.has(b.slug)) return false;
      return !alreadyHasOurs(b);
    })
    .slice(0, Number.isFinite(LIMIT) ? LIMIT : Infinity);

  console.log(`Already done (progress)  : ${Object.keys(progress.completed).length}`);
  console.log(`Failed previously        : ${previousFailures.length}${retryFailed ? ' (retrying)' : ''}`);
  console.log(`Manual overrides loaded  : ${Object.keys(overrides).length}`);
  console.log(`Used images tracked      : ${usedIds.size} (duplicates will be skipped)`);
  if (dedupe) console.log(`Duplicate victims        : ${duplicateVictims.size} (re-fetching, first user keeps theirs)`);
  console.log(`To process now           : ${pending.length}\n`);
  if (pending.length === 0) {
    console.log('Nothing to do. Use --force-replace to re-fetch, or --retry-failed.');
    return;
  }

  const rl = process.stdin.isTTY && preview
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null;
  let autoAccept = !preview; // non-preview modes always accept the best match
  // Print-only preview (piped/CI) must not touch the database or state files.
  const readOnly = dryRun || (preview && !rl);

  let processed = 0;
  let uploaded = 0;
  let usedDefault = 0;

  const persist = () => {
    if (readOnly) return;
    writeJson(BLOGS_DB, blogs);
    writeJson(PROGRESS_FILE, progress);
    writeJson(FAILED_FILE, failures);
    writeJson(AUDIT_FILE, audit);
    writeJson(USED_IDS_FILE, registry);
  };

  for (let batchStart = 0; batchStart < pending.length; batchStart += BATCH_SIZE) {
    const batch = pending.slice(batchStart, batchStart + BATCH_SIZE);

    for (const blog of batch) {
      processed++;
      const label = `[${processed}/${pending.length}]`;
      const plan = applyOverrides(extractSearchPlan(blog), blog, overrides);

      try {
        let { ranked, query, page, dupesSkipped, rejected } = await searchAndRank(blog, plan, usedIds);

        if (!ranked.length) {
          throw Object.assign(
            new Error(`no relevant images (queries: ${plan.queries.slice(0, 3).join(' | ')})`),
            { rejected },
          );
        }

        let chosen = ranked[0];

        // --- interactive preview ---
        if (preview && rl && !autoAccept) {
          printCandidates(blog, plan, ranked, label, dupesSkipped);
          let answer = await ask(rl, '    Choose [1-3] / [s]kip / [a]uto-accept rest / [q]uit: ');
          while (answer && !['1', '2', '3', 's', 'a', 'q'].includes(answer)) {
            answer = await ask(rl, '    Please enter 1-3, s, a, or q: ');
          }
          if (answer === 'q') {
            console.log('    Stopping — progress saved.');
            persist();
            rl.close();
            processed--;
            return finish();
          }
          if (answer === 'a') autoAccept = true;
          else if (answer === 's') {
            console.log('    Skipped.');
            continue;
          }
          else if (ranked[Number(answer) - 1]) chosen = ranked[Number(answer) - 1];
        } else if (preview && !rl) {
          // Piped/CI preview: print choices, take no action.
          printCandidates(blog, plan, ranked, label, dupesSkipped);
          continue;
        }

        // --- download & upload (with candidate fallbacks) ---
        let buffer = null;
        let downloaded = null;
        let downloadErr = null;
        for (const candidate of [chosen, ...ranked.filter((c) => c !== chosen)].slice(0, 3)) {
          // Skip candidates from a provider whose downloads are throttled.
          if (candidate.source === 'pixabay' && Date.now() < pixabayBlockedUntil) continue;
          try {
            buffer = await downloadImage(candidate.downloadUrl);
            downloaded = candidate;
            break;
          } catch (err) {
            downloadErr = err;
            await sleep(DELAY_MS);
          }
        }
        // All candidates failed (typically the Pixabay throttle benching the
        // provider after the search): re-search with the remaining providers
        // and download from there instead of losing the blog.
        if (!buffer && (PEXELS_KEY || UNSPLASH_KEY)) {
          const alt = await searchAndRank(blog, plan, usedIds);
          for (const candidate of alt.ranked.slice(0, 3)) {
            if (candidate.source === 'pixabay' && Date.now() < pixabayBlockedUntil) continue;
            try {
              buffer = await downloadImage(candidate.downloadUrl);
              downloaded = candidate;
              query = alt.query;
              page = alt.page;
              dupesSkipped += alt.dupesSkipped;
              break;
            } catch (err) {
              downloadErr = err;
            }
          }
        }
        if (!buffer) throw new Error(`all downloads failed (${downloadErr?.message})`);

        const key = objectKeyFor(blog);
        const url = dryRun ? publicUrlFor(key) : await uploadToS3(key, buffer);
        if (!dryRun) uploaded++;

        blog.featuredImage = url;
        blog.image = url;
        blog.imageCredit = {
          source: downloaded.source,
          photoId: downloaded.id,
          query,
          score: Number(downloaded.score.toFixed(2)),
        };
        usedIds.add(`${downloaded.source}:${downloaded.id}`);
        registry[downloaded.id] = { slug: blog.slug, source: downloaded.source };
        progress.completed[blog.slug] = url;
        audit[blog.slug] = {
          title: stripHtml(blog.title).slice(0, 80),
          query,
          queriesTried: plan.queries,
          source: downloaded.source,
          photoId: downloaded.id,
          score: Number(downloaded.score.toFixed(2)),
          matched: downloaded.matched,
          duplicatesSkipped: dupesSkipped,
          resultPage: page,
          url,
          at: new Date().toISOString(),
        };
        console.log(`${label} ${blog.slug} -> ${url} (score ${downloaded.score.toFixed(2)}, "${query}"`
          + `${dupesSkipped ? `, skipped ${dupesSkipped} duplicate${dupesSkipped > 1 ? 's' : ''}` : ''})`);
      } catch (err) {
        // Never destroy a good existing image because of a fetch failure:
        // keep it if it is already one of ours, otherwise fall back to the
        // default placeholder.
        const base = CLOUDFRONT ? `https://${CLOUDFRONT}/` : `https://${S3_BUCKET}.s3.`;
        const keptExisting = typeof blog.featuredImage === 'string'
          && blog.featuredImage.startsWith(base);
        const url = keptExisting ? blog.featuredImage : defaultUrl;
        blog.featuredImage = url;
        blog.image = url;
        if (!keptExisting) {
          blog.imageCredit = { source: 'default', photoId: null, query: null, score: null };
        }
        usedDefault += keptExisting ? 0 : 1;
        failures.push({
          slug: blog.slug,
          title: stripHtml(blog.title).slice(0, 80),
          reason: err.message,
          keptExistingImage: keptExisting,
          queriesTried: plan.queries,
          bestRejected: err.rejected || [],
          hint: 'Add a manual query to scripts/image-search-overrides.json and re-run with --retry-failed',
          at: new Date().toISOString(),
        });
        console.error(`${label} ${blog.slug} -> ${keptExisting ? 'KEPT EXISTING IMAGE' : 'DEFAULT PLACEHOLDER'} (${err.message})`);
      }
    }

    persist();
    console.log(`Processed ${Math.min(batchStart + BATCH_SIZE, pending.length)}/${pending.length}. `
      + `Uploaded: ${uploaded}. Defaults: ${usedDefault}.`);
  }

  rl?.close();

  const untriedFailures = previousFailures.filter(
    (f) => !retryFailed && !failures.some((x) => x.slug === f.slug) && !progress.completed[f.slug],
  );
  if (!readOnly) writeJson(FAILED_FILE, [...failures, ...untriedFailures]);

  function finish() {
    console.log('\n--- Image Fetch Summary ---');
    console.log(`Processed                : ${processed}`);
    console.log(`Uploaded to S3           : ${uploaded}`);
    console.log(`Default placeholder used : ${usedDefault}`);
    console.log(`Failed (failed-blogs)    : ${failures.length + untriedFailures.length}`);
    console.log(`Audit log                : ${path.relative(ROOT, AUDIT_FILE)}`);
    console.log(`Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
    if (dryRun) console.log('(dry run — database and S3 were not modified)');
    else if (preview && !rl) console.log('(print-only preview — nothing was uploaded or written)');
    else if (preview) console.log('(preview — only approved images were uploaded)');
  }
  finish();
}

// Run only when executed directly (lets tests import the helpers).
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}
