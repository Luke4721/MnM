import db from '../data/mnm_database.json';

export interface InvoiceDraft {
  leadSource: string;
  customerName: string;
  services: string[];
  amount: number;
  notes: string;
}

export interface ProvisionalInvoiceData extends InvoiceDraft {
  invoiceNumber: string;
  issuedAt: string;
}

export const COMPANY = db.company;

export const SERVICE_CATALOG = [
  'Tour Package',
  'Air Ticketing',
  'Hotel / Resort Booking',
  'Visa Assistance',
  'Travel Insurance',
  'Airport Transfer',
  'Rail & Bus Booking',
  'Passport Assistance',
  'Forex / Currency',
  'Cruise Booking',
  'MICE / Corporate Event',
  'Event & Wedding Travel',
] as const;

export const OTHER_LEAD_SOURCE = 'Other (specify)';

export const LEAD_SOURCE_GROUPS = [
  {
    label: 'OTA / Portals',
    options: ['MakeMyTrip', 'Goibibo', 'Yatra', 'Booking.com', 'Agoda', 'Expedia', 'TripAdvisor'],
  },
  {
    label: 'Direct / Referral',
    options: ['Website Enquiry', 'Instagram', 'Facebook', 'WhatsApp', 'Referral', 'Walk-in', 'Corporate / B2B', 'Repeat Customer'],
  },
] as const;

// Placeholder copy — swap for the real per-package inclusions once the final
// itinerary is confirmed with the customer.
export const INCLUSIONS_PLACEHOLDER = [
  'Accommodation on twin-sharing basis in the confirmed hotel category',
  'Daily breakfast and meals as per the final itinerary',
  'All transfers and sightseeing by private air-conditioned vehicle',
  'Services of an English-speaking local representative or guide',
  'Applicable government taxes and service charges on the above',
];

export const EXCLUSIONS_PLACEHOLDER = [
  'Airfare and rail fare unless explicitly listed above',
  'Travel insurance, visa fees and statutory charges',
  'Personal expenses such as tips, laundry and telephone charges',
  'Anything not mentioned under inclusions',
];

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (rupees: number): string =>
  INR.format(Number.isFinite(rupees) ? rupees : 0);

export const toPaise = (rupees: number): number => Math.round(rupees * 100);

const pad = (value: number): string => String(value).padStart(2, '0');

// Client-generated reference. A server-issued sequence is required for real
// accounting, since this number can collide across concurrent executives.
export const generateInvoiceNumber = (date: Date = new Date()): string => {
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PI-${stamp}-${suffix}`;
};

export const formatInvoiceDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  );
