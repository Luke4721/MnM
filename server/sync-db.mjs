import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

console.log('[sync-db] Starting S3 database synchronization...');

// In local dev, load .env.local if present so local build can access credentials
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envLocalPath);
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
  } catch {
    // Ignore load errors
  }
}

// S3 non-secret config defaults match config/appConfig.ts.
// AWS credentials MUST come strictly from process.env — NEVER committed.
const BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
const REGION = process.env.S3_REGION || process.env.AWS_REGION || 'ap-south-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error(
    'FATAL: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in Vercel Project Settings (Production/Preview/Development) and in .env.local for local dev.'
  );
  process.exit(1);
}

if (!BUCKET) {
  console.error('[sync-db] FATAL: S3_BUCKET unresolved.');
  process.exit(1);
}

const s3 = new S3Client({
  region: REGION,
  maxAttempts: 1,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const syncList = [
  { key: 'database/blogs_database.json', local: 'src/data/blogs_database.json' },
  { key: 'database/team.json', local: 'src/data/team.json' },
  { key: 'database/support_routing.json', local: 'src/data/support_routing.json' },
  { key: 'database/site_settings.json', local: 'src/data/site_settings.json' },
];

async function run() {
  for (const item of syncList) {
    const targetPath = path.resolve(process.cwd(), item.local);
    try {
      const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: item.key });
      const response = await s3.send(cmd, { abortSignal: AbortSignal.timeout(3500) });
      const data = await response.Body.transformToString();
      fs.writeFileSync(targetPath, data, 'utf8');
      console.log(`[sync-db] Successfully synced ${item.key} -> ${item.local}`);
    } catch (err) {
      console.warn(`[sync-db] Notice: Could not download ${item.key} from S3 (${err.name || err.message}). Using local fallback.`);
    }
  }

  // Write build-time constant for blog cache invalidation & generate lightweight index
  const blogsFile = path.resolve(process.cwd(), 'src/data/blogs_database.json');
  if (fs.existsSync(blogsFile)) {
    try {
      const raw = fs.readFileSync(blogsFile, 'utf8');
      const blogs = JSON.parse(raw);
      if (Array.isArray(blogs)) {
        // 1. Generate lightweight blogs_index.json (NO content field)
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

        const indexPath = path.resolve(process.cwd(), 'src/data/blogs_index.json');
        fs.writeFileSync(indexPath, JSON.stringify(blogsIndex), 'utf8');
        const indexKb = (fs.statSync(indexPath).size / 1024).toFixed(2);
        console.log(`[sync-db] Generated blogs_index.json (${blogsIndex.length} items, ${indexKb} KB)`);

        // 2. Output individual static blog JSON files to public/data/blogs/[slug].json
        const publicBlogsDir = path.resolve(process.cwd(), 'public/data/blogs');
        fs.mkdirSync(publicBlogsDir, { recursive: true });
        for (const b of blogs) {
          if (b.slug) {
            fs.writeFileSync(
              path.join(publicBlogsDir, `${b.slug}.json`),
              JSON.stringify(b),
              'utf8'
            );
          }
        }
        console.log(`[sync-db] Generated static individual blog files in public/data/blogs/`);

        // 3. Generate blogs_version.json
        const activePublished = blogs.filter((b) => !b.deletedAt && b.status === 'published');
        const count = activePublished.length;
        const lastUpdated = activePublished.reduce((max, b) => {
          const d = b.updatedAt || b.publishedAt || b.createdAt || '';
          return d > max ? d : max;
        }, '');
        const versionPath = path.resolve(process.cwd(), 'src/data/blogs_version.json');
        fs.writeFileSync(versionPath, JSON.stringify({ lastUpdated, count }, null, 2), 'utf8');
        console.log(`[sync-db] Generated blogs version constant: count=${count}, lastUpdated=${lastUpdated}`);
      }
    } catch (verErr) {
      console.warn('[sync-db] Could not generate blogs_version.json or blogs_index.json:', verErr.message);
    }
  }

  console.log('[sync-db] Synchronization complete.');
}

run();
