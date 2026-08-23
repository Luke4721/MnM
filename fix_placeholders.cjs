const fs = require('fs');
const puppeteer = require('puppeteer');
const https = require('https');
const path = require('path');

const DB_PATH = 'src/data/mnm_database.json';
const OUT_DIR = 'public/images/hires';

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

async function downloadImage(url, dest) {
    return new Promise((resolve) => {
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
        }).on('error', () => {
            fs.unlinkSync(dest);
            resolve(false);
        });
    });
}

(async () => {
    let suspiciousPackages = [];
    for (let p of db.packages) {
        if (p.image_url.startsWith('/images/hires/')) {
            let imgName = path.basename(p.image_url);
            let imgPath = path.join(OUT_DIR, imgName);
            if (fs.existsSync(imgPath)) {
                let stats = fs.statSync(imgPath);
                if (stats.size === 184188) {
                    suspiciousPackages.push(p);
                }
            }
        }
    }

    console.log(`Found ${suspiciousPackages.length} packages with the 184KB placeholder.`);

    if (suspiciousPackages.length === 0) {
        console.log("No 184KB placeholders found.");
        return;
    }

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    for (let p of suspiciousPackages) {
        const pkg_id = p.id;
        const destPath = path.join(OUT_DIR, `${pkg_id}.jpg`);
        
        // Improve search query to avoid placeholders
        let query = (p.destination || p.title.split(' ')[0]) + ' landscape nature';
        const searchUrl = `https://pixabay.com/images/search/${encodeURIComponent(query)}/`;
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const images = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.includes('pixabay.com/photo/'));
            });
            
            // Skip the first one if it's the exact same placeholder again! 
            // Wait, I can't know the file size from the frontend.
            // But I can skip the first result and take the second or third result to be safe!
            if (images.length > 1) {
                // take the second image to avoid the placeholder!
                let imgUrl = images[1];
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
                    console.log(`[OK] ${p.title} -> Downloaded new image from Pixabay (2nd result)`);
                }
            } else if (images.length === 1) {
                 let imgUrl = images[0];
                 let hiResUrl = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
                 await downloadImage(hiResUrl, destPath);
            }
        } catch (e) {
            console.log(`[ERR] ${p.title} -> ${e.message}`);
        }
        
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    
    await browser.close();
    console.log("Finished updating placeholders.");
    
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
})();
