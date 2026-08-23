const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = 'src/data/mnm_database.json';
const OUT_DIR = 'public/images/hires';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Clear out old garbage images
const oldFiles = fs.readdirSync(OUT_DIR);
for (const file of oldFiles) {
    fs.unlinkSync(path.join(OUT_DIR, file));
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
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
    console.log(`Starting Pixabay Agent for ${db.packages.length} packages...`);
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
        const pkg_id = p.id;
        const destPath = path.join(OUT_DIR, `${pkg_id}.jpg`);
        
        let query = (p.destination || p.title.split(' ')[0]) + ' travel';
        if (p.title.toLowerCase().includes('dubai')) query = 'Dubai skyline';
        if (p.title.toLowerCase().includes('kashmir')) query = 'Kashmir valley';
        if (p.title.toLowerCase().includes('singapore')) query = 'Singapore city';
        if (p.title.toLowerCase().includes('nepal')) query = 'Kathmandu temple';
        if (p.title.toLowerCase().includes('bhutan')) query = 'Bhutan landscape';
        if (p.title.toLowerCase().includes('ayodhya')) query = 'Hindu temple';
        if (p.title.toLowerCase().includes('triangle')) query = 'Taj Mahal';
        if (p.title.toLowerCase().includes('classic india')) query = 'Varanasi';
        
        const searchUrl = `https://pixabay.com/images/search/${encodeURIComponent(query)}/`;
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const images = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.includes('pixabay.com/photo/'));
            });
            
            if (images.length > 0) {
                // Get the best image, replace width parameter to 1280
                let imgUrl = images[0];
                let hiResUrl = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
                
                let success = await downloadImage(hiResUrl, destPath);
                if (!success) {
                    // fallback to original resolution if 1280 doesn't exist
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
        await sleep(500); // polite delay
    }
    
    await browser.close();
    console.log("Agent finished downloading Pixabay hi-res images.");
    
    const { execSync } = require('child_process');
    try {
        console.log("Rebuilding frontend...");
        execSync('npm run build', { stdio: 'inherit' });
        console.log("Frontend build complete!");
    } catch (e) {
        console.log("Frontend build failed:", e.message);
    }
})();
