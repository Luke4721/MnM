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
                resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0)');
    
    // Group packages by location
    let groups = {
        'dubai': [],
        'singapore': [],
        'bali': [],
        'thailand': []
    };
    
    for (let p of db.packages) {
        let title = p.title.toLowerCase();
        for (let k in groups) {
            if (title.includes(k)) {
                groups[k].push(p);
            }
        }
    }
    
    for (let loc in groups) {
        let pkgs = groups[loc];
        console.log(`Fixing ${pkgs.length} packages for ${loc}...`);
        
        let searchUrl = `https://pixabay.com/images/search/${loc} landscape architecture/`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const images = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.includes('pixabay.com/photo/'));
        });
        
        for (let i = 0; i < pkgs.length; i++) {
            let p = pkgs[i];
            // skip the first one to avoid placeholders, then take unique index
            let idx = i + 1; 
            if (idx >= images.length) idx = images.length - 1;
            
            let imgUrl = images[idx];
            if (!imgUrl) continue;
            
            let hiResUrl = imgUrl.replace(/_\d+\.jpg/, '_1280.jpg');
            const destPath = path.join(OUT_DIR, `${p.id}.jpg`);
            
            let success = await downloadImage(hiResUrl, destPath);
            if (!success) success = await downloadImage(imgUrl, destPath);
            
            if (success) {
                const localUrl = `/images/hires/${p.id}.jpg`;
                p.image_url = localUrl;
                p.img = localUrl;
                p.image = localUrl;
                p.heroImage = localUrl;
                p.gallery = [localUrl, localUrl];
                console.log(`[OK] ${p.title} -> Unique image index ${idx}`);
            }
        }
        
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    
    await browser.close();
    
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log("Frontend build complete!");
})();
