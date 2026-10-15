import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.S3_BUCKET || 'mnm-travels-images-105943719409-ap-south-1-an';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function run() {
  console.log('Reading local blogs_database.json...');
  const data = fs.readFileSync('./src/data/blogs_database.json', 'utf8');
  
  console.log('Uploading to S3...');
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'database/blogs_database.json',
    Body: data,
    ContentType: 'application/json',
  });
  
  try {
    await s3.send(cmd);
    console.log('Successfully seeded S3 with blogs_database.json!');
  } catch (err) {
    console.error('Failed to upload:', err);
  }
}

run();
