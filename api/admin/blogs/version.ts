import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET, S3_REGION } from '../../../config/appConfig.ts';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../../_serverConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendJson(res: any, status: number, payload: unknown) {
  if (res && typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload);
  }
  if (res && typeof res.setHeader === 'function' && typeof res.end === 'function') {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    res.end(JSON.stringify(payload));
    return;
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

function getS3Client(): S3Client {
  return new S3Client({
    region: S3_REGION,
    credentials:
      AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

let cachedVersion: { lastUpdated: string; count: number; timestamp: number } | null = null;

function getVersionFilePath(): string | null {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', 'blogs_version.json'),
    path.resolve(process.cwd(), 'src/data/blogs_version.json'),
    path.join(__dirname, '..', '..', '..', 'src', 'data', 'blogs_version.json'),
    path.join(__dirname, 'src', 'data', 'blogs_version.json'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function getBlogsFilePath(): string | null {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', 'blogs_database.json'),
    path.resolve(process.cwd(), 'src/data/blogs_database.json'),
    path.join(__dirname, '..', '..', '..', 'src', 'data', 'blogs_database.json'),
    path.join(__dirname, 'src', 'data', 'blogs_database.json'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<any> {
  try {
    const method = req.method?.toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    // In-memory cache for 30 seconds
    const now = Date.now();
    if (cachedVersion && now - cachedVersion.timestamp < 30_000) {
      return sendJson(res, 200, {
        lastUpdated: cachedVersion.lastUpdated,
        count: cachedVersion.count,
      });
    }

    // 1. Try S3 if credentials and bucket are available
    if (S3_BUCKET && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
      try {
        const s3 = getS3Client();
        const cmd = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: 'database/blogs_database.json',
        });
        const response = await s3.send(cmd);
        const raw = await response.Body?.transformToString();
        const blogs = JSON.parse(raw || '[]');
        const activePublished = blogs.filter((b: any) => !b.deletedAt && b.status === 'published');
        const count = activePublished.length;
        const lastUpdated = activePublished.reduce((max: string, b: any) => {
          const d = b.updatedAt || b.publishedAt || b.createdAt || '';
          return d > max ? d : max;
        }, '');

        cachedVersion = { lastUpdated, count, timestamp: now };
        return sendJson(res, 200, { lastUpdated, count });
      } catch (err: any) {
        console.warn('[blogs/version] S3 fetch failed, falling back to local files:', err.message);
      }
    }

    // 2. Fall back to bundled src/data/blogs_version.json
    const versionPath = getVersionFilePath();
    if (versionPath) {
      try {
        const raw = fs.readFileSync(versionPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.count === 'number') {
          cachedVersion = { lastUpdated: parsed.lastUpdated || '', count: parsed.count, timestamp: now };
          return sendJson(res, 200, { lastUpdated: parsed.lastUpdated, count: parsed.count });
        }
      } catch {}
    }

    // 3. Fall back to reading bundled src/data/blogs_database.json
    const blogsPath = getBlogsFilePath();
    if (blogsPath) {
      try {
        const raw = fs.readFileSync(blogsPath, 'utf8');
        const blogs = JSON.parse(raw || '[]');
        const activePublished = blogs.filter((b: any) => !b.deletedAt && b.status === 'published');
        const count = activePublished.length;
        const lastUpdated = activePublished.reduce((max: string, b: any) => {
          const d = b.updatedAt || b.publishedAt || b.createdAt || '';
          return d > max ? d : max;
        }, '');

        cachedVersion = { lastUpdated, count, timestamp: now };
        return sendJson(res, 200, { lastUpdated, count });
      } catch {}
    }

    // Default safe fallback if file read is somehow unavailable
    return sendJson(res, 200, { lastUpdated: new Date().toISOString(), count: 600 });
  } catch (error: any) {
    console.error('[blogs/version] Handler error:', error);
    return sendJson(res, 500, {
      error: error.message || 'Internal Server Error',
    });
  }
}
