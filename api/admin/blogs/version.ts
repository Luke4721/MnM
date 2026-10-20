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

function getBlogsFilePath(): string {
  const primaryPath = path.join(process.cwd(), 'src', 'data', 'blogs_database.json');
  const candidatePaths = [
    primaryPath,
    path.resolve(process.cwd(), 'src/data/blogs_database.json'),
    path.join(__dirname, '..', '..', '..', 'src', 'data', 'blogs_database.json'),
    path.join(__dirname, '..', '..', 'src', 'data', 'blogs_database.json'),
    path.join(__dirname, 'src', 'data', 'blogs_database.json'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // Continue searching
    }
  }
  return primaryPath;
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

    // Fail loud if config is missing
    if (!S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return sendJson(res, 500, {
        error: 'Server config missing: check api/_serverConfig.ts',
      });
    }

    // In-memory cache for 30 seconds
    const now = Date.now();
    if (cachedVersion && now - cachedVersion.timestamp < 30_000) {
      return sendJson(res, 200, {
        lastUpdated: cachedVersion.lastUpdated,
        count: cachedVersion.count,
      });
    }

    let blogs: any[] = [];
    try {
      const s3 = getS3Client();
      const cmd = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: 'database/blogs_database.json',
      });
      const response = await s3.send(cmd);
      const raw = await response.Body?.transformToString();
      blogs = JSON.parse(raw || '[]');
    } catch (err: any) {
      console.warn('[blogs/version] Falling back to local file. S3 error:', err.message);
      const resolvedPath = getBlogsFilePath();
      try {
        const raw = fs.readFileSync(resolvedPath, 'utf8');
        blogs = JSON.parse(raw || '[]');
      } catch {
        blogs = [];
      }
    }

    const activePublished = blogs.filter((b) => !b.deletedAt && b.status === 'published');
    const count = activePublished.length;
    const lastUpdated = activePublished.reduce((max, b) => {
      const d = b.updatedAt || b.publishedAt || b.createdAt || '';
      return d > max ? d : max;
    }, '');

    cachedVersion = { lastUpdated, count, timestamp: now };

    return sendJson(res, 200, { lastUpdated, count });
  } catch (error: any) {
    console.error('[blogs/version] Handler error:', error);
    return sendJson(res, 500, {
      error: error.message || 'Internal Server Error',
    });
  }
}
