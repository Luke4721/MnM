import json
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
from pathlib import Path

async def fetch_url(session, url, retries=3):
    url_to_fetch = url.replace("monks-n-monkeys.com//", "monks-n-monkeys.com/")
    for attempt in range(retries):
        try:
            async with session.get(url_to_fetch, timeout=15) as response:
                if response.status == 200:
                    html = await response.text()
                    return url, html
        except Exception:
            pass
        await asyncio.sleep(1)
    return url, None

def extract_price(html):
    if not html: return None
    soup = BeautifulSoup(html, 'html.parser')
    
    for el in soup.find_all('div', class_=re.compile(r'price', re.I)):
        text = el.get_text(strip=True)
        m = re.search(r'([\d]{1,3}(?:,\d{3})+)', text)
        if m: return m.group(1)
        
    for el in soup.find_all(string=re.compile(r'rs|inr|₹', re.I)):
        parent = el.parent.get_text(strip=True)
        m = re.search(r'([\d]{1,3}(?:,\d{3})+)', parent)
        if m: return m.group(1)
        
    return 'Price on Request'

def normalize_price(p):
    if not p: return None
    p = str(p)
    if "request" in p.lower():
        return "Price on Request"
    m = re.search(r'([\d,]+)', p)
    if m:
        return m.group(1)
    return p.strip()

async def main():
    urls_path = Path("E:/MNM_Website/scraped_urls.json")
    db_path = Path("E:/MNM_Website/src/data/mnm_database.json")
    
    urls = json.loads(urls_path.read_text(encoding='utf-8'))
    db = json.loads(db_path.read_text(encoding='utf-8'))
    
    db_prices = {}
    for pkg in db.get('packages', []):
        slug = pkg.get('id')
        price = pkg.get('price')
        if slug:
            db_prices[slug] = normalize_price(price)
            
    live_prices = {}
    comparison = []
    
    # 10 concurrent requests max
    connector = aiohttp.TCPConnector(limit=10)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        for url, html in results:
            raw_slug = url.rstrip('/').split('/')[-1]
            price = extract_price(html)
            norm_price = normalize_price(price)
            
            # Map raw_slug to db slug format
            slug = raw_slug.replace('_', '-')
            
            live_prices[slug] = norm_price if norm_price else "Not Found"
            
            db_price = db_prices.get(slug, "Not in DB")
            
            # Only log if they differ and we actually found a live price
            if str(norm_price) != str(db_price) and norm_price is not None:
                comparison.append(f"| {slug} | {db_price} | {norm_price} |")
                
    Path("E:/MNM_Website/live_prices_robust.json").write_text(json.dumps(live_prices, indent=2), encoding='utf-8')
    
    artifact_content = "# Price Comparison\n\n| Slug | DB Price | Live Price |\n|---|---|---|\n" + "\n".join(comparison)
    Path("C:/Users/Windows/.gemini/antigravity/brain/fd6ae7c0-d488-4a6a-b30c-f7a68d86af22/price_comparison.md").write_text(artifact_content, encoding='utf-8')
    print("Done generating prices.")
    
    # Now update DB
    updated = 0
    for pkg in db.get('packages', []):
        slug = pkg.get('id')
        new_price = live_prices.get(slug)
        if new_price and new_price != "Not Found":
            if "request" in new_price.lower():
                pkg['price'] = "Price on Request"
                pkg['priceINR'] = 0
            else:
                try:
                    num = int(new_price.replace(',', ''))
                    pkg['price'] = f"₹{num:,}"
                    pkg['priceINR'] = num
                    pkg['regularPrice'] = int(num * 1.2)
                except:
                    pkg['price'] = new_price
                    pkg['priceINR'] = 0
            updated += 1
            
    db_path.write_text(json.dumps(db, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Updated {updated} packages in database.")
    
    import subprocess
    subprocess.run("npm run build", shell=True)
    print("Build complete.")

if __name__ == "__main__":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
