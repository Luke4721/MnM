#!/usr/bin/env node
/**
 * test-relevance.mjs — Offline unit test for the image relevance logic in
 * fetch-blog-images.mjs. No API keys or network needed.
 *
 * Usage: node scripts/test-relevance.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSearchPlan, scoreCandidate } from './fetch-blog-images.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/blogs_database.json'), 'utf-8'),
);
const bySlug = (s) => blogs.find((b) => b.slug.includes(s));

const RELEVANCE_MIN = 0.8;
let pass = 0;
let fail = 0;

function check(blogSlug, imageText, shouldPass, note) {
  const blog = bySlug(blogSlug);
  if (!blog) throw new Error(`blog not found: ${blogSlug}`);
  const plan = extractSearchPlan(blog);
  const result = scoreCandidate({ text: imageText.toLowerCase() }, plan);
  const ok = shouldPass
    ? !result.hardReject && result.score >= RELEVANCE_MIN
    : !!result.hardReject || result.score < RELEVANCE_MIN;
  const verdict = ok ? 'PASS' : 'FAIL';
  if (ok) pass++; else fail++;
  console.log(`[${verdict}] ${blogSlug}`);
  console.log(`        image  : "${imageText}"`);
  console.log(`        score  : ${result.score.toFixed(2)}  matched: [${result.matched.join(', ') || '-'}]`
    + `${result.hardReject ? `  HARD-REJECT (${result.hardReject})` : ''}`);
  console.log(`        expect : ${shouldPass ? 'accepted' : 'rejected'} — ${note}\n`);
}

console.log('--- The four reported failures (bad images must be rejected) ---');
check('reiek-tourism-guide', 'A large brown bear walking through a forest', false, 'the reported bear');
check('assam-tea-gardens', 'Plate of delicious seekh kebabs with grilled meat', false, 'the reported kebabs');
check('north-bay-island', 'A cute golden retriever dog playing in park', false, 'the reported dog');
check('netaji-subhash-chandra', 'Close-up of an antique vintage clock face', false, 'the reported clock');

console.log('--- The images that SHOULD have been found ---');
check('reiek-tourism-guide', 'Trekking through the green hills of Mizoram', true, 'mizoram hills trekking (synonym: hills~mountain)');
check('reiek-tourism-guide', 'Aerial view of Reiek village in Mizoram India', true, 'exact destination');
check('assam-tea-gardens', 'Lush green tea plantation rows in Assam India', true, 'tea plantation assam');
check('north-bay-island', 'Scuba diving over coral reefs at North Bay Island Andaman', true, 'exact destination + scuba');
check('north-bay-island', 'Tropical beach with palm trees in Andaman islands', true, 'same region, beach imagery');
check('netaji-subhash-chandra', 'Ruins of colonial buildings on Ross Island Andaman', true, 'same region, ruins');

console.log('--- Wildlife edge case (animal words are right for a tiger reserve) ---');
check('ranthambore-india-s', 'Bengal tiger walking in Ranthambore national park India', true, 'tiger is the subject');
check('ranthambore-india-s', 'Bengal tiger resting in tall grass', true, 'subject term alone');

console.log('--- Wrong-region / generic noise must stay below threshold ---');
check('reiek-tourism-guide', 'Beautiful beach sunset in Goa India', false, 'wrong region, no shared context');
check('reiek-tourism-guide', 'Old street clock tower in Prague Europe', false, 'object + wrong region');
check('north-bay-island', 'Bustling food market in Delhi India', false, 'food + wrong region');

console.log(`--- ${pass} passed, ${fail} failed ---`);
process.exit(fail ? 1 : 0);
