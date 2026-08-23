const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = 'src/data/mnm_database.json';
const OUT_DIR = 'public/images/hires';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

let packagesToFix = db.packages.filter(p => !p.image || !p.image.includes('/hires/'));
console.log(`Fixing ${packagesToFix.length} packages...`);

async function downloadImage(url, dest) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                file.close(); resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.setRequestInterception(true);
    page.on('request', req => ['image','stylesheet','font'].includes(req.resourceType()) ? req.abort() : req.continue());

    for (let i=0; i<packagesToFix.length; i++) {
        let p = packagesToFix[i];
        let term = p.location || p.destination || p.title.split(' ')[0] || "India";
        if (term.toLowerCase().includes('itineraries') || term.toLowerCase() === 'popular' || !term) {
            term = p.title.replace(/Package|Tour/g, '').trim();
        }
        let q = term + ' travel landscape';
        let url = `https://pixabay.com/images/search/${encodeURIComponent(q)}/`;
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            let imgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i=>i.src).filter(s=>s.includes('pixabay.com/photo/')));
            if (!imgs.length) {
                q = term.split(' ')[0] + ' travel';
                await page.goto(`https://pixabay.com/images/search/${encodeURIComponent(q)}/`, { timeout: 10000 });
                imgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i=>i.src).filter(s=>s.includes('pixabay.com/photo/')));
            }
            if (imgs.length) {
                let imgUrl = imgs[i % imgs.length];
                let hiRes = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
                let dest = path.join(OUT_DIR, `${p.id}_f3.jpg`);
                let ok = await downloadImage(hiRes, dest);
                if (!ok) ok = await downloadImage(imgUrl, dest);
                if (ok) {
                    p.image_url = p.img = p.image = `/images/hires/${p.id}_f3.jpg`;
                    p.heroImage = p.image;
                    p.gallery = [p.image, p.image];
                    console.log(`[OK] ${p.title}`);
                }
            }
        } catch(e) {}
    }
    
    // Also enforce heroImage = image for ALL packages to fix any desyncs
    db.packages.forEach(p => {
        if (p.image) {
            p.heroImage = p.image;
            p.image_url = p.image;
        }
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    await browser.close();
    console.log("Done");
})();
