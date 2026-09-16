import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJsonBody, sendJson, HttpError } from '../../server/adminHelper.ts';

const DB_PATH = path.resolve(process.cwd(), 'src/data/blogs_database.json');

// In-memory cache fallback if file system is read-only
let memoryBlogs: any[] | null = null;

function loadBlogs(): any[] {
  if (memoryBlogs) return memoryBlogs;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      memoryBlogs = JSON.parse(raw);
      return memoryBlogs || [];
    }
  } catch (err) {
    console.error('[blogs-api] Error reading blogs database:', err);
  }
  memoryBlogs = [];
  return memoryBlogs;
}

function saveBlogs(blogs: any[]): void {
  memoryBlogs = blogs;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(blogs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[blogs-api] File write failed (possibly serverless environment), cached in memory:', err);
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const method = req.method?.toUpperCase();
    const idParam = url.searchParams.get('id');
    const slugParam = url.searchParams.get('slug');

    const allBlogs = loadBlogs();
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
      saveBlogs(allBlogs);

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
      saveBlogs(allBlogs);

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

      saveBlogs(allBlogs);

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
    if (error instanceof HttpError) {
      sendJson(res, error.status, { success: false, error: error.message });
      return;
    }
    console.error('[blogs-api] Unexpected error:', error);
    sendJson(res, 500, { success: false, error: error.message || 'Internal Server Error' });
  }
}
