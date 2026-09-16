import type { IncomingMessage, ServerResponse } from 'node:http';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  getS3Client,
  S3_BUCKET,
  AWS_REGION,
  readJsonBody,
  sendJson,
  HttpError,
} from '../../server/adminHelper.ts';

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
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new HttpError(405, 'Use POST to upload an image.');
    }

    const body = await readJsonBody<UploadPayload>(req);
    const { folder = 'blog-images', slug = 'general', fileName = 'image.jpg', fileType, fileData } = body;

    if (!fileData) {
      throw new HttpError(400, 'Missing fileData (base64 string expected).');
    }

    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const mime = (fileType || 'image/jpeg').toLowerCase();
    if (!allowedMime.includes(mime)) {
      throw new HttpError(400, `Unsupported file format ${mime}. Please upload JPG, PNG, or WebP.`);
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
    } else {
      s3Key = `blog-images/${safeSlug}-${timestamp}.${ext}`;
    }

    const buffer = Buffer.from(fileData, 'base64');
    if (buffer.length > 5.5 * 1024 * 1024) {
      throw new HttpError(413, 'File size exceeds maximum 5MB limit.');
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

    sendJson(res, 200, {
      success: true,
      url: publicUrl,
      key: s3Key,
      fileName,
      size: buffer.length,
    });
  } catch (error: any) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, { success: false, error: error.message });
      return;
    }
    console.error('[upload-image] S3 upload failed:', error);
    sendJson(res, 500, {
      success: false,
      error: error.message || 'Failed to upload image to AWS S3.',
    });
  }
}
