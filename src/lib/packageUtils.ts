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
