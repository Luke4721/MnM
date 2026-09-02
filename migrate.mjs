import fs from 'fs';

const DB_PATH = './src/data/mnm_database.json';
const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

async function migrateData() {
  console.log('Reading local database...');
  const rawData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(rawData);
  const packages = db.packages;

  console.log(`Found ${packages.length} packages. Starting migration to AWS...`);

  let successCount = 0;
  let failCount = 0;

  for (const pkg of packages) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pkg)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`[SUCCESS] Migrated package: ${pkg.id} - ${pkg.name}`);
      successCount++;
    } catch (error) {
      console.error(`[FAILED] Failed to migrate package: ${pkg.id}`, error);
      failCount++;
    }
  }

  console.log('--- Migration Complete ---');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

migrateData();
