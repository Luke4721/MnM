import type { IncomingMessage, ServerResponse } from 'node:http';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3_BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1';

function getS3Client(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  return new S3Client({
    region: AWS_REGION,
    credentials:
      accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
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

interface UploadPayload {
  folder?: string;
  slug?: string;
  fileName?: string;
  fileType?: string;
  fileData?: string; // base64 string
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<any> {
  try {
    if (req.method !== 'POST') {
      if (res.setHeader) res.setHeader('Allow', 'POST');
      return sendJson(res, 405, { success: false, error: 'Use POST to upload an image.' });
    }

    const body = await readJsonBody<UploadPayload>(req);
    const { folder = 'team-images', slug = 'team', fileName = 'image.jpg', fileType, fileData } = body || {};

    if (!fileData) {
      return sendJson(res, 400, { success: false, error: 'Missing fileData (base64 string expected).' });
    }

    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const mime = (fileType || 'image/jpeg').toLowerCase();
    if (!allowedMime.includes(mime)) {
      return sendJson(res, 400, { success: false, error: `Unsupported file format ${mime}. Please upload JPG, PNG, or WebP.` });
    }

    // Determine extension
    let ext = 'jpg';
    if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';

    const safeSlug = (slug || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');

    const timestamp = Date.now();
    let s3Key: string;

    if (folder === 'package-images') {
      const cleanFileName = (fileName || `image-${timestamp}.${ext}`)
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/\.[^/.]+$/, '');
      s3Key = `package-images/${safeSlug}/${cleanFileName}-${timestamp}.${ext}`;
    } else if (folder === 'team' || folder === 'team-images') {
      s3Key = `blog-images/team-${safeSlug}-${timestamp}.${ext}`;
    } else {
      s3Key = `blog-images/${safeSlug}-${timestamp}.${ext}`;
    }

    const buffer = Buffer.from(fileData, 'base64');
    if (buffer.length > 5.5 * 1024 * 1024) {
      return sendJson(res, 413, { success: false, error: 'File size exceeds maximum 5MB limit.' });
    }

    const s3 = getS3Client();
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: mime,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3.send(putCommand);

    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

    return sendJson(res, 200, {
      success: true,
      url: publicUrl,
      key: s3Key,
      fileName,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('[upload-image] S3 upload failed:', error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Failed to upload image to AWS S3.',
    });
  }
}
