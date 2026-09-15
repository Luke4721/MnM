/**
 * Razorpay integration.
 *
 * The key SECRET never reaches this file or the browser: orders are created by
 * /api/create-order and payments are verified by /api/verify-payment, both of
 * which hold RAZORPAY_KEY_SECRET server-side. The browser only ever sees a key ID,
 * an order id, and the checkout signature that the server must validate.
 */

/** Public key ID from the build environment; the server response wins when present. */
export const PUBLIC_KEY_ID: string | null =
  import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() || null;

const PUBLIC_KEY_IS_PLACEHOLDER = Boolean(
  PUBLIC_KEY_ID && /REPLACE_WITH|YOUR_KEY|XXXX/i.test(PUBLIC_KEY_ID),
);

export interface RazorpayServerConfig {
  configured: boolean;
  missing: string[];
  testMode: boolean;
}

export interface CreateOrderRequest {
  amountInRupees: number;
  invoiceNumber: string;
  customerName: string;
  leadSource: string;
  services: string[];
  notes?: string;
}

export interface CreatedOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  testMode: boolean;
}

export interface RazorpayPaymentResult {
  paymentId: string;
  orderId: string | null;
  signature: string | null;
}

/** Thrown when the customer closes the checkout without paying. */
export class PaymentDismissedError extends Error {
  constructor() {
    super('Checkout was closed before the payment was completed.');
    this.name = 'PaymentDismissedError';
  }
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: { name?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void; escape?: boolean; backdropclose?: boolean };
}

interface RazorpayCheckout {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** How long to wait for the checkout modal before assuming it never opened. */
const CHECKOUT_OPEN_TIMEOUT_MS = 8000;

const COMPANY_NAME = 'Monks & Monkeys Travels Pvt. Ltd.';
const COMPANY_LOGO = '/images/mnmlogo.png';

const postJson = async <T,>(path: string, body: unknown): Promise<{ status: number; payload: T & { error?: string } }> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!payload) throw new Error(`Unexpected empty response from ${path}.`);

  return { status: response.status, payload };
};

/** Reports whether the server holds usable Razorpay credentials. No values returned. */
export const fetchServerConfig = async (): Promise<RazorpayServerConfig> => {
  try {
    const response = await fetch('/api/create-order', { method: 'GET' });
    if (!response.ok) throw new Error(String(response.status));
    const payload = (await response.json()) as RazorpayServerConfig;
    return {
      configured: Boolean(payload?.configured),
      missing: Array.isArray(payload?.missing) ? payload.missing : [],
      testMode: Boolean(payload?.testMode),
    };
  } catch {
    return { configured: false, missing: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'], testMode: false };
  }
};

/** Creates the order server-side so the browser never sets the payable amount. */
export const createOrder = async (request: CreateOrderRequest): Promise<CreatedOrder> => {
  const { payload } = await postJson<CreatedOrder>('/api/create-order', request);
  if (!payload.orderId) throw new Error('The server did not return an order id.');
  return payload;
};

/** Server-side HMAC check. An unverified payment must never be treated as paid. */
export const verifyPayment = async (payload: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ verified: boolean; error?: string }> => {
  const { payload: result } = await postJson<{ verified: boolean }>('/api/verify-payment', payload);
  return { verified: Boolean(result.verified), error: result.error };
};

const loadCheckoutScript = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);
    if (existing && existing.dataset.loaded === 'true') {
      reject(new Error('Razorpay Checkout did not initialise.'));
      return;
    }

    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () =>
      reject(new Error('Could not load the Razorpay checkout. Check your connection and retry.')),
    );

    if (!existing) {
      script.src = CHECKOUT_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
};

export interface CheckoutOptions {
  keyId: string;
  orderId: string;
  currency: string;
  customerName: string;
  invoiceNumber: string;
  leadSource: string;
  services: string[];
  notes?: string;
}

/**
 * Opens Razorpay Checkout against an existing order and resolves once the payment
 * succeeds. `onLateSuccess` covers the narrow case where Razorpay reports a
 * payment after this call already stopped waiting for the modal.
 */
export async function openRazorpayCheckout(
  options: CheckoutOptions,
  hooks?: { onLateSuccess?: (result: RazorpayPaymentResult) => void },
): Promise<RazorpayPaymentResult> {
  await loadCheckoutScript();

  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('Razorpay Checkout is unavailable in this browser.');

  return new Promise<RazorpayPaymentResult>((resolve, reject) => {
    let settled = false;

    const checkout = new Razorpay({
      key: options.keyId,
      order_id: options.orderId,
      currency: options.currency,
      name: COMPANY_NAME,
      description: `Provisional Invoice ${options.invoiceNumber}`,
      image: `${window.location.origin}${COMPANY_LOGO}`,
      prefill: { name: options.customerName },
      notes: {
        invoice_number: options.invoiceNumber,
        lead_source: options.leadSource,
        services: options.services.join(', '),
        ...(options.notes ? { remarks: options.notes } : {}),
      },
      theme: { color: '#FF9933' },
      handler: (response) => {
        const result: RazorpayPaymentResult = {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id ?? null,
          signature: response.razorpay_signature ?? null,
        };
        if (settled) {
          hooks?.onLateSuccess?.(result);
          return;
        }
        settled = true;
        resolve(result);
      },
      modal: {
        ondismiss: () => {
          if (settled) return;
          settled = true;
          reject(new PaymentDismissedError());
        },
      },
    });

    try {
      checkout.open();
    } catch (error) {
      settled = true;
      reject(error instanceof Error ? error : new Error('Could not open Razorpay Checkout.'));
      return;
    }

    window.setTimeout(() => {
      if (settled) return;

      // Razorpay injects a hidden .razorpay-container when it cannot start (key
      // mismatch, blocked script) and leaves the page behind an invisible overlay
      // with scrolling locked. Recover instead of hanging.
      const container = document.querySelector<HTMLElement>('.razorpay-container');
      const modalIsUp = container !== null && getComputedStyle(container).display !== 'none';
      if (modalIsUp) return;

      document.body.style.overflow = '';
      settled = true;
      reject(new Error('Razorpay Checkout did not open. Verify the key ID and try again.'));
    }, CHECKOUT_OPEN_TIMEOUT_MS);
  });
}

/** Describes why checkout may not be usable yet, or null when everything is set. */
export const describeClientMismatch = (serverKeyId: string | null): string | null => {
  if (serverKeyId && PUBLIC_KEY_ID && !PUBLIC_KEY_IS_PLACEHOLDER && serverKeyId !== PUBLIC_KEY_ID) {
    return 'VITE_RAZORPAY_KEY_ID and the server RAZORPAY_KEY_ID are different keys, so the order and the checkout would not match.';
  }
  return null;
};
