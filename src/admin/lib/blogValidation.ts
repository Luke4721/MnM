import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(500, 'Title cannot exceed 500 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug cannot exceed 200 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase alphanumeric characters and hyphens (e.g. "goa-beach-guide")',
    ),
  category: z.enum(['India', 'International']),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().min(1, 'Publish date is required'),
  status: z.enum(['draft', 'published']),
  featured: z.boolean().default(false),
  author: z.string().min(1, 'Author is required').default('MNM Team'),
  excerpt: z.string().max(1000, 'Excerpt cannot exceed 1000 characters').default(''),
  content: z.string().min(10, 'Content must have at least 10 characters'),
  featuredImage: z.string().url('Featured image must be a valid URL').or(z.literal('')),
  imageAlt: z.string().default(''),
  seo: z.object({
    title: z.string().max(70, 'Meta title should be under 70 characters').default(''),
    description: z.string().max(160, 'Meta description should be under 160 characters').default(''),
    keywords: z.string().default(''),
    ogImage: z.string().optional(),
  }),
  relatedBlogIds: z.array(z.string()).max(4, 'Select up to 4 related blogs').default([]),
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
