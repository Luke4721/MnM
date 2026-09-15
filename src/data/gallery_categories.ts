/**
 * Category tags for the gallery.
 *
 * Tags live here rather than in gallery_database.json because
 * scripts/scrapeGallery.js regenerates that file as a plain list of URLs.
 *
 * Matching is case-insensitive against the image path, so a tag keeps working
 * when the scraper refreshes the file or the CDN query string changes.
 * Anything untagged still appears under "All" — it just never shows in a
 * category tab.
 */

export const GALLERY_CATEGORIES = ['Ladakh', 'Kerala'] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const ALL_CATEGORY = 'All';

export type GalleryFilter = typeof ALL_CATEGORY | GalleryCategory;

interface CategoryRule {
  /** Substring matched against the lowercased image path. */
  match: string;
  category: GalleryCategory;
}

const CATEGORY_RULES: CategoryRule[] = [
  { match: 'ladakh', category: 'Ladakh' },
  { match: 'pangong', category: 'Ladakh' },
  { match: 'nubra', category: 'Ladakh' },
  { match: 'diskit', category: 'Ladakh' },
  { match: 'hunder', category: 'Ladakh' },
  { match: 'kerala', category: 'Kerala' },
  { match: 'keralam', category: 'Kerala' },
  { match: 'varkala', category: 'Kerala' },
  { match: 'alleppey', category: 'Kerala' },
  { match: 'munnar', category: 'Kerala' },
  { match: 'backwater', category: 'Kerala' },
  { match: 'kochi', category: 'Kerala' },
  { match: 'kumarakom', category: 'Kerala' },
];

export const categoryForImage = (src: string): GalleryCategory | null => {
  const haystack = src.toLowerCase();
  return CATEGORY_RULES.find((rule) => haystack.includes(rule.match))?.category ?? null;
};
