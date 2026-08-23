import json
import urllib.request
import urllib.parse
import re
import time

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

def get_images_for_term(term):
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(term + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|size|extmetadata&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bot'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if 'query' not in data or 'pages' not in data['query']:
                return []
            
            pages = data['query']['pages']
            images = []
            for page_id, page in pages.items():
                if 'imageinfo' in page:
                    info = page['imageinfo'][0]
                    # Filter out tiny images and maps
                    title = page.get('title', '').lower()
                    if info['width'] >= 800 and 'map' not in title and 'logo' not in title:
                        images.append(info['url'].split('?')[0]) # Remove tracking params
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
        # e.g. Delhi Agra Jaipur -> Delhi Agra
        term = " ".join(parts[:2])
    else:
        term = " ".join(parts)
        
    return term.strip()

print(f"Testing search terms for first 5 packages...")
for pkg in db['packages'][:5]:
    term = clean_term(pkg)
    print(f"Package: {pkg['name']} -> Search Term: {term}")
    imgs = get_images_for_term(term)
    print(f"  Found {len(imgs)} images. First: {imgs[0] if imgs else 'None'}")
    time.sleep(0.5)

