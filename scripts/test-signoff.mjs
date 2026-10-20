import fs from 'node:fs';

async function testConfirmations() {
  console.log('=== CONFIRMATION 1: Admin Token Protection ===');
  const endpoints = [
    { url: 'https://www.mnmtravels.com/api/admin/blogs', method: 'POST', body: JSON.stringify({ title: 'test' }) },
    { url: 'https://www.mnmtravels.com/api/admin/blogs', method: 'DELETE', body: JSON.stringify({ id: 'test' }) },
    { url: 'https://www.mnmtravels.com/api/admin/upload-image', method: 'POST', body: JSON.stringify({}) },
    { url: 'https://www.mnmtravels.com/api/admin/delete-image', method: 'POST', body: JSON.stringify({}) },
    { url: 'https://www.mnmtravels.com/api/admin/site-config', method: 'PUT', body: JSON.stringify({}) }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: ep.body
      });
      console.log(`${ep.method} ${ep.url} -> ${res.status} ${res.statusText}`);
    } catch (e) {
      console.error(`${ep.method} ${ep.url} error:`, e.message);
    }
  }

  console.log('\n=== CONFIRMATION 2: /api/admin/blogs/version Size ===');
  try {
    const res = await fetch('https://www.mnmtravels.com/api/admin/blogs/version');
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Payload: ${text}`);
    console.log(`Size: ${Buffer.byteLength(text, 'utf8')} bytes (<1 KB: ${Buffer.byteLength(text, 'utf8') < 1024})`);
  } catch (e) {
    console.error('Version error:', e.message);
  }
}

testConfirmations();
