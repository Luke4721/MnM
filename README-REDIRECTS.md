# URL Redirect Management Guide

This document describes how redirects are managed on `www.mnmtravels.com` and how to add new 301 redirects in the future.

---

## 1. Architecture Overview

- **Host Platform**: Vercel
- **Configuration File**: [`vercel.json`](file:///E:/MNM_Website/vercel.json)
- **Redirect Mechanism**: Top-level `redirects` array evaluated before Vercel rewrites and edge handlers.
- **Permanent Flag**: `"permanent": true` (emits HTTP 301 / 308 permanent redirect).

During the migration from the legacy `mnmtravels.in` site, 588 blog posts received SEO-optimized slugs. To preserve search rankings and avoid broken external backlinks, every changed post has an exact redirect mapping in `vercel.json`:

```json
{
  "source": "/blog/reiek-tourism-guide",
  "destination": "/blog/reiek-tourism-guide-2026-best-things-to-do-trekking-travel-tips",
  "permanent": true
}
```

In addition, legacy package sections (`/india-holiday-packages/...`, `/india-holidays/...`, `/kailash-mansarovar/...`) and legacy detail paths (`/blog/detail/:slug`) are safely routed to their modern destinations (`/packages` and `/blog/:slug`).

---

## 2. How to Add Future Redirects

### Option A: Automated Generation (Recommended when updating blog database)

When new blogs are imported or updated with `legacy.oldUrl` entries, re-run the generator script:

```bash
node scripts/apply-redirects.mjs
```

The script automatically:
1. Reads `src/data/blogs_database.json`.
2. Identifies all blogs where `legacy.oldUrl` differs from `slug`.
3. Validates against duplicate sources, destination collisions, and circular redirect chains.
4. Updates `vercel.json` while preserving existing headers, functions, and rewrites.

### Option B: Adding a Single Redirect Manually

To manually add a redirect for a custom path or marketing vanity URL, edit `vercel.json`:

1. Open `vercel.json`.
2. Locate the `"redirects"` array.
3. Append a new redirect object:

```json
{
  "source": "/old-path",
  "destination": "/new-path",
  "permanent": true
}
```

---

## 3. Redirect Rules & Guardrails

To prevent SEO penalties and deployment issues on Vercel:

1. **No Redirect Chains**: Never redirect `A -> B` if `B -> C` exists. Redirect directly `A -> C`.
2. **No Wildcard Conflicts**: Place specific exact paths before broad wildcards.
3. **No Duplicate Sources**: Every `"source"` path must appear only once in the array.
4. **Vercel Limits**: Vercel limits the `redirects` array to 1,024 items. The current configuration uses ~593 items, leaving room for future expansions. If you ever exceed 1,020 items, consolidate legacy patterns with regex or middleware.

---

## 4. Verification

To verify that redirects work properly:

```bash
# Test a legacy blog slug:
curl -I https://www.mnmtravels.com/blog/reiek-tourism-guide

# Expected output:
# HTTP/2 301 (or 308)
# location: /blog/reiek-tourism-guide-2026-best-things-to-do-trekking-travel-tips
```
