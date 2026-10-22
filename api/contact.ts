import type { IncomingMessage, ServerResponse } from 'node:http';

const ENQUIRIES_API_URL =
  'https://p86hnz1tyf.execute-api.us-east-1.amazonaws.com/prod/enquiries';
const FALLBACK_CONCIERGE_EMAIL = 'concierge@mnmtravels.com';

// Basic in-memory IP rate limiter: 10 requests per 60 seconds
const ipRateMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    ipRateMap.set(ip, { count: 1, expiresAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) {
    return false;
  }
  entry.count += 1;
  return true;
}

function sendJson(res: any, status: number, payload: unknown) {
  if (res && typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload);
  }
  if (res && typeof res.setHeader === 'function' && typeof res.end === 'function') {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
    return;
  }
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function readJsonBody<T = any>(req: IncomingMessage): Promise<T> {
  const preParsed = (req as any).body;
  if (preParsed !== undefined && preParsed !== null) {
    if (typeof preParsed === 'string') {
      try {
        return JSON.parse(preParsed);
      } catch {
        throw new Error('Invalid JSON');
      }
    }
    return preParsed as T;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
  }
  if (chunks.length === 0) return {} as T;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
  } catch {
    throw new Error('Invalid JSON');
  }
}

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  destination?: string;
  message?: string;
  honeypot?: string;
  assignedHelper?: {
    name?: string;
    email?: string;
    phone?: string;
    type?: string;
  };
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<any> {
  const method = req.method?.toUpperCase();

  // CORS Preflight
  if (method === 'OPTIONS') {
    if (res.setHeader) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
      res.statusCode = 204;
      res.end();
      return;
    }
  }

  if (method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
  }

  // Rate Limiting
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';

  if (!checkRateLimit(ip)) {
    return sendJson(res, 429, {
      success: false,
      error: 'Too many requests. Please try again in a few moments.',
    });
  }

  try {
    const body: ContactPayload = await readJsonBody<ContactPayload>(req);

    // Honeypot check for bots
    if (body.honeypot && body.honeypot.trim().length > 0) {
      // Silently accept bot submission without persisting
      return sendJson(res, 200, {
        success: true,
        message: 'Thank you! Your inquiry has been submitted.',
      });
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const destination = (body.destination || '').trim();
    const message = (body.message || '').trim();
    const helper = body.assignedHelper;

    if (!name) {
      return sendJson(res, 400, { success: false, error: 'Full name is required.' });
    }
    if (!email && !phone) {
      return sendJson(res, 400, {
        success: false,
        error: 'Either email or phone number is required to contact you.',
      });
    }

    const leadId = `lead-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const dynamoPayload = {
      id: leadId,
      name,
      email,
      phone,
      packageName: `Concierge: ${destination || 'Custom Itinerary'}`,
      destination: destination || 'Custom Itinerary',
      assignedHelper: helper?.name || 'Concierge Desk',
      helperEmail: helper?.email || FALLBACK_CONCIERGE_EMAIL,
      helperPhone: helper?.phone || '',
      message:
        message ||
        `Customer requested concierge consultation for ${destination || 'Custom Journey'}. Assigned specialist: ${
          helper?.name || 'Concierge Team'
        } (${helper?.email || FALLBACK_CONCIERGE_EMAIL}).`,
      timestamp,
      source: 'concierge_contact_form',
    };

    // 1. Save Lead to AWS DynamoDB via enquiries API
    let dynamoSuccess = false;
    try {
      const dbRes = await fetch(ENQUIRIES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dynamoPayload),
        signal: AbortSignal.timeout(6000),
      });
      if (dbRes.ok) {
        dynamoSuccess = true;
      } else {
        console.warn('[api/contact] DynamoDB returned status:', dbRes.status);
      }
    } catch (err: any) {
      console.error('[api/contact] Failed to persist lead to DynamoDB:', err.message);
    }

    // 2. Outbound Email Notification (via Resend if configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    if (resendApiKey) {
      try {
        const recipient = helper?.email || FALLBACK_CONCIERGE_EMAIL;
        const emailBody = `
          <h2>New Concierge Travel Inquiry</h2>
          <p>A new lead has been submitted through the Monks & Monkeys website contact form.</p>
          <hr />
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Destination / Type:</strong> ${destination || 'Custom Itinerary'}</p>
          <p><strong>Assigned Specialist:</strong> ${helper?.name || 'General Concierge'} (${recipient})</p>
          <p><strong>Message / Notes:</strong> ${message || 'None'}</p>
          <p><strong>Submitted At:</strong> ${timestamp}</p>
        `;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Monks & Monkeys <onboarding@resend.dev>',
            to: [recipient],
            subject: `New Trip Lead: ${name} (${destination || 'Travel Inquiry'})`,
            html: emailBody,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
        } else {
          const emailErr = await emailRes.text();
          console.warn('[api/contact] Resend email dispatch failed:', emailErr);
        }
      } catch (err: any) {
        console.warn('[api/contact] Error sending Resend email notification:', err.message);
      }
    } else {
      console.log(
        '[api/contact] No RESEND_API_KEY configured. Lead successfully registered to DynamoDB.'
      );
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Thank you! Your concierge inquiry has been registered. Our specialist will contact you shortly.',
      leadId,
      dynamoSaved: dynamoSuccess,
      emailSent,
    });
  } catch (error: any) {
    console.error('[api/contact] Handler error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
