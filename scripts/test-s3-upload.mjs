#!/usr/bin/env node
/**
 * test-s3-upload.mjs — Pre-flight check for the blog image migration.
 *
 * Usage:  node scripts/test-s3-upload.mjs
 *
 * Verifies, in order:
 *   1. AWS credentials resolve (from the environment or ~/.aws — the same
 *      provider chain the migration script uses).
 *   2. The bucket exists and is reachable (HeadBucket).
 *   3. A small test JPEG can be uploaded (PutObject to
 *      blog-images/test-upload.jpg) — proves s3:PutObject permission.
 *   4. The object is there (HeadObject).
 *   5. The public URL actually serves the image (HTTP 200) — proves the
 *      bucket policy / CloudFront setup lets the website read it.
 *   6. Cleanup (DeleteObject) — proves s3:DeleteObject.
 *
 * Exits 0 when everything passes, 1 otherwise, with a plain-language
 * diagnosis for each failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  S3Client, HeadBucketCommand, PutObjectCommand, HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Same .env loading as the migration script: real env wins, then .env.local.
for (const file of ['.env.local', '.env']) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

const S3_BUCKET = process.env.S3_BUCKET || '';
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
const CLOUDFRONT = (process.env.AWS_CLOUDFRONT_DOMAIN || '')
  .replace(/^https?:\/\//, '').replace(/\/$/, '');
const TEST_KEY = 'blog-images/test-upload.jpg';

// Minimal valid 1x1 white JPEG (125 bytes).
const TEST_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmAA//9k=',
  'base64',
);

const step = (ok, label, detail = '') => {
  console.log(`${ok ? '  [OK]  ' : '  [FAIL]'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) process.exitCode = 1;
  return ok;
};

async function main() {
  console.log('--- S3 pre-flight test for blog image migration ---\n');

  if (!S3_BUCKET || S3_BUCKET.startsWith('REPLACE_WITH')) {
    console.error('[FAIL] S3_BUCKET is not set. Fill it in .env.local first.');
    process.exit(1);
  }
  if (!REGION) {
    console.error('[FAIL] AWS_REGION is not set. Fill it in .env.local first.');
    process.exit(1);
  }
  console.log(`Bucket      : ${S3_BUCKET}`);
  console.log(`Region      : ${REGION}`);
  console.log(`Public URL  : ${CLOUDFRONT ? `https://${CLOUDFRONT}/...` : 'direct S3'}\n`);

  const s3 = new S3Client({ region: REGION });

  // 1. Credentials + 2. bucket reachable
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    step(true, 'Credentials work and bucket is reachable');
  } catch (err) {
    const name = err.name || '';
    let hint;
    if (name === 'CredentialsProviderError' || /Could not load credentials/i.test(err.message)) {
      hint = 'No AWS credentials found. Add AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY to '
        + '.env.local, or create ~/.aws/credentials.';
    } else if (name === 'NoSuchBucket' || err.$metadata?.httpStatusCode === 404) {
      hint = `Bucket "${S3_BUCKET}" does not exist in region ${REGION}. Check the name and region.`;
    } else if (err.$metadata?.httpStatusCode === 403) {
      hint = 'Credentials resolved but are denied s3:ListBucket on this bucket — check the IAM policy.';
    } else if (name === 'RegionError' || /region/i.test(err.message)) {
      hint = 'Wrong region for this bucket — check AWS_REGION.';
    }
    step(false, 'Bucket reachability check', hint || `${name}: ${err.message}`);
    return;
  }

  // 3. Upload
  try {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: TEST_KEY,
      Body: TEST_JPEG,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    step(true, 'Upload (PutObject)');
  } catch (err) {
    const hint = err.$metadata?.httpStatusCode === 403
      ? 'IAM user is missing s3:PutObject on this bucket (or Block Public Access / '
        + 'bucket-policy restrictions).'
      : `${err.name}: ${err.message}`;
    step(false, 'Upload (PutObject)', hint);
    return;
  }

  // 4. Object exists
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: TEST_KEY }));
    step(true, `Object present (HeadObject, ${head.ContentLength} bytes)`);
  } catch (err) {
    step(false, 'Object present (HeadObject)', `${err.name}: ${err.message}`);
  }

  // 5. Public readability via the URL the website will use
  const publicUrl = CLOUDFRONT
    ? `https://${CLOUDFRONT}/${TEST_KEY}`
    : `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${TEST_KEY}`;
  try {
    const res = await fetch(publicUrl, { method: 'GET' });
    const isImage = (res.headers.get('content-type') || '').startsWith('image/');
    if (res.ok && isImage) {
      step(true, `Public URL serves the image (${publicUrl})`);
    } else {
      step(false, `Public URL serves the image (${publicUrl})`,
        `HTTP ${res.status}, content-type ${res.headers.get('content-type') || 'unknown'}. `
        + (CLOUDFRONT
          ? 'Check the CloudFront distribution: origin must point at this bucket and the path must be public.'
          : 'The bucket is not publicly readable. Attach a bucket policy allowing s3:GetObject '
            + 'for everyone on this prefix, or set AWS_CLOUDFRONT_DOMAIN to serve via CloudFront.'));
    }
  } catch (err) {
    step(false, `Public URL serves the image (${publicUrl})`, err.message);
  }

  // 6. Cleanup
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: TEST_KEY }));
    step(true, 'Cleanup (DeleteObject)');
  } catch (err) {
    step(false, 'Cleanup (DeleteObject)', `${err.name}: ${err.message}`);
  }

  console.log('\n' + (process.exitCode
    ? '--- Pre-flight FAILED — fix the issues above before the full migration. ---'
    : '--- Pre-flight passed — you are ready to run the full migration. ---'));
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
