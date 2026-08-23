import json
import urllib.request
import urllib.parse
import re
import time

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

cache = {}

def get_images_for_term(term):
    if term in cache:
        return cache[term]
        
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(term + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|size|extmetadata&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bot'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            images = []
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id, page in pages.items():
                    if 'imageinfo' in page:
                        info = page['imageinfo'][0]
                        title = page.get('title', '').lower()
                        # Filter criteria
                        if info['width'] >= 800 and 'map' not in title and 'logo' not in title and 'icon' not in title:
                            images.append(info['url'].split('?')[0])
            cache[term] = images
            time.sleep(0.5) # rate limit
            return images
    except Exception as e:
        print(f"Error fetching for {term}: {e}")
        return []

def clean_term(pkg):
    term = pkg.get('destination') or pkg.get('location', '')
    if term.lower() in ["outbound itineraries", "domestic itineraries", ""]:
        term = pkg.get('name', '')
    
    term = re.sub(r'(?i)\b(package|tour|nights|days|month|trip|new|special|sale|itinerary)\b', '', term)
    term = re.sub(r'[^a-zA-Z\s]', ' ', term)
    
    parts = term.split()
    if len(parts) > 2:
        term = " ".join(parts[:2])
    else:
        term = " ".join(parts)
        
    if not term.strip():
        term = pkg.get('name', '')
        term = re.sub(r'[^a-zA-Z\s]', ' ', term).strip()
    return term.strip()

print(f"Updating images for {len(db['packages'])} packages...")

updated_count = 0
for pkg in db['packages']:
    term = clean_term(pkg)
    imgs = get_images_for_term(term)
    
    # Fallback to broader term if no images
    if len(imgs) == 0 and ' ' in term:
        term = term.split()[0]
        imgs = get_images_for_term(term)
        
    # If still no images, use a generic beautiful travel image
    if len(imgs) == 0:
        imgs = get_images_for_term("India tourism")
        if len(imgs) == 0:
            continue # Fallback failed
            
    # We have imgs! Let's assign them.
    # We need 1 for hero, 1 for main (image, img, image_url), and 2 for gallery.
    # We can cycle through the images if we have less than 4.
    
    def get_img(index):
        return imgs[index % len(imgs)]
        
    pkg['image_url'] = get_img(0)
    pkg['img'] = get_img(0)
    pkg['image'] = get_img(0)
    
    pkg['heroImage'] = get_img(1)
    
    pkg['gallery'] = [get_img(2), get_img(3)]
    
    # Check if there are other places where images are stored
    # Some might have 'images' array
    if 'images' in pkg:
        pkg['images'] = [get_img(i) for i in range(len(pkg['images']))]
        
    updated_count += 1
    if updated_count % 10 == 0:
        print(f"Processed {updated_count} packages...")

with open('src/data/mnm_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print(f"Success! Updated {updated_count} packages.")
