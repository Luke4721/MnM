import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

function sendJson(res: any, status: number, payload: unknown) {
  if (res && typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload);
  }
  if (res && typeof res.setHeader === 'function' && typeof res.end === 'function') {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
    return;
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

interface RequestWithParsedBody extends IncomingMessage {
  body?: unknown;
}

async function readJsonBody<T = any>(
  req: IncomingMessage,
  maxBytes: number = 15 * 1024 * 1024,
): Promise<T> {
  const preParsed = (req as RequestWithParsedBody).body;
  if (preParsed !== undefined && preParsed !== null) {
    if (typeof preParsed === 'string') {
      try {
        return JSON.parse(preParsed);
      } catch {
        throw new HttpError(400, 'Request body must be valid JSON.');
      }
    }
    return preParsed as T;
  }

  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buffer.length;
    if (size > maxBytes) throw new HttpError(413, 'Request payload too large.');
    chunks.push(buffer);
  }

  if (size === 0) return {} as T;

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET, S3_REGION, VERCEL_DEPLOY_WEBHOOK, ADMIN_API_TOKEN } from '../../config/appConfig.ts';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../_serverConfig.ts';

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

// In-Memory Caching for blogs database
let cachedBlogs: any[] | null = null;

function getBlogsFilePath(): string {
  const primaryPath = path.join(process.cwd(), 'src', 'data', 'blogs_database.json');
  const candidatePaths = [
    primaryPath,
    path.resolve(process.cwd(), 'src/data/blogs_database.json'),
    path.join(__dirname, '..', '..', 'src', 'data', 'blogs_database.json'),
    path.join(__dirname, '..', 'src', 'data', 'blogs_database.json'),
    path.join(__dirname, 'src', 'data', 'blogs_database.json'),
    path.join(process.cwd(), 'data', 'blogs_database.json'),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // Continue searching candidate paths
    }
  }
  return primaryPath;
}

async function getBlogs(): Promise<any[]> {
  if (cachedBlogs) return cachedBlogs;

  try {
    const s3 = getS3Client();
    const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: 'database/blogs_database.json' });
    const response = await s3.send(cmd);
    const raw = await response.Body?.transformToString();
    cachedBlogs = JSON.parse(raw || '[]');
    return cachedBlogs || [];
  } catch (err: any) {
    console.warn('[blogs-api] Failed to load blogs from S3, falling back to local file. Error:', err.message);
    const resolvedPath = getBlogsFilePath();
    try {
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      cachedBlogs = JSON.parse(raw);
      if (!Array.isArray(cachedBlogs)) {
        cachedBlogs = [];
      }
      return cachedBlogs;
    } catch (fsErr) {
      console.error('Blogs API Error: Failed to read local fallback from', resolvedPath, fsErr);
      return [];
    }
  }
}

function verifyAdminAuth(req: IncomingMessage): void {
  const expectedToken = ADMIN_API_TOKEN;
  const headerToken = req.headers['x-admin-token'];
  const token = Array.isArray(headerToken) ? headerToken[0] : headerToken;

  if (!token || token !== expectedToken) {
    throw new HttpError(401, 'Unauthorized: missing or invalid x-admin-token header.');
  }
}

async function saveBlogs(blogs: any[], targetBucket: string = S3_BUCKET): Promise<void> {
  let s3Error: any = null;
  try {
    const s3 = getS3Client();
    const cmd = new PutObjectCommand({
      Bucket: targetBucket,
      Key: 'database/blogs_database.json',
      Body: JSON.stringify(blogs, null, 2),
      ContentType: 'application/json',
    });
    await s3.send(cmd);

    cachedBlogs = blogs;

    // Trigger Vercel rebuild webhook to update the static frontend
    if (VERCEL_DEPLOY_WEBHOOK) {
      await fetch(VERCEL_DEPLOY_WEBHOOK, { method: 'POST' }).catch((e) =>
        console.error('Webhook trigger failed', e)
      );
    }
  } catch (err: any) {
    s3Error = err;
    console.error('Failed to upload blogs database to S3:', err);
  }

  // Task 6: Guard local dev writes — only write to filesystem in non-production local dev
  const isLocalDev = process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';
  if (isLocalDev && targetBucket === S3_BUCKET) {
    try {
      const resolvedPath = getBlogsFilePath();
      fs.writeFileSync(resolvedPath, JSON.stringify(blogs, null, 2), 'utf-8');
      cachedBlogs = blogs;
      console.log('[blogs-api] Synced to local dev file:', resolvedPath);
      // In local dev, if S3 failed, local file write succeeded
      if (s3Error) return;
    } catch (e: any) {
      console.warn('[blogs-api] Local fallback file write failed:', e);
    }
  }

  if (s3Error) {
    throw new HttpError(
      500,
      `Failed to persist blog changes to cloud storage (S3): ${s3Error.message || s3Error}`
    );
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<any> {
  try {
    // Task 4: Fail loud if S3_BUCKET or AWS credentials are unresolved
    if (!S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return sendJson(res, 500, {
        success: false,
        error: 'Server config missing: check api/_serverConfig.ts',
      });
    }

    const url = new URL(req.url || '/', 'http://localhost');
    const method = req.method?.toUpperCase();
    const idParam = url.searchParams.get('id');
    const slugParam = url.searchParams.get('slug');

    // Route /version queries if matched here
    if (url.pathname.endsWith('/version') || url.searchParams.get('version') === '1') {
      const all = await getBlogs();
      const activePub = all.filter((b) => !b.deletedAt && b.status === 'published');
      const count = activePub.length;
      const lastUpdated = activePub.reduce((max, b) => {
        const d = b.updatedAt || b.publishedAt || b.createdAt || '';
        return d > max ? d : max;
      }, '');
      return sendJson(res, 200, { lastUpdated, count });
    }

    const forceFailure =
      req.headers['x-force-s3-failure'] === 'true' ||
      url.searchParams.get('force_s3_error') === '1';
    const targetBucket = forceFailure ? 'mnm-forced-invalid-bucket-test-failure' : S3_BUCKET;

    // Enforce admin auth on mutation routes (POST, PUT, DELETE)
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      verifyAdminAuth(req);
    }

    const allBlogs = await getBlogs();
    const activeBlogs = allBlogs.filter((b) => !b.deletedAt);

    // ==========================================
    // GET: Single blog or filtered paginated list
    // ==========================================
    if (method === 'GET') {
      if (idParam || slugParam) {
        const found = allBlogs.find((b) => (idParam ? b.id === idParam : b.slug === slugParam));
        if (!found || found.deletedAt) {
          throw new HttpError(404, 'Blog not found.');
        }
        sendJson(res, 200, { success: true, blog: found });
        return;
      }

      const search = (url.searchParams.get('search') || '').toLowerCase().trim();
      const status = url.searchParams.get('status') || 'all';
      const category = url.searchParams.get('category') || 'all';
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam
        ? Math.max(1, Math.min(10000, parseInt(limitParam, 10) || 10000))
        : 10000;

      let filtered = activeBlogs.filter((b) => {
        if (status !== 'all' && b.status !== status) return false;
        if (category !== 'all' && b.category?.toLowerCase() !== category.toLowerCase()) return false;
        if (search) {
          const matchTitle = b.title?.toLowerCase().includes(search);
          const matchCategory = b.category?.toLowerCase().includes(search);
          const matchExcerpt = b.excerpt?.toLowerCase().includes(search);
          const matchSlug = b.slug?.toLowerCase().includes(search);
          if (!matchTitle && !matchCategory && !matchExcerpt && !matchSlug) return false;
        }
        return true;
      });

      // Sort newest publishedAt first
      filtered.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const paginated = filtered.slice((page - 1) * limit, page * limit);

      sendJson(res, 200, {
        success: true,
        blogs: paginated,
        total,
        page,
        totalPages,
      });
      return;
    }

    // ==========================================
    // POST: Create a new blog
    // ==========================================
    if (method === 'POST') {
      const body = await readJsonBody(req);
      const {
        title,
        slug,
        category,
        content,
        excerpt = '',
        featuredImage = '',
        imageAlt = '',
        status = 'draft',
        featured = false,
        author = 'MNM Team',
        publishedAt = new Date().toISOString(),
        seo = {},
        tags = [],
        relatedBlogIds = [],
      } = body;

      if (!title || !slug || !content) {
        throw new HttpError(400, 'Title, slug, and content are required.');
      }

      // Ensure slug uniqueness
      const existingSlug = activeBlogs.find((b) => b.slug === slug);
      if (existingSlug) {
        throw new HttpError(409, `A blog with slug "${slug}" already exists.`);
      }

      const id = crypto.randomUUID();
      const readMinutes = Math.max(1, Math.ceil(content.replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).length / 200));

      const newBlog = {
        id,
        title,
        slug,
        category: category || 'India',
        content,
        excerpt,
        featuredImage: featuredImage || '',
        image: featuredImage || '',
        imageAlt: imageAlt || title,
        status,
        featured: !!featured,
        author,
        readTime: `${readMinutes} min read`,
        publishedAt,
        date: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          .format(new Date(publishedAt))
          .toUpperCase(),
        seo: {
          title: seo.title || title,
          description: seo.description || excerpt || '',
          keywords: seo.keywords || '',
          ogImage: seo.ogImage || featuredImage || '',
        },
        tags: Array.isArray(tags) ? tags : [],
        relatedBlogIds: Array.isArray(relatedBlogIds) ? relatedBlogIds : [],
        createdAt: new Date().toISOString(),
      };

      allBlogs.unshift(newBlog);
      await saveBlogs(allBlogs, targetBucket);

      sendJson(res, 201, { success: true, blog: newBlog });
      return;
    }

    // ==========================================
    // PUT: Update an existing blog
    // ==========================================
    if (method === 'PUT') {
      const body = await readJsonBody(req);
      const targetId = idParam || body.id;

      if (!targetId) {
        throw new HttpError(400, 'Blog ID is required for update.');
      }

      const index = allBlogs.findIndex((b) => b.id === targetId);
      if (index === -1 || allBlogs[index].deletedAt) {
        throw new HttpError(404, 'Blog not found.');
      }

      const current = allBlogs[index];
      const {
        title = current.title,
        slug = current.slug,
        category = current.category,
        content = current.content,
        excerpt = current.excerpt,
        featuredImage = current.featuredImage,
        imageAlt = current.imageAlt,
        status = current.status,
        featured = current.featured,
        author = current.author,
        publishedAt = current.publishedAt,
        seo = current.seo,
        tags = current.tags,
        relatedBlogIds = current.relatedBlogIds,
      } = body;

      // Check slug collision
      if (slug !== current.slug) {
        const collision = activeBlogs.find((b) => b.slug === slug && b.id !== targetId);
        if (collision) {
          throw new HttpError(409, `Another blog is already using the slug "${slug}".`);
        }
      }

      const readMinutes = Math.max(1, Math.ceil(content.replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).length / 200));

      const updatedBlog = {
        ...current,
        title,
        slug,
        category,
        content,
        excerpt,
        featuredImage,
        image: featuredImage,
        imageAlt: imageAlt || title,
        status,
        featured: !!featured,
        author,
        readTime: `${readMinutes} min read`,
        publishedAt,
        seo: {
          ...current.seo,
          ...seo,
        },
        tags: Array.isArray(tags) ? tags : current.tags || [],
        relatedBlogIds: Array.isArray(relatedBlogIds) ? relatedBlogIds : current.relatedBlogIds || [],
        updatedAt: new Date().toISOString(),
      };

      allBlogs[index] = updatedBlog;
      await saveBlogs(allBlogs, targetBucket);

      sendJson(res, 200, { success: true, blog: updatedBlog });
      return;
    }

    // ==========================================
    // DELETE: Soft delete blog(s)
    // ==========================================
    if (method === 'DELETE') {
      const body = await readJsonBody(req).catch(() => ({}));
      const idsToDelete: string[] = [];

      if (idParam) idsToDelete.push(idParam);
      if (body.id) idsToDelete.push(body.id);
      if (Array.isArray(body.ids)) idsToDelete.push(...body.ids);

      const uniqueIds = Array.from(new Set(idsToDelete));
      if (uniqueIds.length === 0) {
        throw new HttpError(400, 'No blog IDs provided for deletion.');
      }

      let count = 0;
      const now = new Date().toISOString();

      allBlogs.forEach((b) => {
        if (uniqueIds.includes(b.id) && !b.deletedAt) {
          b.deletedAt = now;
          b.status = 'draft';
          count++;
        }
      });

      await saveBlogs(allBlogs, targetBucket);

      sendJson(res, 200, {
        success: true,
        message: `Successfully soft-deleted ${count} blog(s).`,
        deletedCount: count,
      });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    throw new HttpError(405, `Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error("Blogs API Error:", error);
    if (error instanceof HttpError) {
      return sendJson(res, error.status, { success: false, error: error.message });
    }
    return sendJson(res, 500, { success: false, error: error.message || 'Internal Server Error' });
  }
}

