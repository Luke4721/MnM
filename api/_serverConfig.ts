import fs from 'node:fs';
import path from 'node:path';

// Server-only secrets (AWS access key + secret).
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

export function assertAwsCredentials() {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('Server config missing: AWS credentials not configured.');
  }
}

export default {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
};
