import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  HttpError,
  createRazorpayOrder,
  findMissingCredentials,
  hasTrustedOrigin,
  isTestMode,
  readJsonBody,
  sendJson,
} from '../server/razorpay.js';

/**
 * POST /api/create-order
 * Creates a Razorpay order server-side so the amount is tied to an order the
 * secret holder approved, and returns only the order id + public key id.
 *
 * GET /api/create-order
 * Reports whether the server credentials are configured (no values returned).
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const missing = findMissingCredentials();
      sendJson(res, 200, { configured: missing.length === 0, missing, testMode: isTestMode() });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      throw new HttpError(405, 'Use POST to create an order.');
    }

    if (!hasTrustedOrigin(req)) {
      throw new HttpError(403, 'Cross-origin order creation is not allowed.');
    }

    const order = await createRazorpayOrder(await readJsonBody(req));

    sendJson(res, 200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID ?? null,
      testMode: isTestMode(),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, { error: error.message });
      return;
    }
    console.error('[create-order] unexpected failure', error);
    sendJson(res, 500, { error: 'Could not create the order.' });
  }
}
