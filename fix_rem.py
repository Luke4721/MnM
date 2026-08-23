import json
import urllib.request
import urllib.parse
import re
import random

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Find repeated images
imgCounts = {}
for p in db['packages']:
    img = p.get('image') or p.get('image_url')
    if img:
        imgCounts[img] = imgCounts.get(img, 0) + 1

to_fix = [p for p in db['packages'] if not p.get('image') or 'placeholder.com' in p.get('image') or imgCounts.get(p.get('image')) > 1]
print(f"Fixing {len(to_fix)} packages with repeated/placeholder images.")

fallback_images = []
def get_images(term):
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(term + ' landscape OR city OR monument')}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'MNMBot'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            imgs = []
            if 'query' in data and 'pages' in data['query']:
                for page_id, page in data['query']['pages'].items():
                    if 'imageinfo' in page:
                        info = page['imageinfo'][0]
                        title = page.get('title', '').lower()
                        if 'map' not in title and 'logo' not in title and 'icon' not in title and 'flag' not in title and 'passport' not in title and 'luggage' not in title:
                            if 'thumburl' in info:
                                imgs.append(info['thumburl'].split('?')[0])
            return imgs
    except:
        return []

fallback = get_images("India famous beautiful landscape")

for p in to_fix:
    term = p.get('destination') or p.get('location', '')
    if term.lower() in ["outbound itineraries", "domestic itineraries", "popular", ""]:
        term = p.get('title', '')
    
    term = re.sub(r'(?i)\b(package|tour|nights|days|month|trip|new|special|sale|itinerary)\b', '', term).strip()
    term = re.sub(r'[^a-zA-Z\s]', ' ', term).strip()
    
    parts = term.split()
    if len(parts) > 2:
        term = " ".join(parts[:2])
    
    imgs = get_images(term)
    if not imgs:
        imgs = get_images(term.split()[0]) if term.split() else []
    if not imgs:
        imgs = fallback
        
    random.shuffle(imgs)
    img_url = imgs[0] if imgs else "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
    
    p['image_url'] = img_url
    p['img'] = img_url
    p['image'] = img_url
    p['heroImage'] = imgs[1] if len(imgs)>1 else img_url
    p['gallery'] = [imgs[2] if len(imgs)>2 else img_url, imgs[3] if len(imgs)>3 else img_url]

with open('src/data/mnm_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print("Fixed!")
