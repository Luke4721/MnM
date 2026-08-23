const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = 'src/data/mnm_database.json';
const OUT_DIR = 'public/images/hires';
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

let imgCounts = {};
db.packages.forEach(p => {
    let img = p.image || p.image_url;
    if (img) imgCounts[img] = (imgCounts[img] || 0) + 1;
});

let packagesToFix = db.packages.filter(p => {
    let img = p.image || p.image_url;
    if (!img) return true;
    if (img.includes('placeholder.com')) return true;
    if (img.includes('wikimedia.org')) return true; // all wikimedia are fallbacks or pdfs
    if (imgCounts[img] > 1) return true;
    return false;
});

console.log(`Fixing ${packagesToFix.length} packages via Pixabay...`);

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
            if (!imgs.length) {
                q = 'travel landscape landmark nature';
                await page.goto(`https://pixabay.com/images/search/${encodeURIComponent(q)}/`, { timeout: 10000 });
                imgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i=>i.src).filter(s=>s.includes('pixabay.com/photo/')));
            }
            if (imgs.length) {
                let imgUrl = imgs[i % imgs.length];
                let hiRes = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
                let dest = path.join(OUT_DIR, `${p.id}_f2.jpg`);
                let ok = await downloadImage(hiRes, dest);
                if (!ok) ok = await downloadImage(imgUrl, dest);
                if (ok) {
                    p.image_url = p.img = p.image = `/images/hires/${p.id}_f2.jpg`;
                    p.heroImage = `/images/hires/${p.id}_f2.jpg`;
                    console.log(`[OK] ${p.title}`);
                }
            }
        } catch(e) {}
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    await browser.close();
    console.log("Done");
})();
