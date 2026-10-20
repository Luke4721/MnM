import type { IncomingMessage, ServerResponse } from 'node:http';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  S3_BUCKET,
  S3_REGION,
  ADMIN_API_TOKEN,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from '../_serverConfig.ts';

function getS3Client(): S3Client {
  return new S3Client({
    region: S3_REGION,
    credentials:
      AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
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

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<any> {
  try {
    // Fail loud if config is unresolved
    if (!S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return sendJson(res, 500, {
        success: false,
        error: 'Server config missing: check api/_serverConfig.ts',
      });
    }

    if (req.method !== 'POST' && req.method !== 'DELETE') {
      if (res.setHeader) res.setHeader('Allow', 'POST, DELETE');
      return sendJson(res, 405, { success: false, error: 'Use POST or DELETE to remove an image.' });
    }

    const expectedToken = ADMIN_API_TOKEN;
    const headerToken = req.headers['x-admin-token'];
    const token = Array.isArray(headerToken) ? headerToken[0] : headerToken;
    if (!token || token !== expectedToken) {
      return sendJson(res, 401, {
        success: false,
        error: 'Unauthorized: missing or invalid x-admin-token header.',
      });
    }

    const body = await readJsonBody<{ urlOrKey?: string }>(req);
    const { urlOrKey } = body;

    if (!urlOrKey) {
      return sendJson(res, 400, { success: false, error: 'Missing urlOrKey.' });
    }

    let key = urlOrKey;
    if (urlOrKey.startsWith('http')) {
      try {
        const parsed = new URL(urlOrKey);
        key = parsed.pathname.replace(/^\/+/, '');
      } catch {
        key = urlOrKey;
      }
    }

    // Safety check: ensure key is inside allowed image directories
    const allowedPrefixes = ['blog-images/', 'package-images/', 'team-images/'];
    if (!allowedPrefixes.some((p) => key.startsWith(p))) {
      return sendJson(res, 403, { success: false, error: 'Cannot delete objects outside image folders.' });
    }

    const s3 = getS3Client();
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3.send(deleteCommand);

    return sendJson(res, 200, {
      success: true,
      message: `Successfully deleted ${key} from S3.`,
      key,
    });
  } catch (error: any) {
    console.error('[delete-image] S3 delete failed:', error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Failed to delete image from AWS S3.',
    });
  }
}
