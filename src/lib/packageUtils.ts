/**
 * Utility functions for package data formatting and migration.
 */

/**
 * Converts legacy plain text descriptions into clean semantic HTML paragraphs,
 * while preserving existing HTML markup.
 *
 * Rules:
 * - If the value already contains HTML tags (/<[a-z]/i.test(value)), returns it as-is.
 * - If plain text: escapes HTML entities, splits double newlines into <p> blocks,
 *   and converts single newlines into <br /> tags.
 */
export function plainTextToHtml(str: string | undefined | null | unknown): string {
  if (!str) return '';
  const text = typeof str === 'string' ? str : String(str);
  const trimmed = text.trim();
  if (!trimmed) return '';

  // If the value already contains HTML tags, return it as-is
  if (/<[a-z]/i.test(trimmed)) {
    return trimmed;
  }

  // Escape HTML entities to prevent injection
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Split on double-newlines (two or more consecutive \r?\n) into paragraphs
  const paragraphs = trimmed.split(/\r?\n\s*\r?\n+/);
  return paragraphs
    .map((p) => {
      const trimmedP = p.trim();
      if (!trimmedP) return '';
      const escaped = escapeHtml(trimmedP).replace(/\r?\n/g, '<br />');
      return `<p>${escaped}</p>`;
    })
    .filter(Boolean)
    .join('');
}

/**
 * Normalizes package image URLs. If an S3 image was stored under the
 * root package-images/ prefix (which is not publicly readable by S3 bucket policy),
 * rewrite it to the publicly served blog-images/package-images/ route.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  return url.replace('.amazonaws.com/package-images/', '.amazonaws.com/blog-images/package-images/');
}

export interface FormattedPackagePrice {
  rawPrice: number; // In INR, 0 if missing/unspecified
  hasPrice: boolean; // True when a positive price exists
  originalPriceINR?: number; // In INR if discount or strikethrough applies
  discountPercentage?: number; // Integer percentage (e.g. 30 for 30% OFF)
}

/**
 * Extracts and normalizes pricing and discount information from any package payload
 * (supporting legacy DynamoDB schemas, string prices with currency symbols, and new fields).
 */
export function extractPackagePrice(pkg: any): FormattedPackagePrice {
  if (!pkg) return { rawPrice: 0, hasPrice: false };

  const candidates = [
    pkg.priceINR,
    pkg.startingPrice,
    pkg.price,
    pkg.discountPrice,
    pkg.rate,
  ];

  let rawPrice = 0;
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && !isNaN(candidate) && candidate > 0) {
      rawPrice = Math.round(candidate);
      break;
    }
    if (typeof candidate === 'string') {
      const parsed = parseInt(candidate.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        rawPrice = parsed;
        break;
      }
    }
  }

  // Discount percentage
  let discountPercentage: number | undefined = undefined;
  if (pkg.discountPercentage !== undefined && pkg.discountPercentage !== null && pkg.discountPercentage !== '') {
    const d = Number(pkg.discountPercentage);
    if (!isNaN(d) && d > 0 && d < 100) {
      discountPercentage = Math.round(d);
    }
  }

  // Original price
  let originalPriceINR: number | undefined = undefined;
  if (pkg.originalPrice) {
    const orig = typeof pkg.originalPrice === 'number' ? pkg.originalPrice : parseInt(String(pkg.originalPrice).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(orig) && orig > rawPrice) {
      originalPriceINR = Math.round(orig);
      if (!discountPercentage && rawPrice > 0) {
        discountPercentage = Math.round(((orig - rawPrice) / orig) * 100);
      }
    }
  }

  if (rawPrice > 0 && discountPercentage && discountPercentage > 0 && !originalPriceINR) {
    originalPriceINR = Math.round(rawPrice / (1 - discountPercentage / 100));
  }

  return {
    rawPrice,
    hasPrice: rawPrice > 0,
    originalPriceINR,
    discountPercentage,
  };
}
