/**
 * Defense-in-depth sanitizer for HTML content (blogs, package overviews, etc).
 * Strips script tags, iframes, inline on* handlers, and javascript: links.
 */
export function sanitizeBlogHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}
