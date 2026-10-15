import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, S3_BUCKET } from '../../server/adminHelper.ts';

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

const SECTION_CONFIG: Record<string, { s3Key: string; localPath: string }> = {
  team: {
    s3Key: 'database/team.json',
    localPath: 'src/data/team.json',
  },
  routing: {
    s3Key: 'database/support_routing.json',
    localPath: 'src/data/support_routing.json',
  },
  settings: {
    s3Key: 'database/site_settings.json',
    localPath: 'src/data/site_settings.json',
  },
};

async function readSectionData(section: string): Promise<any> {
  const conf = SECTION_CONFIG[section];
  if (!conf) throw new Error(`Unknown section: ${section}`);

  try {
    const s3 = getS3Client();
    const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: conf.s3Key });
    const response = await s3.send(cmd);
    const raw = await response.Body?.transformToString();
    if (raw) return JSON.parse(raw);
  } catch (err: any) {
    console.warn(`[site-config] S3 read fallback for ${section}:`, err.message);
  }

  // Local fallback
  const localFile = path.resolve(process.cwd(), conf.localPath);
  if (fs.existsSync(localFile)) {
    return JSON.parse(fs.readFileSync(localFile, 'utf8'));
  }
  return section === 'team' ? [] : {};
}

async function writeSectionData(section: string, data: any): Promise<void> {
  const conf = SECTION_CONFIG[section];
  if (!conf) throw new Error(`Unknown section: ${section}`);

  const jsonString = JSON.stringify(data, null, 2);

  // 1. Try S3
  let s3Success = false;
  try {
    const s3 = getS3Client();
    const cmd = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: conf.s3Key,
      Body: jsonString,
      ContentType: 'application/json',
    });
    await s3.send(cmd);
    s3Success = true;
  } catch (err: any) {
    console.error(`[site-config] S3 write failed for ${section}:`, err);
  }

  // 2. Local fallback write
  try {
    const localFile = path.resolve(process.cwd(), conf.localPath);
    fs.writeFileSync(localFile, jsonString, 'utf8');
  } catch (err: any) {
    console.warn(`[site-config] Local write failed for ${section}:`, err.message);
  }

  // 3. Trigger Vercel deploy webhook if configured
  if (process.env.VERCEL_DEPLOY_WEBHOOK) {
    fetch(process.env.VERCEL_DEPLOY_WEBHOOK, { method: 'POST' }).catch((e) =>
      console.error('[site-config] Deploy webhook failed:', e)
    );
  }

  if (!s3Success && process.env.NODE_ENV === 'production') {
    throw new Error('Failed to persist to AWS S3. Check server AWS credentials.');
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<any> {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const method = req.method?.toUpperCase();
    const section = (url.searchParams.get('section') || 'team').toLowerCase();

    if (!SECTION_CONFIG[section]) {
      return sendJson(res, 400, {
        success: false,
        error: `Invalid section "${section}". Expected "team", "routing", or "settings".`,
      });
    }

    // ==========================================
    // GET: Retrieve section data
    // ==========================================
    if (method === 'GET') {
      const data = await readSectionData(section);
      return sendJson(res, 200, { success: true, section, data });
    }

    // ==========================================
    // POST / PUT: Replace or update section data
    // ==========================================
    if (method === 'POST' || method === 'PUT') {
      const body = await readJsonBody(req);
      if (body === undefined || body === null) {
        return sendJson(res, 400, { success: false, error: 'Request body required.' });
      }

      let payloadToSave: any;

      if (section === 'team') {
        // If a single member is passed with action, or full array
        if (Array.isArray(body)) {
          payloadToSave = body;
        } else if (body.members && Array.isArray(body.members)) {
          payloadToSave = body.members;
        } else if (body.id) {
          // Single item update / add
          const currentList: any[] = await readSectionData('team');
          const index = currentList.findIndex((m) => m.id === body.id);
          if (index !== -1) {
            currentList[index] = { ...currentList[index], ...body };
          } else {
            currentList.push(body);
          }
          payloadToSave = currentList;
        } else {
          return sendJson(res, 400, { success: false, error: 'Invalid team payload.' });
        }
      } else {
        // routing or settings
        payloadToSave = body.data !== undefined ? body.data : body;
      }

      await writeSectionData(section, payloadToSave);
      return sendJson(res, 200, {
        success: true,
        message: `Successfully updated ${section} configuration.`,
        data: payloadToSave,
      });
    }

    // ==========================================
    // DELETE: Delete a team member or routing key
    // ==========================================
    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      const key = url.searchParams.get('key');

      if (section === 'team') {
        if (!id) return sendJson(res, 400, { success: false, error: 'id parameter required to delete team member.' });
        const currentList: any[] = await readSectionData('team');
        const updated = currentList.filter((m) => m.id !== id);
        await writeSectionData('team', updated);
        return sendJson(res, 200, { success: true, message: `Deleted team member ${id}`, data: updated });
      }

      if (section === 'routing') {
        const destKey = key || id;
        if (!destKey) return sendJson(res, 400, { success: false, error: 'key or id parameter required to delete destination.' });
        const currentMap: Record<string, any> = await readSectionData('routing');
        delete currentMap[destKey];
        await writeSectionData('routing', currentMap);
        return sendJson(res, 200, { success: true, message: `Deleted routing for ${destKey}`, data: currentMap });
      }

      return sendJson(res, 400, { success: false, error: `DELETE not supported for section ${section}` });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return sendJson(res, 405, { success: false, error: `Method ${method} Not Allowed` });
  } catch (error: any) {
    console.error('[site-config-api] Error:', error);
    return sendJson(res, 500, { success: false, error: error.message || 'Internal Server Error' });
  }
}
