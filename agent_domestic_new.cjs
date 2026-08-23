const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = 'src/data/mnm_database.json';
const NEW_PKGS_PATH = 'new_packages.json';
const OUT_DIR = 'public/images/hires';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const newPackagesIds = new Set(JSON.parse(fs.readFileSync(NEW_PKGS_PATH, 'utf8')).map(p => p.id));

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
    console.log(`Starting Pixabay Agent for ${newPackagesIds.size} newly added packages...`);
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

    for (let p of db.packages) {
        if (!newPackagesIds.has(p.id)) continue;
        
        const pkg_id = p.id;
        const destPath = path.join(OUT_DIR, `${pkg_id}.jpg`);
        
        let query = (p.location || p.destination || p.title.split(' ')[0]) + ' travel';
        if (p.title.toLowerCase().includes('kashmir')) query = 'Kashmir valley';
        if (p.title.toLowerCase().includes('kerala')) query = 'Kerala backwaters';
        if (p.title.toLowerCase().includes('ladakh')) query = 'Ladakh landscape';
        if (p.title.toLowerCase().includes('goa')) query = 'Goa beach';
        if (p.title.toLowerCase().includes('andaman')) query = 'Andaman islands';
        if (p.title.toLowerCase().includes('sikkim')) query = 'Sikkim landscape';
        if (p.title.toLowerCase().includes('golden triangle')) query = 'Taj Mahal';
        
        const searchUrl = `https://pixabay.com/images/search/${encodeURIComponent(query)}/`;
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const images = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.includes('pixabay.com/photo/'));
            });
            
            if (images.length > 0) {
                const randIndex = Math.floor(Math.random() * Math.min(images.length, 10));
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
        await sleep(1000);
    }
    
    await browser.close();
    console.log("Agent finished downloading Pixabay hi-res images for new packages.");
})();
