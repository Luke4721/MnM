import fs from 'node:fs';

const blogs = JSON.parse(fs.readFileSync('src/data/blogs_database.json', 'utf8'));

const allImageUrls = new Set();

for (const b of blogs) {
  if (b.featuredImage) allImageUrls.add(b.featuredImage);
  if (b.image) allImageUrls.add(b.image);

  const content = b.content || '';
  const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi);
  if (imgMatches) {
    for (const tag of imgMatches) {
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        allImageUrls.add(srcMatch[1]);
      }
    }
  }
}

const urlList = [...allImageUrls];
console.log('Total unique images across all 600 posts:', urlList.length);
console.log('Sample 5 images:', urlList.slice(0, 5));

// Check in batches using fetch HEAD / GET
async function testUrls() {
  let ok = 0;
  let broken = 0;
  const brokenUrls = [];
  const concurrency = 20;

  for (let i = 0; i < urlList.length; i += concurrency) {
    const chunk = urlList.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (u) => {
      try {
        let res = await fetch(u, { method: 'HEAD' });
        if (res.status === 405 || res.status === 403) {
          // Some CDNs disallow HEAD, retry with Range GET of 1 byte
          res = await fetch(u, { headers: { Range: 'bytes=0-0' } });
        }
        if (res.ok || res.status === 206) {
          ok++;
        } else {
          broken++;
          brokenUrls.push({ url: u, status: res.status });
        }
      } catch (e) {
        broken++;
        brokenUrls.push({ url: u, error: e.message });
      }
    }));
    process.stdout.write(`Checked ${ok + broken}/${urlList.length} images...\r`);
  }

  console.log(`\n\nImage Verification Results:`);
  console.log(`✅ OK (200/206): ${ok}`);
  console.log(`❌ Broken: ${broken}`);
  if (brokenUrls.length > 0) {
    console.error('Broken URLs:', brokenUrls);
  }
}

testUrls();
