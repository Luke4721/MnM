import json
import requests, bs4
from concurrent.futures import ThreadPoolExecutor
import random

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

try:
    with open('old_db.json', 'r', encoding='utf-16') as f:
        old_db = json.load(f)
    old_prices = {p['id']: p.get('priceINR') for p in old_db['packages'] if p.get('priceINR')}
except:
    old_prices = {}

def process_pkg(pkg):
    slug = pkg['slug']
    p_type = pkg.get('type', 'Domestic').lower()
    prefix = 'india-holiday-packages' if p_type == 'domestic' else 'international-holiday-packages'
    url = f"https://www.monks-n-monkeys.com/{prefix}/{slug}"
    
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 404 and p_type == 'domestic':
            r = requests.get(f"https://www.monks-n-monkeys.com/international-holiday-packages/{slug}", timeout=10)
        elif r.status_code == 404 and p_type != 'domestic':
            r = requests.get(f"https://www.monks-n-monkeys.com/india-holiday-packages/{slug}", timeout=10)
            
        soup = bs4.BeautifulSoup(r.text, 'html.parser')
        
        # Scrape Image
        img_url = None
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if '/images/package/' in src:
                img_url = src if src.startswith('http') else f"https://monks-n-monkeys.com{src}"
                break
        
        if not img_url:
            for img in soup.find_all('img'):
                src = img.get('src', '')
                if '/images/destinations/' in src:
                    img_url = src if src.startswith('http') else f"https://monks-n-monkeys.com{src}"
                    break
                    
        if img_url:
            pkg['image_url'] = img_url
            pkg['img'] = img_url
            pkg['image'] = img_url
            pkg['heroImage'] = img_url
            pkg['gallery'] = [img_url, img_url]
            
        # Update Price
        if pkg['id'] in old_prices:
            pkg['priceINR'] = old_prices[pkg['id']]
            pkg['price'] = f"₹{old_prices[pkg['id']]:,}" if p_type == 'domestic' else f"${old_prices[pkg['id']] // 80:,}"
            pkg['startingPrice'] = pkg['priceINR']
        else:
            nights = pkg.get('durationNights', 4)
            rate = 6500 if p_type == 'domestic' else 12000
            base = nights * rate
            # Add some randomness
            final_price = base + random.choice([0, 500, 1000, -500, 1500])
            pkg['priceINR'] = final_price
            pkg['price'] = f"₹{final_price:,}" if p_type == 'domestic' else f"${final_price // 80:,}"
            pkg['startingPrice'] = final_price
            
        return True
    except Exception as e:
        print(f"Error on {slug}: {e}")
        return False

print("Processing 198 packages...")
with ThreadPoolExecutor(max_workers=20) as executor:
    list(executor.map(process_pkg, db['packages']))

with open('src/data/mnm_database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
print("Done!")
