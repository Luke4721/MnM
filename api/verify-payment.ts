import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  HttpError,
  hasTrustedOrigin,
  readJsonBody,
  sendJson,
  verifyPaymentSignature,
} from '../server/razorpay.js';

/**
 * POST /api/verify-payment
 * Verifies the checkout signature with RAZORPAY_KEY_SECRET. Only a verified
 * response means the payment is real — never trust the browser's success callback.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new HttpError(405, 'Use POST to verify a payment.');
    }

    if (!hasTrustedOrigin(req)) {
      throw new HttpError(403, 'Cross-origin verification is not allowed.');
    }

    const body = (await readJsonBody(req)) as Record<string, unknown>;
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : '';
    const signature = typeof body.signature === 'string' ? body.signature.trim() : '';

    if (!orderId || !paymentId || !signature) {
      throw new HttpError(400, 'orderId, paymentId and signature are all required.');
    }

    const verified = verifyPaymentSignature({ orderId, paymentId, signature });

    if (!verified) {
      console.warn('[verify-payment] signature mismatch', { orderId, paymentId });
      sendJson(res, 400, { verified: false, error: 'Payment signature did not match.' });
      return;
    }

    sendJson(res, 200, { verified: true, orderId, paymentId });
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, { error: error.message });
      return;
    }
    console.error('[verify-payment] unexpected failure', error);
    sendJson(res, 500, { error: 'Could not verify the payment.' });
  }
}
