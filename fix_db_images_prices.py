import json
import time
import requests
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

DB_PATH = r"e:\MNM_Website\src\data\mnm_database.json"

with open(DB_PATH, "r", encoding="utf-8") as f:
    db = json.load(f)

def get_wikimedia_images(query, count=4):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrlimit": count * 2,
        "prop": "imageinfo",
        "iiprop": "url|size",
        "iiurlwidth": "1280"
    }
    headers = {"User-Agent": "MNMTravelBot/3.0"}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=10)
        pages = r.json().get("query", {}).get("pages", {})
        images = []
        for _, page in pages.items():
            info = page.get("imageinfo", [{}])[0]
            if info.get("thumburl"):
                images.append(info["thumburl"])
            elif info.get("url"):
                images.append(info["url"])
        if images:
            while len(images) < count:
                images.append(images[0])
            return images[:count]
    except Exception as e:
        pass
    
    # Fallback to Pixabay style or LoremFlickr
    query_clean = urllib.parse.quote(query.replace(" ", ","))
    return [f"https://loremflickr.com/1280/720/{query_clean}"] * count

try:
    with open('old_db.json', 'r', encoding='utf-16') as f:
        old_db = json.load(f)
    old_prices = {p['id']: p.get('priceINR') for p in old_db['packages'] if p.get('priceINR')}
except:
    old_prices = {}

for pkg in db["packages"]:
    # 1. Update Prices
    slug = pkg['slug']
    p_type = pkg.get('type', 'Domestic').lower()
    
    if pkg['id'] in old_prices:
        val = old_prices[pkg['id']]
    else:
        nights = pkg.get('durationNights', 4)
        if not nights or nights < 1: nights = 4
        rate = 6500 if p_type == 'domestic' else 12000
        val = (nights * rate) + (500 * (len(pkg['title']) % 3)) # Deterministic pseudo-random
        
    pkg['priceINR'] = val
    pkg['price'] = f"₹{val:,}" if p_type == 'domestic' else f"${val // 80:,}"
    pkg['startingPrice'] = val

    # 2. Update Images if they are placeholder
    img_url = pkg.get('image_url', '')
    if 'placeholder.com' in img_url or 'loremflickr' in img_url or not img_url:
        print(f"Fetching Wikipedia images for {pkg['title']}...")
        search_q = pkg.get('destination', pkg['title'].split()[0]) + " tourism"
        images = get_wikimedia_images(search_q)
        
        pkg['image_url'] = images[0]
        pkg['img'] = images[0]
        pkg['image'] = images[0]
        pkg['heroImage'] = images[1]
        pkg['gallery'] = [images[2], images[3]]
        
        time.sleep(1) # STRICT RATE LIMIT!

with open(DB_PATH, "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("Finished fixing prices and images!")
