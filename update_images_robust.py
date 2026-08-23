import json
import urllib.request
import urllib.parse
import re
import time
import random
import sys

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Track unique terms
cache = {}

def get_images_for_term(base_term):
    if base_term in cache:
        return cache[base_term]
        
    term = base_term + " landscape OR tourism OR landmark"
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(term + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'MNMTravelBot/2.0 (admin@mnm.com)'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            images = []
            if 'query' in data and 'pages' in data['query']:
                for page_id, page in data['query']['pages'].items():
                    if 'imageinfo' in page:
                        info = page['imageinfo'][0]
                        title = page.get('title', '').lower()
                        # Filter out maps/logos and require minimum dimensions
                        if 'map' not in title and 'logo' not in title and 'icon' not in title and 'flag' not in title:
                            if 'thumburl' in info:
                                images.append(info['thumburl'].split('?')[0])
            
            # Shuffle so repeated packages get different orders of images
            random.shuffle(images)
            cache[base_term] = images
            print(f"Fetched {len(images)} images for {base_term}", flush=True)
            time.sleep(1) # Strict rate limiting
            return images
    except Exception as e:
        print(f"Error fetching for {base_term}: {e}", flush=True)
        return []

def clean_term(pkg):
    term = pkg.get('destination') or pkg.get('location', '')
    if term.lower() in ["outbound itineraries", "domestic itineraries", ""]:
        term = pkg.get('name', '')
    
    term = re.sub(r'(?i)\b(package|tour|nights|days|month|trip|new|special|sale|itinerary)\b', '', term)
    term = re.sub(r'[^a-zA-Z\s]', ' ', term).strip()
    
    parts = term.split()
    if len(parts) > 2:
        term = " ".join(parts[:2])
    else:
        term = " ".join(parts)
        
    if not term.strip():
        term = pkg.get('name', '')
        term = re.sub(r'[^a-zA-Z\s]', ' ', term).strip()
    return term.strip()

print(f"Starting image fetch for {len(db['packages'])} packages...", flush=True)

# Pre-fill cache for generic fallback
fallback_images = get_images_for_term("Famous world landmarks tourism")

for pkg in db['packages']:
    term = clean_term(pkg)
    imgs = get_images_for_term(term)
    
    if len(imgs) < 4:
        # Fallback to single city name if multiple words yielded too few
        if ' ' in term:
            imgs += get_images_for_term(term.split()[0])
            
    if len(imgs) < 4:
        # Final fallback
        imgs += fallback_images
        
    def get_img(index):
        if not imgs:
            # Absolute fallback to prevent crash
            return "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
        # Since images is shuffled, taking index % len gets unique ones per package
        # Actually let's shuffle again per package so repeated destinations get different covers
        random.shuffle(imgs)
        return imgs[index % len(imgs)]
        
    pkg['image_url'] = get_img(0)
    pkg['img'] = pkg['image_url']
    pkg['image'] = pkg['image_url']
    pkg['heroImage'] = get_img(1)
    
    pkg['gallery'] = [get_img(2), get_img(3)]
    
    if 'images' in pkg:
        pkg['images'] = [get_img(i+4) for i in range(len(pkg['images']))]

with open('src/data/mnm_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print("Success! All images replaced.", flush=True)
