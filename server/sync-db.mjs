import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

console.log('[sync-db] Starting S3 database synchronization...');

const BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
const REGION = process.env.AWS_REGION || 'ap-south-1';

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

const syncList = [
  { key: 'database/blogs_database.json', local: 'src/data/blogs_database.json' },
  { key: 'database/team.json', local: 'src/data/team.json' },
  { key: 'database/support_routing.json', local: 'src/data/support_routing.json' },
  { key: 'database/site_settings.json', local: 'src/data/site_settings.json' },
];

async function run() {
  for (const item of syncList) {
    const targetPath = path.resolve(process.cwd(), item.local);
    try {
      const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: item.key });
      const response = await s3.send(cmd);
      const data = await response.Body.transformToString();
      fs.writeFileSync(targetPath, data, 'utf8');
      console.log(`[sync-db] Successfully synced ${item.key} -> ${item.local}`);
    } catch (err) {
      console.warn(`[sync-db] Notice: Could not download ${item.key} from S3 (${err.name || err.message}). Using local fallback.`);
    }
  }
  console.log('[sync-db] Synchronization complete.');
}

run();
