import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(500, 'Title cannot exceed 500 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(300, 'Slug cannot exceed 300 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().default(() => new Date().toISOString()),
  status: z.enum(['draft', 'published']).default('published'),
  featured: z.boolean().default(false),
  author: z.string().default('MNM Team'),
  excerpt: z.string().max(2500, 'Excerpt cannot exceed 2500 characters').default(''),
  content: z.string().min(1, 'Article content cannot be empty'),
  featuredImage: z.string().default(''),
  imageAlt: z.string().default(''),
  seo: z
    .object({
      title: z.string().max(300, 'Meta title is too long').default(''),
      description: z.string().max(1000, 'Meta description is too long').default(''),
      keywords: z.string().default(''),
      ogImage: z.string().optional(),
    })
    .default({
      title: '',
      description: '',
      keywords: '',
    }),
  relatedBlogIds: z.array(z.string()).default([]),
});

export type BlogFormSchema = z.infer<typeof blogFormSchema>;

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadTime(text: string): string {
  const wordsPerMinute = 200;
  // Strip HTML tags
  const cleanText = text.replace(/<[^>]*>?/gm, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${Math.max(1, minutes)} min read`;
}

export function countWords(text: string): number {
  const cleanText = text.replace(/<[^>]*>?/gm, ' ');
  return cleanText.trim().split(/\s+/).filter(Boolean).length;
}
