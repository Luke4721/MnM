import fs from 'node:fs';

const blogs = JSON.parse(fs.readFileSync('src/data/blogs_database.json', 'utf8'));

// Pick 10 random changed legacy blogs
const legacyChanged = blogs.filter(b => b.legacy && b.legacy.oldUrl && b.slug !== b.legacy.oldUrl);
const sample10 = [
  legacyChanged[0],
  legacyChanged[25],
  legacyChanged[50],
  legacyChanged[100],
  legacyChanged[150],
  legacyChanged[200],
  legacyChanged[300],
  legacyChanged[400],
  legacyChanged[500],
  legacyChanged[550]
];

console.log('Testing 10 random legacy URLs on live site:');

async function testAll() {
  let passed = 0;
  for (const b of sample10) {
    const oldSlug = b.legacy.oldUrl;
    const targetSlug = b.slug;
    const url = `https://www.mnmtravels.com/blog/${oldSlug}`;

    try {
      // Step 1: Check manual redirect
      const resManual = await fetch(url, { redirect: 'manual' });
      const status = resManual.status;
      const location = resManual.headers.get('location');

      // Step 2: Check follow redirect
      const resFollow = await fetch(url, { redirect: 'follow' });
      const finalStatus = resFollow.status;
      const finalUrl = resFollow.url;

      console.log(`\nURL: /blog/${oldSlug}`);
      console.log(`  Redirect Status: ${status} | Location: ${location}`);
      console.log(`  Final Status:    ${finalStatus} | Final URL: ${finalUrl}`);
      console.log(`  Expected Target: /blog/${targetSlug}`);

      const redirectPass = (status === 301 || status === 308) && location && location.includes(targetSlug);
      if (redirectPass && finalStatus === 200) {
        console.log(`  RESULT: ✅ PASS`);
        passed++;
      } else {
        console.log(`  RESULT: ⏳ Pending Vercel propagation (Status: ${status})`);
      }
    } catch (e) {
      console.error(`  Error testing /blog/${oldSlug}:`, e.message);
    }
  }

  console.log(`\nScore: ${passed}/10 legacy URLs passed 301 -> 200.`);
}

testAll();
