// Public / client-safe config. Imported by src/ and api/.
// Committed defaults guarantee zero-config deployment.
// Any env vars in .env.local or environment provide optional overrides.

declare const process: {
  env?: Record<string, string | undefined>;
} | undefined;

const getEnv = (key: string, ...fallbackKeys: string[]): string | undefined => {
  if (typeof process !== 'undefined' && process?.env) {
    if (process.env[key]) return process.env[key];
    for (const fk of fallbackKeys) {
      if (process.env[fk]) return process.env[fk];
    }
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv[key]) return metaEnv[key];
    for (const fk of fallbackKeys) {
      if (metaEnv[fk]) return metaEnv[fk];
    }
  }
  return undefined;
};

export const S3_BUCKET: string =
  getEnv('S3_BUCKET') ?? 'mnm-travels-images-105943719409-ap-south-1-an';

export const S3_REGION: string =
  getEnv('S3_REGION', 'AWS_REGION') ?? 'ap-south-1';

export const VERCEL_DEPLOY_WEBHOOK: string =
  getEnv('VERCEL_DEPLOY_WEBHOOK') ??
  'https://api.vercel.com/v1/integrations/deploy/prj_EvQWtmw17Bf4icqpqEplu8EilxRw/FZx1l4inJg';

export const ADMIN_API_TOKEN: string =
  getEnv('ADMIN_API_TOKEN', 'VITE_ADMIN_API_TOKEN') ??
  'mnm_admin_secure_token_2026';

export const PUBLIC_SITE_URL: string =
  getEnv('PUBLIC_SITE_URL', 'VITE_SITE_URL') ??
  'https://www.mnmtravels.com';

export const CONTACT_EMAIL: string =
  getEnv('CONTACT_EMAIL') ??
  'concierge@mnmtravels.com';

export const PACKAGES_API_URL: string =
  getEnv('VITE_PACKAGES_API_URL', 'PACKAGES_API_URL') ??
  'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

export default {
  S3_BUCKET,
  S3_REGION,
  VERCEL_DEPLOY_WEBHOOK,
  ADMIN_API_TOKEN,
  PUBLIC_SITE_URL,
  CONTACT_EMAIL,
  PACKAGES_API_URL,
};
