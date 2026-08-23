import json
import urllib.request
import urllib.parse
import ssl
from bs4 import BeautifulSoup
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_url(url):
    url_to_fetch = url.replace("monks-n-monkeys.com//", "monks-n-monkeys.com/").strip()
    
    # Fix encoding for spaces or special characters in URL
    parts = urllib.parse.urlsplit(url_to_fetch)
    encoded_path = urllib.parse.quote(parts.path)
    url_to_fetch = urllib.parse.urlunsplit((parts.scheme, parts.netloc, encoded_path, parts.query, parts.fragment))
    
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(
            url_to_fetch, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
            return url, html
    except Exception as e:
        print(f"Failed {url_to_fetch}: {e}")
        return url, None

def extract_price(html):
    if not html:
        return None
    soup = BeautifulSoup(html, 'html.parser')
    
    # First look for a span with class containing 'price'
    for el in soup.find_all('span', class_=re.compile(r'price', re.I)):
        el_text = el.get_text(strip=True)
        m = re.search(r'([\d,]{4,})', el_text)
        if m:
            return m.group(1)
            
    text = soup.get_text(separator=' ')
    if "Price on Request" in text or "Price On Request" in text or "price on request" in text.lower():
        return "Price on Request"
        
    m = re.search(r'(?:Rs\.?|INR|₹|\bfa-inr\b)[^\d]*([\d,]{4,})', text, re.I)
    if m:
        return m.group(1)
        
    m = re.search(r'([\d]{1,3}(?:,\d{3})+)', text)
    if m:
        return m.group(1)
        
    return None

def normalize_price(p):
    if not p: return None
    p = str(p)
    if "request" in p.lower():
        return "Price on Request"
    m = re.search(r'([\d,]+)', p)
    if m:
        return m.group(1)
    return p.strip()

def main():
    urls_path = Path("E:/MNM_Website/scraped_urls.json")
    db_path = Path("E:/MNM_Website/src/data/mnm_database.json")
    
    urls = json.loads(urls_path.read_text(encoding='utf-8'))
    db = json.loads(db_path.read_text(encoding='utf-8'))
    
    db_prices = {}
    for pkg in db.get('packages', []):
        slug = pkg.get('slug')
        price = pkg.get('price')
        if slug:
            db_prices[slug] = normalize_price(price)
            
    live_prices = {}
    comparison = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(fetch_url, url): url for url in urls}
        
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                res_url, html = future.result()
                slug = res_url.rstrip('/').split('/')[-1]
                # decode urlencoded slug
                slug = urllib.parse.unquote(slug).strip()
                price = extract_price(html)
                norm_price = normalize_price(price)
                
                live_prices[slug] = price if price else "Not Found"
                
                db_price = db_prices.get(slug)
                if db_price is None:
                    alt_slug = slug.replace('_', '-')
                    db_price = db_prices.get(alt_slug, "Not in DB")
                    
                if str(norm_price) != str(db_price):
                    comparison.append(f"| {slug} | {db_price} | {norm_price} |")
            except Exception as e:
                print(f"Error on {url}: {e}")
                
    Path("E:/MNM_Website/live_prices.json").write_text(json.dumps(live_prices, indent=2), encoding='utf-8')
    
    artifact_content = "# Price Comparison\n\n| Slug | DB Price | Live Price |\n|---|---|---|\n" + "\n".join(comparison)
    Path("C:/Users/Windows/.gemini/antigravity/brain/1335c99d-ede3-4515-9f77-06f1215356cd/price_comparison.md").write_text(artifact_content, encoding='utf-8')
    print("Done")

if __name__ == "__main__":
    main()
