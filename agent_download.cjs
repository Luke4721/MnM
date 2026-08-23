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

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        // Unsplash redirects images.unsplash.com sometimes, but usually serves directly.
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 && response.headers.location) {
                https.get(response.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                }).on('error', reject);
            } else {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            }
        }).on('error', reject);
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log(`Starting Hi-Res Unsplash Agent for ${db.packages.length} packages...`);
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Disable unnecessary resources for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    for (let p of db.packages) {
        const pkg_id = p.id;
        const destPath = path.join(OUT_DIR, `${pkg_id}.jpg`);
        
        // Skip if already downloaded and valid
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
            continue;
        }

        let query = (p.destination || p.title.split(' ')[0]) + ' travel';
        if (p.title.toLowerCase().includes('dubai')) query = 'Dubai tourism';
        if (p.title.toLowerCase().includes('kashmir')) query = 'Kashmir landscape';
        if (p.title.toLowerCase().includes('singapore')) query = 'Singapore city';
        if (p.title.toLowerCase().includes('nepal')) query = 'Kathmandu temple';
        if (p.title.toLowerCase().includes('bhutan')) query = 'Bhutan landscape';
        if (p.title.toLowerCase().includes('ayodhya')) query = 'Hindu temple';
        
        const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const images = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.includes('images.unsplash.com/photo-'));
            });
            
            if (images.length > 0) {
                // Get the best image, replace width parameter with 1280 to ensure hi-res but not 4k
                let imgUrl = images[0];
                imgUrl = imgUrl.replace(/&w=\d+/, '&w=1280');
                if (!imgUrl.includes('&w=')) imgUrl += '&w=1280';
                
                await downloadImage(imgUrl, destPath);
                
                const localUrl = `/images/hires/${pkg_id}.jpg`;
                p.image_url = localUrl;
                p.img = localUrl;
                p.image = localUrl;
                p.heroImage = localUrl;
                p.gallery = [localUrl, localUrl];
                
                console.log(`[OK] ${p.title} -> Downloaded hi-res`);
            } else {
                console.log(`[FAIL] ${p.title} -> No Unsplash images found for ${query}`);
            }
        } catch (e) {
            console.log(`[ERR] ${p.title} -> ${e.message}`);
        }
        
        // Save incrementally
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        await sleep(500);
    }
    
    await browser.close();
    console.log("Agent finished downloading and reviewing hi-res images.");
    
    // Rebuild the frontend to bundle the updated database
    const { execSync } = require('child_process');
    try {
        console.log("Rebuilding frontend to bundle the updated database...");
        execSync('npm run build', { stdio: 'inherit' });
        console.log("Frontend build complete!");
    } catch (e) {
        console.log("Frontend build failed:", e.message);
    }
})();
