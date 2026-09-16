import type { IncomingMessage, ServerResponse } from 'node:http';
import { S3Client } from '@aws-sdk/client-s3';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export const S3_BUCKET =
  process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';

export const AWS_REGION =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1';

let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (cachedS3Client) return cachedS3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.warn('[adminHelper] AWS credentials missing from environment. S3 operations may fail.');
  }

  cachedS3Client = new S3Client({
    region: AWS_REGION,
    credentials:
      accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
  });

  return cachedS3Client;
}

interface RequestWithParsedBody extends IncomingMessage {
  body?: unknown;
}

export const readJsonBody = async <T = any>(
  req: IncomingMessage,
  maxBytes: number = 15 * 1024 * 1024,
): Promise<T> => {
  const preParsed = (req as RequestWithParsedBody).body;
  if (preParsed !== undefined && preParsed !== null) {
    if (typeof preParsed === 'string') {
      try {
        return JSON.parse(preParsed);
      } catch {
        throw new HttpError(400, 'Request body must be valid JSON.');
      }
    }
    return preParsed as T;
  }

  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buffer.length;
    if (size > maxBytes) throw new HttpError(413, 'Request payload too large.');
    chunks.push(buffer);
  }

  if (size === 0) return {} as T;

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
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
