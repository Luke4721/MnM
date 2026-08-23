const fs = require('fs');

const DB_PATH = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

const TRAVEL_IMAGES = [
    'https://www.travellerhelpline.com/images/destinations/87ef736162e6753ad6802e78a834f2f4.jpg',
    'https://www.travellerhelpline.com/images/destinations/5168067617ecc01aca81bfcfa2f60137.jpg',
    'https://www.travellerhelpline.com/images/destinations/7f2eabf6f8cf1798328a56f2c5767ddd.jpg',
    'https://www.travellerhelpline.com/images/destinations/9c904a1b42b78bb14a34bb65cc768a40.jpg',
    'https://www.travellerhelpline.com/images/sameday/sd2.jpg',
    'https://www.monks-n-monkeys.com/images/homegallery/d0d74fa518ccf2c3f270d33d480a52ec.jpg',
    'https://www.monks-n-monkeys.com/images/destinations/2fe32a6cd15137adbe745614d818d297.jpg',
    'https://www.monks-n-monkeys.com/images/destinations/06f36563b0085c2cd98b0d8b4856d9df.jpg',
    'https://www.monks-n-monkeys.com/images/destinations/1b5f40a8d3212d8ec11a9c952df3a8e9.jpg'
];

let fallbackIndex = 0;
let updated = 0;

for (let p of db.packages) {
    const pkg_id = p.id;
    const destPath = `public/images/hires/${pkg_id}.jpg`;
    
    let targetUrl = '';
    
    // If the beautiful Unsplash image exists locally
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
        targetUrl = `/images/hires/${pkg_id}.jpg`;
    } else {
        // Fallback to one of the 9 unique travel photos
        targetUrl = TRAVEL_IMAGES[fallbackIndex % TRAVEL_IMAGES.length];
        fallbackIndex++;
    }
    
    p.image_url = targetUrl;
    p.img = targetUrl;
    p.image = targetUrl;
    p.heroImage = targetUrl;
    p.gallery = [targetUrl, targetUrl];
    updated++;
}

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
console.log(`Updated ${updated} packages in the database.`);

const { execSync } = require('child_process');
try {
    console.log("Rebuilding frontend...");
    execSync('npm run build', { stdio: 'inherit' });
    console.log("Frontend build complete!");
} catch (e) {
    console.log("Frontend build failed:", e.message);
}
