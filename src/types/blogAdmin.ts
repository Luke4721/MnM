export interface BlogSeo {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
}

export interface BlogItem {
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
  tags?: string[];
  relatedBlogIds?: string[];
  image?: string;
  legacy?: {
    source?: string;
    oldId?: number;
    oldUrl?: string;
    oldImage?: string;
    oldThumbnail?: string;
  };
  deletedAt?: string | null;
}

export interface BlogFormData {
  title: string;
  slug: string;
  category: 'India' | 'International';
  tags: string[];
  publishedAt: string;
  status: 'draft' | 'published';
  featured: boolean;
  author: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageAlt: string;
  seo: BlogSeo;
  relatedBlogIds: string[];
}

export interface BlogListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'published' | 'draft';
  category?: 'all' | 'India' | 'International';
}

export interface BlogListResponse {
  blogs: BlogItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PackageGalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface S3UploadResult {
  url: string;
  key: string;
  fileName: string;
  size: number;
}
