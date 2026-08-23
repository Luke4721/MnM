const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const https = require('https');

const DB_PATH = 'e:/MNM_Website/src/data/mnm_database.json';
const OUT_DIR = 'e:/MNM_Website/public/images/hires';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                https.get(response.headers.location, (res) => {
                    if (res.statusCode === 200) {
                        const newFile = fs.createWriteStream(dest);
                        res.pipe(newFile);
                        newFile.on('finish', () => { newFile.close(); resolve(true); });
                    } else {
                        resolve(false);
                    }
                }).on('error', () => resolve(false));
            } else {
                file.close();
                fs.unlinkSync(dest);
                resolve(false);
            }
        }).on('error', (err) => {
            fs.unlinkSync(dest);
            resolve(false);
        });
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const badImages = new Set();
    const badPackages = [];

    db.packages.forEach(p => {
        let isBad = false;
        const check = (val) => {
            if (!val) return false;
            return val.includes('wikimedia.org') || val.includes('placeholder.com') || val.includes('dummy') || val.includes('Taj_Mahal_%28Edited%29.jpeg');
        };

        if (check(p.image_url) || check(p.img) || check(p.image) || check(p.heroImage)) isBad = true;
        if (p.gallery) {
            p.gallery.forEach(g => { if (check(g)) isBad = true; });
        }

        if (isBad) {
            badPackages.push(p);
        }
    });

    console.log(`Found ${badPackages.length} packages with bad images.`);

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    for (let p of badPackages) {
        const pkg_id = p.id;
        const destPath = path.join(OUT_DIR, `${pkg_id}_fixed.jpg`);
        
        let query = p.locations || p.destination || p.location || p.title;
        query = query.split(',')[0].split('-')[0].trim() + ' landscape travel';
        
        const searchUrl = `https://pixabay.com/images/search/${encodeURIComponent(query)}/`;
        console.log(`Searching for ${query} for package ${p.id}...`);
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const images = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src || img.getAttribute('data-lazy') || img.getAttribute('data-src'))
                    .filter(src => src && src.includes('pixabay.com/photo/'));
            });
            
            if (images.length > 0) {
                let imgUrl = images[0];
                let hiResUrl = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
                
                let success = await downloadImage(hiResUrl, destPath);
                if (!success) {
                    success = await downloadImage(imgUrl, destPath);
                }
                
                if (success) {
                    const localUrl = `/images/hires/${pkg_id}_fixed.jpg`;
                    p.image_url = localUrl;
                    p.img = localUrl;
                    p.image = localUrl;
                    p.heroImage = localUrl;
                    p.gallery = [localUrl, localUrl];
                    console.log(`[OK] ${p.id} -> Downloaded`);
                } else {
                    console.log(`[FAIL] ${p.id} -> Download failed`);
                }
            } else {
                console.log(`[FAIL] ${p.id} -> No images found`);
            }
        } catch (e) {
            console.log(`[ERR] ${p.id} -> ${e.message}`);
        }
        
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        await sleep(1000);
    }
    
    await browser.close();
    console.log("Done.");
})();
