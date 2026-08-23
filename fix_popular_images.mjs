import fs from 'fs';
import https from 'https';

const dbPath = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function fetchWikipediaImage(query) {
    return new Promise((resolve) => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(query)}&gsrlimit=2&prop=imageinfo&iiprop=url|size&iiurlwidth=1280`;
        const req = https.get(url, { headers: { 'User-Agent': 'MNMTravelBot/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed?.query?.pages;
                    if (pages) {
                        for (let id in pages) {
                            const info = pages[id].imageinfo?.[0];
                            if (info?.thumburl) return resolve(info.thumburl);
                            if (info?.url) return resolve(info.url);
                        }
                    }
                } catch (e) {}
                resolve(null);
            });
        });
        req.on('error', () => resolve(null));
        req.setTimeout(5000, () => { req.destroy(); resolve(null); });
    });
}

// Ensure the popular packages are mapped right
const kashmir = db.packages.find(p => p.id === '7');
const dubai = db.packages.find(p => p.id === 'best-of-dubai');
const singapore = db.packages.find(p => p.id === 'enriching-singapore');

async function fixSpecificPackage(pkg, query) {
    if (!pkg) return;
    const img = await fetchWikipediaImage(query);
    if (img) {
        pkg.image_url = img;
        pkg.img = img;
        pkg.image = img;
        pkg.heroImage = img;
        pkg.gallery = [img, img];
        console.log(`Fixed ${pkg.title} with Wikipedia image!`);
    } else {
        // Safe fallback to a known good image from the repository
        const fallback = "/images/destinations/880ebb1274cb053bb5eadffc05fcd606.jpg";
        pkg.image_url = fallback;
        pkg.img = fallback;
        pkg.image = fallback;
        pkg.heroImage = fallback;
        pkg.gallery = [fallback, fallback];
        console.log(`Fixed ${pkg.title} with local fallback!`);
    }
}

async function run() {
    await fixSpecificPackage(kashmir, "Dal Lake Kashmir");
    await fixSpecificPackage(dubai, "Burj Khalifa Dubai");
    await fixSpecificPackage(singapore, "Marina Bay Sands Singapore");
    
    // Also fix any remaining place-holders across the entire DB with a local fallback so they don't render as blank boxes!
    let fixed = 0;
    for (let p of db.packages) {
        if (p.image_url && (p.image_url.includes('placeholder') || p.image_url.includes('loremflickr'))) {
            // just use a generic local image so the site doesn't look broken
            const fallback = "/images/destinations/b7ba9d983f69bf9a156c5c92786a3d76.jpg";
            p.image_url = fallback;
            p.img = fallback;
            p.image = fallback;
            p.heroImage = fallback;
            p.gallery = [fallback, fallback];
            fixed++;
        }
    }
    
    console.log(`Replaced ${fixed} remaining broken images with local fallbacks.`);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

run();
