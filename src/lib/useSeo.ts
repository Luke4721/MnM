import { useEffect } from 'react';

export interface SeoTags {
  title: string;
  description: string;
  /** Absolute or site-relative image URL for og:image / twitter:image. */
  image?: string;
  /** Path on this site, e.g. /blog/red-fort-delhi — canonical + og:url. */
  canonicalPath?: string;
  type?: 'website' | 'article';
  /** Arbitrary JSON-LD object(s), rendered in a <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

function upsertMeta(selector: string, attrs: Record<string, string>, created: Element[]): HTMLMetaElement | null {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
    created.push(el);
  }
  return el;
}

/**
 * Sets document title, meta description, Open Graph / Twitter tags, a
 * canonical link, and optional JSON-LD structured data while the component
 * is mounted. Everything this hook created is removed again on unmount, so
 * navigating back to a page without SEO leaves the base index.html tags.
 */
export function useSeo(seo: SeoTags): void {
  const { title, description, image, canonicalPath, type, jsonLd } = seo;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const created: Element[] = [];
    const setMeta = (selector: string, attrs: Record<string, string>, content: string) => {
      const el = upsertMeta(selector, attrs, created);
      if (el) el.setAttribute('content', content);
    };
    const setPlain = (name: string, content: string) =>
      setMeta(`meta[name="${name}"]`, { name }, content);
    const setOg = (prop: string, content: string) =>
      setMeta(`meta[property="${prop}"]`, { property: prop }, content);
    const setTwitter = (name: string, content: string) =>
      setMeta(`meta[name="twitter:${name}"]`, { name: `twitter:${name}` }, content);

    setPlain('description', description);
    setOg('og:title', title);
    setOg('og:description', description);
    setOg('og:type', type || 'website');
    setOg('og:site_name', 'Monks & Monkeys Travels');
    setTwitter('card', image ? 'summary_large_image' : 'summary');
    setTwitter('title', title);
    setTwitter('description', description);

    const url = canonicalPath
      ? `${window.location.origin}${canonicalPath}`
      : window.location.href;
    setOg('og:url', url);
    if (image) {
      const absolute = image.startsWith('http') ? image : `${window.location.origin}${image}`;
      setOg('og:image', absolute);
      setTwitter('twitter:image', absolute);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
      created.push(canonical);
    }
    canonical.href = url;

    let ldScript: HTMLScriptElement | null = null;
    if (jsonLd) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.setAttribute('data-seo', 'blog');
      ldScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(ldScript);
    }

    return () => {
      document.title = previousTitle;
      created.forEach((el) => el.remove());
      ldScript?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, canonicalPath, type, JSON.stringify(jsonLd)]);
}
