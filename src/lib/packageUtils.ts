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
export function plainTextToHtml(str: string | undefined | null): string {
  if (!str) return '';
  const trimmed = str.trim();
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
