import fs from 'fs';
import https from 'https';

const dbPath = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function fetchWikiPageImage(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&pithumbsize=1280&format=json`;
        const req = https.get(url, { headers: { 'User-Agent': 'MNMTravelBot/6.0' } }, (res) => {
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

// Fallbacks if Wikipedia fails
const DIVERSE_FALLBACKS = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/1280px-Taj_Mahal_in_March_2004.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Kashmir_Landscape.jpg/1280px-Kashmir_Landscape.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Kerala_Backwaters.jpg/1280px-Kerala_Backwaters.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Golden_Temple_India.jpg/1280px-Golden_Temple_India.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Burj_Al_Arab_Dubai.jpg/1280px-Burj_Al_Arab_Dubai.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Singapore_Skyline_Night.jpg/1280px-Singapore_Skyline_Night.jpg"
];

async function run() {
    let pending = [];
    for (let p of db.packages) {
        if (p.image_url && (p.image_url.includes('880ebb') || p.image_url.includes('b7ba9d'))) {
            pending.push(p);
        }
    }
    
    console.log(`Fetching Wikipedia page images for ${pending.length} packages...`);
    
    let fallbackIndex = 0;
    while (pending.length > 0) {
        const batch = pending.splice(0, 15);
        await Promise.all(batch.map(async (p) => {
            let query = (p.destination || p.title.split(' ')[0]) + ' tourism';
            if (p.title.toLowerCase().includes('dubai')) query = 'Dubai skyline';
            if (p.title.toLowerCase().includes('kashmir')) query = 'Kashmir tourism';
            if (p.title.toLowerCase().includes('singapore')) query = 'Singapore skyline';
            
            const img = await fetchWikiPageImage(query);
            if (img) {
                p.image_url = img;
                p.img = img;
                p.image = img;
                p.heroImage = img;
                p.gallery = [img, img];
                console.log(`Updated: ${p.title} -> ${img}`);
            } else {
                const fb = DIVERSE_FALLBACKS[fallbackIndex % DIVERSE_FALLBACKS.length];
                fallbackIndex++;
                p.image_url = fb;
                p.img = fb;
                p.image = fb;
                p.heroImage = fb;
                p.gallery = [fb, fb];
                console.log(`Fallback: ${p.title} -> ${fb}`);
            }
        }));
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Finished updating images!');
}

run();
