import fs from 'fs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

console.log('[sync-db] Downloading latest blogs database from S3...');

const BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
const REGION = process.env.AWS_REGION || 'ap-south-1';
const KEY = 'database/blogs_database.json';

const s3 = new S3Client({
  region: REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

async function run() {
  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: KEY });
    const response = await s3.send(cmd);
    const data = await response.Body.transformToString();
    fs.writeFileSync('./src/data/blogs_database.json', data, 'utf8');
    console.log('[sync-db] Successfully synced blogs_database.json from S3.');
  } catch (err) {
    console.warn(`[sync-db] Failed to download from S3 (${err.name}). Using local fallback.`);
  }
}

run();
