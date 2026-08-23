import fs from 'fs';
import https from 'https';

const dbPath = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function fetchWikiPageImage(query) {
    return new Promise((resolve) => {
        // use action=query&titles instead of generator=search for exact matching
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&pithumbsize=1280&format=json`;
        const req = https.get(url, { headers: { 'User-Agent': 'MNMTravelBot/9.0' } }, (res) => {
            if (res.statusCode !== 200) return resolve(null);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed?.query?.pages;
                    if (pages) {
                        for (let id in pages) {
                            if (id === '-1') continue;
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

const DIVERSE_FALLBACKS = [
    "1280px-Taj_Mahal_in_March_2004.jpg",
    "1280px-Kashmir_Landscape.jpg",
    "1280px-Kerala_Backwaters.jpg",
    "1280px-Golden_Temple_India.jpg",
    "1280px-Burj_Al_Arab_Dubai.jpg",
    "1280px-Singapore_Skyline_Night.jpg"
];

async function run() {
    let pending = [];
    for (let p of db.packages) {
        if (p.image_url && DIVERSE_FALLBACKS.some(f => p.image_url.includes(f))) {
            pending.push(p);
        }
    }
    
    console.log(`Mopping up ${pending.length} failed packages...`);
    
    for (const p of pending) {
        // Try the destination field first, it's usually exactly a city/country
        let query = p.destination || p.title.split(' ')[0];
        
        // Clean up common words
        query = query.replace(/Tour|Package|Trip|Holiday/g, '').trim();
        
        const img = await fetchWikiPageImage(query);
        if (img) {
            p.image_url = img;
            p.img = img;
            p.image = img;
            p.heroImage = img;
            p.gallery = [img, img];
            console.log(`Fixed: ${p.title} with ${query}`);
        } else {
            console.log(`Still failed: ${p.title} (${query})`);
        }
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        await sleep(500);
    }
    console.log('Finished mop up!');
}

run();
