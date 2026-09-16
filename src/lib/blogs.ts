import blogsJson from '../data/blogs_database.json';

export interface BlogSeo {
  title: string;
  description: string;
  keywords: string;
}

export interface BlogLegacy {
  source: string;
  oldId: number;
  oldUrl: string;
  oldImage: string;
  oldThumbnail: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: 'India' | 'International' | string;
  publishedAt: string;
  status: 'draft' | 'published' | string;
  featured?: boolean;
  author: string;
  imageAlt: string;
  readTime: string;
  date: string;
  seo: BlogSeo;
  legacy: BlogLegacy;
  /** Compat alias for featuredImage — the original pages read `image`. */
  image: string;
  imageCredit?: { source: string; photoId: string | null; query: string | null };
}

// Canonical site origin. The live site is www.mnmtravels.com (the bare
// domain 308-redirects here), so canonical/OG/share URLs must use it.
// Override per-environment with VITE_SITE_URL.
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)
  || 'https://www.mnmtravels.com';

export const blogs = blogsJson as unknown as Blog[];

/** Published blogs, newest first. The JSON module is parsed once per page
 *  load, so this sort runs a single time per session. */
export const publishedBlogs: Blog[] = [...blogs]
  .filter((b) => b.status === 'published')
  .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

export const blogBySlug = (slug?: string): Blog | undefined =>
  slug ? blogs.find((b) => b.slug === slug) : undefined;

/** Homepage featured blogs (legacy display_home=1). */
export const featuredBlogs: Blog[] = publishedBlogs.filter((b) => b.featured);

/** Six most recent blogs for the homepage "Latest" section. */
export const latestBlogs: Blog[] = publishedBlogs.slice(0, 6);

/** Related blogs: same category first, newest first, padded with recent
 *  posts from other categories when the category is too small. */
export function relatedBlogs(current: Blog, count = 4): Blog[] {
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

/**
 * Defense-in-depth sanitizer for migrated HTML. The migration already
 * verified there are no <script>/<iframe>/on* attributes in the content —
 * this strips them again right before render so a future re-import can't
 * sneak active markup into blog pages.
 */
export function sanitizeBlogHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

/** Lowercased title+excerpt+content per slug, built once on first search. */
let searchIndex: Map<string, string> | null = null;
function getSearchIndex(): Map<string, string> {
  if (!searchIndex) {
    searchIndex = new Map(
      publishedBlogs.map((b) => [b.slug, `${b.title} ${b.excerpt} ${b.content}`.toLowerCase()]),
    );
  }
  return searchIndex;
}

/** Filter by category tab and free-text query (title + content). */
export function searchBlogs(category: string, query: string): Blog[] {
  const q = query.trim().toLowerCase();
  const index = getSearchIndex();
  return publishedBlogs.filter((b) => {
    if (category !== 'All' && b.category !== category) return false;
    if (!q) return true;
    return (index.get(b.slug) || '').includes(q);
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
