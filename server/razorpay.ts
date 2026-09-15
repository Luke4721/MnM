import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Server-only Razorpay helpers. This module reads RAZORPAY_KEY_SECRET, so it must
 * never be imported by anything under src/ — only by /api functions.
 */

const RAZORPAY_API = 'https://api.razorpay.com/v1';

/** Values that a placeholder .env still contains, treated as "not configured". */
const PLACEHOLDER_MARKERS = ['REPLACE_WITH', 'YOUR_KEY', 'XXXX'];

const looksLikePlaceholder = (value: string | undefined): boolean => {
  if (!value) return true;
  return PLACEHOLDER_MARKERS.some((marker) => value.toUpperCase().includes(marker));
};

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

/** Which required variables are missing or still placeholders. Never returns values. */
export const findMissingCredentials = (): string[] => {
  const missing: string[] = [];
  if (looksLikePlaceholder(process.env.RAZORPAY_KEY_ID)) missing.push('RAZORPAY_KEY_ID');
  if (looksLikePlaceholder(process.env.RAZORPAY_KEY_SECRET)) missing.push('RAZORPAY_KEY_SECRET');
  return missing;
};

export const getCredentials = (): RazorpayCredentials => {
  const missing = findMissingCredentials();
  if (missing.length > 0) {
    throw new HttpError(
      503,
      `Razorpay is not configured on the server. Missing: ${missing.join(', ')}.`,
    );
  }
  return {
    keyId: process.env.RAZORPAY_KEY_ID as string,
    keySecret: process.env.RAZORPAY_KEY_SECRET as string,
  };
};

export const isTestMode = (): boolean => {
  // An unconfigured or placeholder key is not "test mode" — reporting it as such
  // would put a reassuring badge on a deployment that cannot take payments.
  if (findMissingCredentials().length > 0) return false;
  return (process.env.RAZORPAY_KEY_ID ?? '').startsWith('rzp_test_');
};

interface RequestWithParsedBody extends IncomingMessage {
  /** Vercel's Node runtime pre-parses JSON bodies and attaches them here. */
  body?: unknown;
}

export const readJsonBody = async (req: IncomingMessage, maxBytes = 32_000): Promise<unknown> => {
  // On Vercel the body is already parsed and the stream has been consumed, so the
  // stream read below only applies to a raw Node request (the local dev adapter).
  const preParsed = (req as RequestWithParsedBody).body;
  if (preParsed !== undefined && preParsed !== null) {
    if (typeof preParsed === 'string') {
      try {
        return JSON.parse(preParsed);
      } catch {
        throw new HttpError(400, 'Request body must be valid JSON.');
      }
    }
    return preParsed;
  }

  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buffer.length;
    if (size > maxBytes) throw new HttpError(413, 'Request body is too large.');
    chunks.push(buffer);
  }

  if (size === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
};

export const sendJson = (res: ServerResponse, status: number, payload: unknown): void => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
};

/**
 * Rejects a browser request whose Origin does not match the host it was sent to.
 * Requests without an Origin header (server-to-server, curl) are allowed through.
 */
export const hasTrustedOrigin = (req: IncomingMessage): boolean => {
  const origin = req.headers.origin;
  if (!origin) return true;

  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export interface CreateOrderInput {
  amountInRupees: number;
  invoiceNumber: string;
  customerName: string;
  leadSource: string;
  services: string[];
  notes: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

const MAX_AMOUNT_PAISE = 10_000_000_00; // ₹1 crore sanity bound; tighten with MAX_ORDER_AMOUNT_INR
const NOTE_VALUE_LIMIT = 256;

const clampNote = (value: string): string =>
  value.length > NOTE_VALUE_LIMIT ? `${value.slice(0, NOTE_VALUE_LIMIT - 1)}…` : value;

const parseOrderInput = (body: unknown): CreateOrderInput => {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const raw = body as Record<string, unknown>;
  const amountInRupees = Number(raw.amountInRupees);

  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
    throw new HttpError(400, 'amountInRupees must be a positive number.');
  }

  const amountInPaise = Math.round(amountInRupees * 100);

  const configuredMax = Number(process.env.MAX_ORDER_AMOUNT_INR);
  const maxPaise =
    Number.isFinite(configuredMax) && configuredMax > 0
      ? Math.round(configuredMax * 100)
      : MAX_AMOUNT_PAISE;

  if (amountInPaise > maxPaise) {
    throw new HttpError(400, `Amount exceeds the permitted maximum of ₹${maxPaise / 100}.`);
  }

  const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

  const invoiceNumber = toText(raw.invoiceNumber) || `MNM-${Date.now()}`;
  const services = Array.isArray(raw.services)
    ? raw.services.filter((item): item is string => typeof item === 'string').map((item) => item.trim())
    : [];

  return {
    amountInRupees,
    invoiceNumber,
    customerName: toText(raw.customerName),
    leadSource: toText(raw.leadSource),
    services,
    notes: toText(raw.notes),
  };
};

export const createRazorpayOrder = async (body: unknown): Promise<RazorpayOrder> => {
  const { keyId, keySecret } = getCredentials();
  const input = parseOrderInput(body);

  const response = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(input.amountInRupees * 100),
      currency: 'INR',
      receipt: clampNote(input.invoiceNumber),
      notes: {
        invoice_number: clampNote(input.invoiceNumber),
        customer_name: clampNote(input.customerName),
        lead_source: clampNote(input.leadSource),
        services: clampNote(input.services.join(', ')),
        ...(input.notes ? { remarks: clampNote(input.notes) } : {}),
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('[razorpay] order creation failed', response.status, detail.slice(0, 500));
    throw new HttpError(502, 'Razorpay rejected the order. Check the key ID and secret.');
  }

  const order = (await response.json()) as RazorpayOrder;
  if (!order?.id) throw new HttpError(502, 'Razorpay returned an unexpected order response.');

  return order;
};

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

/** HMAC-SHA256 of `${orderId}|${paymentId}` keyed with the secret — Razorpay's check. */
export const verifyPaymentSignature = ({
  orderId,
  paymentId,
  signature,
}: VerifyPaymentInput): boolean => {
  const { keySecret } = getCredentials();

  const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
};
