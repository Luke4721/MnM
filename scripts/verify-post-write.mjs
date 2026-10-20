import fs from 'node:fs';
import path from 'node:path';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const ROOT = process.cwd();
const envLocalPath = path.join(ROOT, '.env.local');
if (fs.existsSync(envLocalPath)) {
  for (const line of fs.readFileSync(envLocalPath, 'utf-8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

console.log('='.repeat(70));
console.log('VERIFICATION STEP 1: S3 BACKUPS VERIFICATION');
console.log('='.repeat(70));

const backupKeys = [
  'database/backups/blogs_database_img_backup_2026-10-20T13-03-54-534Z.json',
  'database/backups/blogs_database_backup_2026-10-20T13-04-55-186Z.json'
];

for (const k of backupKeys) {
  try {
    const res = await s3.send(new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: k
    }));
    console.log(`✅ [S3 BACKUP VERIFIED] ${k}`);
    console.log(`   Size: ${(res.ContentLength / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   LastModified: ${res.LastModified}`);
  } catch (err) {
    console.error(`❌ [S3 BACKUP FAILED] ${k}: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('VERIFICATION STEP 2: SPOT-CHECK 5 RANDOM BLOGS');
console.log('='.repeat(70));

const blogs = JSON.parse(fs.readFileSync('src/data/blogs_database.json', 'utf8'));

// Check 5 blogs that originally had links and images
const testSlugs = [
  'why-the-satras-of-majuli-are-the-soul-of-assamese-culture',
  'radhanagar-beach-asias-award-winning-tropical-paradise-in-andaman',
  'anthropological-museum-discover-the-indigenous-heritage-of-andaman-islands',
  'sarnath-the-sacred-land-of-buddha-s-first-sermon',
  'sikkim-the-most-peaceful-place-in-india-you-need-to-visit-right-now'
];

for (const slug of testSlugs) {
  const dbBlog = blogs.find(b => b.slug === slug);
  const staticPath = path.join(ROOT, 'public/data/blogs', `${slug}.json`);
  const staticBlog = fs.existsSync(staticPath) ? JSON.parse(fs.readFileSync(staticPath, 'utf8')) : null;

  console.log(`\nBlog: ${slug}`);
  console.log(`  - Exists in src/data/blogs_database.json: ${!!dbBlog}`);
  console.log(`  - Exists in public/data/blogs/${slug}.json: ${!!staticBlog}`);

  const dbMnM = (dbBlog?.content || '').match(/mnmtravels\.in/gi);
  const staticMnM = (staticBlog?.content || '').match(/mnmtravels\.in/gi);

  console.log(`  - Occurrences of mnmtravels.in in DB content: ${dbMnM ? dbMnM.length : 0}`);
  console.log(`  - Occurrences of mnmtravels.in in Static file: ${staticMnM ? staticMnM.length : 0}`);

  // Find sample modern links in the content
  const modernLinks = (dbBlog?.content || '').match(/href="(\/blog\/[^"]+|\/packages[^"]*)"/g);
  if (modernLinks) {
    console.log(`  - Sample rewritten link: ${modernLinks[0]}`);
  }
  // Find sample modern S3 images in the content
  const modernImages = (dbBlog?.content || '').match(/src="(https:\/\/[^"]*amazonaws\.com\/blog-images\/legacy\/[^"]+)"/g);
  if (modernImages) {
    console.log(`  - Sample rewritten image: ${modernImages[0]}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('VERIFICATION STEP 5: TOTAL OCCURRENCES OF mnmtravels.in IN DATABASE');
console.log('='.repeat(70));

const dbRaw = fs.readFileSync('src/data/blogs_database.json', 'utf8');
const totalOccurrencesInFile = (dbRaw.match(/mnmtravels\.in/gi) || []).length;
console.log(`Total occurrences of "mnmtravels.in" in blogs_database.json: ${totalOccurrencesInFile}`);

let inContentOccurrences = 0;
for (const b of blogs) {
  const m = (b.content || '').match(/mnmtravels\.in/gi);
  if (m) inContentOccurrences += m.length;
}
console.log(`Total occurrences of "mnmtravels.in" in blog content bodies: ${inContentOccurrences}`);
