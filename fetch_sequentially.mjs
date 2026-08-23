import fs from 'fs';
import https from 'https';

const dbPath = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function fetchWikiPageImage(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&pithumbsize=1280&format=json`;
        const req = https.get(url, { headers: { 'User-Agent': 'MNMTravelBot/8.0' } }, (res) => {
            if (res.statusCode !== 200) return resolve(null);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed?.query?.pages;
                    if (pages) {
                        for (let id in pages) {
                            const info = pages[id].thumbnail;
                            if (info?.source) return resolve(info.source);
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
    let pending = [];
    for (let p of db.packages) {
        if (p.image_url && (p.image_url.includes('wikipedia') || p.image_url.includes('placeholder') || p.image_url.includes('loremflickr'))) {
            // we will re-fetch to ensure uniqueness, EXCEPT for the ones that we know are correct (like we fetched earlier).
            // Actually, wait, let's just re-fetch all of them if they match the generic fallback list!
            pending.push(p);
        }
    }
    
    console.log(`Fetching Wikipedia page images for ${pending.length} packages sequentially...`);
    
    for (const p of pending) {
        let query = (p.destination || p.title.split(' ')[0]) + ' tourism';
        if (p.title.toLowerCase().includes('dubai')) query = 'Dubai skyline';
        if (p.title.toLowerCase().includes('kashmir')) query = 'Kashmir tourism';
        if (p.title.toLowerCase().includes('singapore')) query = 'Singapore skyline';
        if (p.title.toLowerCase().includes('nepal')) query = 'Kathmandu';
        if (p.title.toLowerCase().includes('bhutan')) query = 'Thimphu';
        if (p.title.toLowerCase().includes('ayodhya')) query = 'Ram Mandir';
        
        const img = await fetchWikiPageImage(query);
        if (img) {
            p.image_url = img;
            p.img = img;
            p.image = img;
            p.heroImage = img;
            p.gallery = [img, img];
            console.log(`Updated: ${p.title} -> ${img.substring(0, 50)}...`);
        } else {
            console.log(`Failed: ${p.title}`);
        }
        
        // Save incrementally so we don't lose data
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        
        // Sleep to avoid rate limit!
        await sleep(500); 
    }
    console.log('Finished updating images!');
}

run();
