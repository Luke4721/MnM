import type { IncomingMessage, ServerResponse } from 'node:http';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  getS3Client,
  S3_BUCKET,
  readJsonBody,
  sendJson,
  HttpError,
} from '../../server/adminHelper.ts';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
      res.setHeader('Allow', 'POST, DELETE');
      throw new HttpError(405, 'Use POST or DELETE to remove an image.');
    }

    const body = await readJsonBody<{ urlOrKey?: string }>(req);
    const { urlOrKey } = body;

    if (!urlOrKey) {
      throw new HttpError(400, 'Missing urlOrKey.');
    }

    let key = urlOrKey;
    if (urlOrKey.startsWith('http')) {
      try {
        const u = new URL(urlOrKey);
        key = u.pathname.replace(/^\/+/, '');
      } catch {
        // use as is
      }
    }

    // Safety check: ensure key is inside blog-images or package-images
    if (!key.startsWith('blog-images/') && !key.startsWith('package-images/')) {
      throw new HttpError(403, 'Cannot delete objects outside blog-images or package-images.');
    }

    const s3 = getS3Client();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      }),
    );

    sendJson(res, 200, { success: true, message: `Deleted ${key} from S3.` });
  } catch (error: any) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, { success: false, error: error.message });
      return;
    }
    console.error('[delete-image] S3 deletion failed:', error);
    sendJson(res, 500, { success: false, error: error.message || 'Failed to delete from S3.' });
  }
}
