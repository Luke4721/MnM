import type { PackageGalleryImage } from './blogAdmin';

/**
 * Tour Package — stored in AWS DynamoDB (via API Gateway), served to the public
 * site and managed through the admin panel.
 *
 * `expiryDate` is the mandatory "Package Validity" date. It is ALWAYS stored as
 * an ISO-8601 string (e.g. "2027-03-15T00:00:00.000Z") so it can be compared
 * via `new Date(...)` in both DynamoDB and the browser.
 * A package is Active iff `new Date(expiryDate) > new Date()`.
 */
export interface TourPackage {
  id: string | number;
  name: string;
  title?: string;
  slug?: string;
  description?: string;
  overview?: string;
  highlights?: string | string[];

  /** Mandatory package validity — ISO string. See expiry helpers below. */
  expiryDate: string;

  /** Pricing */
  startingPrice?: string | number;
  priceINR?: number;

  /** Destination / location fields (legacy aliases supported). */
  destination?: string;
  location?: string;
  locations?: string;
  highlights_old?: string;

  category?: string;
  type?: string;

  /** Duration fields (legacy aliases supported). */
  durationNights?: number;
  durationDays?: number;
  nights?: string;
  days?: string;
  duration?: string;

  /** Image fields (legacy aliases supported). */
  featuredImage?: string;
  image_url?: string;
  heroImage?: string;
  image?: string;
  img?: string;
  galleryImages?: PackageGalleryImage[];
  imageOrder?: string[];

  /** Price variants (from the drive parser). */
  variants?: Array<{
    id?: string;
    name?: string;
    priceINR: number;
    duration?: string;
  }>;

  /** Detail-page fields (DynamoDB records). */
  rating?: number;
  reviewsCount?: number;
  itinerary?: Array<{
    day?: number;
    title?: string;
    description?: string;
    [key: string]: unknown;
  }>;
  inclusions?: string[];
  exclusions?: string[];

  /** DynamoDB timestamps */
  createdAt?: string;
  updatedAt?: string;

  /** Legacy / unknown fields from the DynamoDB records. */
  [key: string]: unknown;
}

/** Parses an expiry value (ISO string | Date | number) into a Date or null. */
export function parseExpiryDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Canonical active/expired derivation:
 *   const isActive = new Date(package.expiryDate) > new Date();
 * Records with NO expiryDate yet (legacy data) are treated as active so the
 * existing catalogue stays live; only a real past date means "Expired".
 */
export function isPackageActive(pkg: { expiryDate?: unknown } | null | undefined): boolean {
  const expiry = parseExpiryDate(pkg?.expiryDate);
  if (!expiry) return true;
  return expiry.getTime() > Date.now();
}

/** A package is Expired iff it is not Active. */
export const isPackageExpired = (pkg: { expiryDate?: unknown } | null | undefined): boolean =>
  !isPackageActive(pkg);

/** True when a package actually has an expiryDate value set. */
export function hasExpiryDate(pkg: { expiryDate?: unknown } | null | undefined): boolean {
  return parseExpiryDate(pkg?.expiryDate) !== null;
}

/** "15 Mar 2027" from an ISO string; returns "—" when missing/invalid. */
export function formatExpiryDate(value: unknown): string {
  const d = parseExpiryDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * YYYY-MM-DD for <input type="date"> from an ISO string; '' when missing.
 * Uses the LOCAL calendar date so what the admin picks is what gets stored.
 */
export function toDateInputValue(value: unknown): string {
  const d = parseExpiryDate(value);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Converts a YYYY-MM-DD date-input value to an end-of-day ISO string
 * (23:59:59.999 local time) so a package stays bookable through its
 * final day and expires right after midnight.
 */
export function fromDateInputValue(value: string): string {
  const d = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}
