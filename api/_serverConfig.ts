import fs from 'node:fs';
import path from 'node:path';

// Server-only configuration and secrets.
// AWS credentials MUST come from process.env only (e.g. Vercel Project Settings or .env.local).
// NEVER commit secret credentials into this or any other repository file.
// NEVER import this file from src/ or anywhere that could be bundled into the client!

// In local development, load .env.local if present so local runtime has access to credentials
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  try {
    if (typeof (process as any).loadEnvFile === 'function') {
      (process as any).loadEnvFile(envLocalPath);
    } else {
      const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          let v = trimmed.slice(eqIdx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (process.env[k] === undefined) process.env[k] = v;
        }
      }
    }
  } catch {
    // Ignore load errors in environments where .env.local cannot be read
  }
}

export const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY: string = process.env.AWS_SECRET_ACCESS_KEY || '';

export const S3_BUCKET: string =
  process.env.S3_BUCKET ?? 'mnm-travels-images-105943719409-ap-south-1-an';

export const S3_REGION: string =
  process.env.S3_REGION ?? process.env.AWS_REGION ?? 'ap-south-1';

export const VERCEL_DEPLOY_WEBHOOK: string =
  process.env.VERCEL_DEPLOY_WEBHOOK ??
  'https://api.vercel.com/v1/integrations/deploy/prj_EvQWtmw17Bf4icqpqEplu8EilxRw/FZx1l4inJg';

export const ADMIN_API_TOKEN: string =
  process.env.ADMIN_API_TOKEN ??
  process.env.VITE_ADMIN_API_TOKEN ??
  'mnm_admin_secure_token_2026';

export const PUBLIC_SITE_URL: string =
  process.env.PUBLIC_SITE_URL ??
  process.env.VITE_SITE_URL ??
  'https://www.mnmtravels.com';

export function assertAwsCredentials() {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('Server config missing: AWS credentials not configured.');
  }
}

export default {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_REGION,
  VERCEL_DEPLOY_WEBHOOK,
  ADMIN_API_TOKEN,
  PUBLIC_SITE_URL,
};
