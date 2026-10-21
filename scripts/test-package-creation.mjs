import assert from 'assert';

const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

async function run() {
  console.log('--- Testing Package Creation Flow ---');

  const testId = String(Date.now());
  const testName = `Automated Test Package ${testId}`;
  const testExpiry = new Date(Date.now() + 30 * 86400000).toISOString();
  // Valid S3 package image URL using the publicly accessible blog-images prefix
  const testImageUrl = 'https://mnm-travels-images-105943719409-ap-south-1-an.s3.ap-south-1.amazonaws.com/blog-images/package-images/the-ultimate-northeast-india-experience/Meghalaya-1792577979756.jpg';

  const payload = {
    id: testId,
    name: testName,
    title: testName,
    slug: `automated-test-${testId}`,
    description: '<p>This is an automated test package created to verify DynamoDB creation flow.</p>',
    overview: '<p>This is an automated test package created to verify DynamoDB creation flow.</p>',
    startingPrice: '14999',
    expiryDate: testExpiry,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    featuredImage: testImageUrl,
    image_url: testImageUrl,
    heroImage: testImageUrl,
    image: testImageUrl,
    img: testImageUrl,
    galleryImages: [
      {
        url: testImageUrl,
        alt: 'Meghalaya Valley',
        caption: 'Scenic view of Meghalaya'
      }
    ],
    imageOrder: [testImageUrl]
  };

  console.log('1. Verifying Image URL accessibility...');
  const imgRes = await fetch(testImageUrl);
  console.log(`   Image HTTP status: ${imgRes.status} (expected: 200)`);
  assert.strictEqual(imgRes.status, 200, 'Image URL must be publicly accessible (200 OK)');

  console.log('2. Sending POST payload to API Gateway / DynamoDB...');
  const postRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(`   POST response status: ${postRes.status} ${postRes.statusText}`);
  const postBody = await postRes.text();
  console.log(`   POST response body: ${postBody}`);
  assert.strictEqual(postRes.status, 200, `POST must return 200 OK, got ${postRes.status}: ${postBody}`);

  console.log('3. Fetching all packages via GET to verify package is in DynamoDB...');
  const getRes = await fetch(`${API_URL}?_=${Date.now()}`);
  const all = await getRes.json();
  const items = Array.isArray(all) ? all : (all.Items ?? all.items ?? all.packages ?? []);
  const found = items.find((p) => p.id === testId || p.name === testName);
  assert.ok(found, `Newly created package with ID ${testId} must be present in DynamoDB items`);
  console.log(`   Found package in DynamoDB: ID=${found.id}, Name="${found.name}", Expiry=${found.expiryDate}`);

  console.log('4. Cleaning up test package via DELETE...');
  const delRes = await fetch(`${API_URL}/${testId}`, { method: 'DELETE' });
  console.log(`   DELETE status: ${delRes.status}`);
  assert.strictEqual(delRes.status, 200, 'DELETE must return 200 OK');

  console.log('5. Verifying package was deleted...');
  const getAfterDel = await fetch(`${API_URL}?_=${Date.now()}`);
  const allAfter = await getAfterDel.json();
  const itemsAfter = Array.isArray(allAfter) ? allAfter : (allAfter.Items ?? allAfter.items ?? allAfter.packages ?? []);
  const foundAfter = itemsAfter.find((p) => p.id === testId);
  assert.strictEqual(foundAfter, undefined, 'Package must be completely deleted from DynamoDB');

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

run().catch((err) => {
  console.error('\n[TEST FAILED]:', err);
  process.exit(1);
});
