const fs = require('fs');

const DB_PATH = 'src/data/mnm_database.json';
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

let imgCounts = {};
db.packages.forEach(p => {
    let img = p.image || p.image_url;
    if (img) {
        imgCounts[img] = (imgCounts[img] || 0) + 1;
    }
});

let packagesToFix = db.packages.filter(p => {
    let img = p.image || p.image_url;
    if (!img) return true;
    if (img.includes('placeholder.com')) return true;
    if (imgCounts[img] > 1) return true;
    return false;
});

console.log(`Fixing ${packagesToFix.length} packages...`);

async function getImages(term) {
    let query = encodeURIComponent(term + ' landscape monument nature');
    let url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json`;
    try {
        let res = await fetch(url, { headers: { 'User-Agent': 'MNMBot' } });
        let data = await res.json();
        let imgs = [];
        if (data.query && data.query.pages) {
            for (let id in data.query.pages) {
                let p = data.query.pages[id];
                let title = (p.title || "").toLowerCase();
                if (title.includes('map') || title.includes('logo') || title.includes('flag') || title.includes('passport')) continue;
                if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].thumburl) {
                    imgs.push(p.imageinfo[0].thumburl);
                }
            }
        }
        return imgs;
    } catch(e) {
        return [];
    }
}

(async () => {
    let fallback = await getImages("India famous beautiful");
    if (!fallback.length) fallback = ["https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"];

    for (let i=0; i<packagesToFix.length; i++) {
        let p = packagesToFix[i];
        let term = p.location || p.destination || p.title.split(' ')[0] || "India";
        if (term.toLowerCase().includes('itineraries') || term.toLowerCase() === 'popular') {
            term = p.title.replace(/Package|Tour/g, '').trim();
        }
        
        let imgs = await getImages(term);
        if (imgs.length === 0) imgs = await getImages(term.split(' ')[0]);
        if (imgs.length === 0) imgs = fallback;

        // Shuffle images so duplicates get different ones
        imgs = imgs.sort(() => Math.random() - 0.5);
        
        // Ensure uniqueness by picking one based on index
        let imgUrl = imgs[i % imgs.length];
        
        p.image_url = imgUrl;
        p.img = imgUrl;
        p.image = imgUrl;
        p.heroImage = imgs[(i+1)%imgs.length] || imgUrl;
        p.gallery = [imgs[(i+2)%imgs.length] || imgUrl, imgs[(i+3)%imgs.length] || imgUrl];
        
        console.log(`Fixed ${p.title} -> ${imgUrl}`);
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log("Done fixing images!");
})();
