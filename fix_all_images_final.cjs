const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = 'src/data/mnm_database.json';
const OUT_DIR = 'public/images/hires';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Find repeated images and placeholders
let imgCounts = {};
db.packages.forEach(p => {
    let img = p.image || p.image_url;
    if (img) {
        imgCounts[img] = (imgCounts[img] || 0) + 1;
    }
});

let packagesToFix = db.packages.filter(p => {
    let img = p.image || p.image_url;
    if (!img) return true;
    if (img.includes('placeholder.com')) return true;
    if (imgCounts[img] > 1) return true;
    return false;
});

console.log(`Found ${packagesToFix.length} packages needing unique images.`);

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                file.close();
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                resolve(false);
            }
        }).on('error', (err) => {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            resolve(false);
        });
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    for (let p of packagesToFix) {
        const pkg_id = p.id;
        const destPath = path.join(OUT_DIR, `${pkg_id}.jpg`);
        
        let query = (p.location || p.destination || p.title.split(' ')[0]) + ' landscape landmark';
        if (p.title.toLowerCase().includes('kashmir')) query = 'Kashmir valley landscape';
        if (p.title.toLowerCase().includes('kerala')) query = 'Kerala backwaters landscape';
        if (p.title.toLowerCase().includes('ladakh')) query = 'Ladakh landscape mountains';
        if (p.title.toLowerCase().includes('goa')) query = 'Goa beach landscape';
        if (p.title.toLowerCase().includes('andaman')) query = 'Andaman islands beach';
        if (p.title.toLowerCase().includes('sikkim')) query = 'Sikkim landscape';
        if (p.title.toLowerCase().includes('golden triangle')) query = 'Taj Mahal Agra';
        if (p.title.toLowerCase().includes('ayodhya')) query = 'Ayodhya temple';
        if (p.title.toLowerCase().includes('himachal')) query = 'Himachal Pradesh landscape';
        if (p.title.toLowerCase().includes('north east')) query = 'North East India landscape';
        if (p.title.toLowerCase().includes('orissa') || p.title.toLowerCase().includes('kolkata')) query = 'Kolkata architecture landscape';
        
        // Exclude generic terms
        query += ' -passport -map -luggage -traveler';

        const searchUrl = `https://pixabay.com/images/search/${encodeURIComponent(query)}/`;
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const images = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.includes('pixabay.com/photo/'));
            });
            
            if (images.length > 0) {
                const randIndex = Math.floor(Math.random() * Math.min(images.length, 5));
                let imgUrl = images[randIndex];
                let hiResUrl = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
                
                let success = await downloadImage(hiResUrl, destPath);
                if (!success) {
                    success = await downloadImage(imgUrl, destPath);
                }
                
                if (success) {
                    const localUrl = `/images/hires/${pkg_id}.jpg`;
                    p.image_url = localUrl;
                    p.img = localUrl;
                    p.image = localUrl;
                    p.heroImage = localUrl;
                    p.gallery = [localUrl, localUrl];
                    console.log(`[OK] ${p.title} -> Downloaded from Pixabay`);
                } else {
                    console.log(`[FAIL] ${p.title} -> Could not download image`);
                }
            } else {
                console.log(`[FAIL] ${p.title} -> No Pixabay images found for ${query}`);
            }
        } catch (e) {
            console.log(`[ERR] ${p.title} -> ${e.message}`);
        }
        
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        await sleep(500); // reduced sleep to speed up
    }
    
    await browser.close();
    console.log("Agent finished downloading Pixabay hi-res images for all broken/repeated packages.");
})();
