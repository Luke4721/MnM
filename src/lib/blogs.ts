import blogsIndexJson from '../data/blogs_index.json';
import blogVersion from '../data/blogs_version.json';
import { PUBLIC_SITE_URL } from '../../config/appConfig.ts';

export const BUILD_LAST_UPDATED: string = blogVersion.lastUpdated;
export const BUILD_BLOG_COUNT: number = blogVersion.count;

export interface BlogSeo {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export interface BlogLegacy {
  source?: string;
  oldId?: number;
  oldUrl?: string;
  oldImage?: string;
  oldThumbnail?: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogGalleryImage {
  url: string;
  location: string;
  alt?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  featuredImage: string;
  category: 'India' | 'International' | string;
  publishedAt: string;
  status: 'draft' | 'published' | string;
  featured?: boolean;
  author?: string;
  imageAlt: string;
  readTime: string;
  date?: string;
  seo?: BlogSeo;
  legacy?: BlogLegacy;
  faqs?: BlogFaq[];
  imageGallery?: BlogGalleryImage[];
  /** Compat alias for featuredImage — the original pages read `image`. */
  image?: string;
  imageCaption?: string;
  imageCredit?: { source: string; photoId: string | null; query: string | null };
  relatedBlogIds?: string[];
  tags?: string[];
  updatedAt?: string;
  deletedAt?: string;
}

export type BlogMeta = Blog;

// Canonical site origin. The live site is www.mnmtravels.com (the bare
// domain 308-redirects here), so canonical/OG/share URLs must use it.
export const SITE_URL = PUBLIC_SITE_URL;

export const blogs = blogsIndexJson as unknown as Blog[];

/** Published blogs, newest first. The JSON module is parsed once per page
 *  load, so this sort runs a single time per session. */
export const publishedBlogs: Blog[] = [...blogs]
  .filter((b) => !b.deletedAt && b.status === 'published')
  .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

/** Helper to list all published blogs from the index */
export function listBlogs(): Blog[] {
  return publishedBlogs;
}

/** Homepage featured blogs (legacy display_home=1). */
export const featuredBlogs: Blog[] = publishedBlogs.filter((b) => b.featured);

/** Functional getter for featured blogs */
export function getFeaturedBlogs(): Blog[] {
  return featuredBlogs;
}

/** Six most recent blogs for the homepage "Latest" section. */
export const latestBlogs: Blog[] = publishedBlogs.slice(0, 6);

/** Find blog metadata by slug from the lightweight index */
export function blogMetaBySlug(slug?: string): Blog | undefined {
  return slug ? blogs.find((b) => b.slug === slug) : undefined;
}

/** Synchronous lookup from index (title, hero, tags, metadata) */
export const blogBySlug = blogMetaBySlug;

/** Asynchronous fetch for full blog post (including full content body) */
export async function fetchBlogBySlug(slug?: string): Promise<Blog | undefined> {
  if (!slug) return undefined;
  // 1. Try static individual post file generated at build time
  try {
    const res = await fetch(`/data/blogs/${encodeURIComponent(slug)}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.content) return data as Blog;
    }
  } catch {}

  // 2. Fallback to API endpoint
  try {
    const res = await fetch(`/api/admin/blogs?slug=${encodeURIComponent(slug)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.blog) return data.blog as Blog;
    }
  } catch {}

  return blogMetaBySlug(slug);
}

/** Related blogs: honour admin selections if present, falling back to same
 *  category first, newest first, padded with recent posts from other categories. */
export function relatedBlogs(current: Blog, count = 4): Blog[] {
  if (Array.isArray(current.relatedBlogIds) && current.relatedBlogIds.length > 0) {
    const idMap = new Map<string, Blog>(blogs.map((b: Blog) => [b.id, b]));
    const selected = current.relatedBlogIds
      .map((id: string) => idMap.get(id))
      .filter((b): b is Blog => !!b && b.status === 'published' && b.slug !== current.slug);
    if (selected.length > 0) {
      return selected.slice(0, count);
    }
  }

  const sameCategory = publishedBlogs.filter(
    (b) => b.slug !== current.slug && b.category === current.category,
  );
  const others = publishedBlogs.filter(
    (b) => b.slug !== current.slug && b.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}

/** "15 Aug 2025" from the ISO publishedAt, falling back to the legacy
 *  display date when the ISO timestamp is missing. */
export function formatBlogDate(blog: Blog): string {
  if (blog.publishedAt) {
    const d = new Date(blog.publishedAt);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      }).format(d);
    }
  }
  return blog.date || '';
}

/** Excerpt capped at `max` characters, cut on a word boundary. */
export function truncateExcerpt(text: string, max = 150): string {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export { sanitizeBlogHtml } from './sanitize';

/** Post-process HTML to ensure in-body images have loading="lazy" and decoding="async" */
export function optimizePostImages(html: string): string {
  if (!html) return '';
  return html.replace(/<img\b([^>]*?)>/gi, (_match, attrs) => {
    let newAttrs = attrs;
    if (!/loading\s*=/i.test(newAttrs)) {
      newAttrs += ' loading="lazy"';
    }
    if (!/decoding\s*=/i.test(newAttrs)) {
      newAttrs += ' decoding="async"';
    }
    return `<img${newAttrs}>`;
  });
}

/** Filter by category tab and free-text query (title + excerpt). */
export function searchBlogs(category: string, query: string, source: Blog[] = publishedBlogs): Blog[] {
  const q = query.trim().toLowerCase();
  return source.filter((b) => {
    if (category !== 'All' && b.category?.toLowerCase() !== category.toLowerCase()) return false;
    if (!q) return true;
    const text = `${b.title} ${b.excerpt} ${b.content || ''}`.toLowerCase();
    return text.includes(q);
  });
}

/** Category counts for the listing tabs. */
export function getBlogCategories(): { total: number; counts: Record<string, number> } {
  return {
    total: publishedBlogs.length,
    counts: publishedBlogs.reduce<Record<string, number>>((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {}),
  };
}

/** Clean FAQ question string (trim, strip numbers/dots, fix punctuation) */
export function cleanFaqQuestion(q: string): string {
  if (!q) return '';
  let str = q.trim().replace(/^(\d+[\.\)]|\.)\s*/, '');
  str = str.replace(/\s+\?$/, '?');
  if (!str.endsWith('?') && !str.endsWith('.') && !str.endsWith('!')) {
    str += '?';
  }
  return str;
}

/** Check if blog HTML content already includes an FAQ section */
export function hasFaqInContent(html?: string): boolean {
  if (!html) return false;
  return (
    /<h[23][^>]*>(?:[^<]*\b(?:faq|faqs|frequently\s+asked\s+questions)\b[^<]*)<\/h[23]>/i.test(html) ||
    /<details[\s\S]*?<summary/i.test(html) ||
    /class="[^"]*(?:blog-faq|faq-section|faq-item)[^"]*"/i.test(html)
  );
}

/** Extract FAQ questions and answers from blog HTML content */
export function extractFaqsFromHtml(html?: string): BlogFaq[] {
  if (!html) return [];
  const faqs: BlogFaq[] = [];

  // 1. Look for <details><summary>Question</summary>Answer</details>
  const detailsRegex = /<details[^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let match: RegExpExecArray | null;
  while ((match = detailsRegex.exec(html)) !== null) {
    const q = match[1].replace(/<[^>]*>/g, '').trim();
    const a = match[2].replace(/<[^>]*>/g, '').trim();
    if (q && a) {
      faqs.push({ question: cleanFaqQuestion(q), answer: a });
    }
  }
  if (faqs.length > 0) return faqs;

  // 2. Look for FAQ heading (h2 or h3 with FAQ or Frequently Asked Questions)
  const faqHeadingMatch = /<h([23])[^>]*>(?:[^<]*\b(?:faq|faqs|frequently\s+asked\s+questions)\b[^<]*)<\/h\1>/i.exec(html);
  if (faqHeadingMatch && faqHeadingMatch.index !== undefined) {
    const afterHeading = html.slice(faqHeadingMatch.index + faqHeadingMatch[0].length);
    // Find questions in <h3>, <h4>, or <p><strong>
    const qaRegex = /<(?:h[34]|p>\s*<strong)[^>]*>([\s\S]*?)<\/(?:h[34]|strong>\s*<\/p>)\s*([\s\S]*?)(?=(?:<(?:h[234]|p>\s*<strong)|$))/gi;
    let qaMatch: RegExpExecArray | null;
    while ((qaMatch = qaRegex.exec(afterHeading)) !== null) {
      const q = qaMatch[1].replace(/<[^>]*>/g, '').trim();
      const a = qaMatch[2].replace(/<[^>]*>/g, '').trim();
      if (/faq|frequently\s+asked/i.test(q) && q.length < 35) continue;
      if (q && a && q.length > 5 && a.length > 5) {
        faqs.push({ question: cleanFaqQuestion(q), answer: a });
      }
    }
  }

  return faqs;
}

/** Get FAQs for a blog post (returns blog.faqs if populated, else parses from content) */
export function getBlogFaqs(blog?: Blog | null): BlogFaq[] {
  if (!blog) return [];
  if (Array.isArray(blog.faqs) && blog.faqs.length > 0) {
    return blog.faqs;
  }
  if (blog.content) {
    return extractFaqsFromHtml(blog.content);
  }
  return [];
}
