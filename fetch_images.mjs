import fs from 'fs';

const dbPath = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function fetchImage(query) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(query)}&gsrlimit=2&prop=imageinfo&iiprop=url|size&iiurlwidth=1280`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { headers: { 'User-Agent': 'MNMTravel/4.0' }, signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        const pages = data?.query?.pages;
        if (pages) {
            for (let id in pages) {
                const info = pages[id].imageinfo?.[0];
                if (info?.thumburl) return info.thumburl;
                if (info?.url) return info.url;
            }
        }
    } catch (e) {
        // ignore
    }
    return `https://via.placeholder.com/1280x720?text=${encodeURIComponent(query)}`;
}

async function run() {
    let pending = [];
    for (let p of db.packages) {
        if (!p.image_url || p.image_url.includes('placeholder') || p.image_url.includes('loremflickr')) {
            pending.push(p);
        }
    }
    
    console.log(`Fetching images for ${pending.length} packages...`);
    
    // Concurrency of 10
    while (pending.length > 0) {
        const batch = pending.splice(0, 10);
        await Promise.all(batch.map(async (p) => {
            const query = (p.destination || p.title.split(' ')[0]) + ' tourism';
            const img = await fetchImage(query);
            p.image_url = img;
            p.img = img;
            p.image = img;
            p.heroImage = img;
            p.gallery = [img, img];
            console.log(`Updated: ${p.title}`);
        }));
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Finished updating images!');
}

run();
