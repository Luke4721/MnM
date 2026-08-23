import json, requests, bs4, re, time
from concurrent.futures import ThreadPoolExecutor

def fetch_and_parse(url):
    try:
        r = requests.get(url, timeout=10)
        soup = bs4.BeautifulSoup(r.text, 'html.parser')
        
        # Package Name
        name_tag = soup.find('h1', class_='page-title') or (soup.find_all('h2')[1] if len(soup.find_all('h2')) > 1 else None)
        if not name_tag: return None
        name = name_tag.text.strip()
        if name.lower() == 'login section': return None # invalid page
        
        # ID / Slug
        slug = url.split('/')[-1].lower().replace('_', '-').replace('@', '-')
        
        # Details (Duration, etc)
        duration_text = "04 Nights / 05 Days" # Default
        for b in soup.find_all('b'):
            if 'Nights' in b.text or 'Days' in b.text:
                duration_text = b.text.strip()
                break
                
        # Overview
        overview_text = ""
        ov = soup.find('h2', string=re.compile('Tour Overview', re.I))
        if ov:
            nxt = ov.find_next_sibling('p')
            if nxt: overview_text = nxt.text.strip()
            
        # Itinerary
        itinerary = []
        for h2 in soup.find_all('h2'):
            if 'Day' in h2.text:
                day_title = h2.text.strip()
                match = re.search(r'Day\s*(\d+)', day_title, re.I)
                day_num = int(match.group(1)) if match else (len(itinerary) + 1)
                
                desc = ""
                curr = h2.find_next_sibling()
                while curr and curr.name not in ['h2', 'h1', 'div']:
                    desc += curr.text.strip() + " "
                    curr = curr.find_next_sibling()
                    
                itinerary.append({
                    "day": day_num,
                    "title": day_title,
                    "description": desc.strip()
                })
        
        if not itinerary:
            itinerary = [{"day": 1, "title": "Free Day", "description": overview_text}]
            
        # Determine Domestic vs International from URL
        p_type = "Domestic" if 'india' in url else "International"
        
        pkg = {
          "id": slug,
          "title": name,
          "name": name,
          "price": "₹15,000" if p_type == 'Domestic' else "$500",
          "priceINR": 15000 if p_type == 'Domestic' else 40000,
          "duration": duration_text,
          "nights": duration_text,
          "days": duration_text,
          "locations": name.split()[0],
          "location": name.split()[0],
          "destination": name.split()[0],
          "highlights": [name + " Highlights", "Guided Tour"],
          "category": "Adventure" if "Trek" in name else "Leisure",
          "type": p_type,
          "image_url": "https://via.placeholder.com/1280x720?text=" + name.replace(" ", "+"),
          "img": "https://via.placeholder.com/1280x720?text=" + name.replace(" ", "+"),
          "image": "https://via.placeholder.com/1280x720?text=" + name.replace(" ", "+"),
          "slug": slug,
          "startingPrice": 15000,
          "rating": 4.5,
          "reviewsCount": 100,
          "heroImage": "https://via.placeholder.com/1280x720?text=" + name.replace(" ", "+"),
          "gallery": [
            "https://via.placeholder.com/1280x720?text=" + name.replace(" ", "+"),
            "https://via.placeholder.com/1280x720?text=" + name.replace(" ", "+")
          ],
          "overview": overview_text or f"Enjoy the beautiful {name} package with our premium services.",
          "itinerary": itinerary,
          "inclusions": [
            "Accommodation as per itinerary",
            "Daily breakfast",
            "Transfers and sightseeing"
          ],
          "exclusions": [
            "Airfare",
            "Personal expenses"
          ],
          "durationNights": int(re.search(r'(\d+)\s*Night', duration_text).group(1)) if re.search(r'(\d+)\s*Night', duration_text) else 4,
          "durationDays": int(re.search(r'(\d+)\s*Day', duration_text).group(1)) if re.search(r'(\d+)\s*Day', duration_text) else 5
        }
        print("Parsed:", name)
        return pkg
    except Exception as e:
        print(f"Error parsing {url}: {e}")
        return None

def main():
    with open('scraped_urls_fixed.json') as f:
        urls = json.load(f)
        
    print(f"Fetching {len(urls)} urls...")
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(fetch_and_parse, urls))
        
    valid = [r for r in results if r]
    print(f"Successfully parsed {len(valid)} packages.")
    
    with open('parsed_251_packages.json', 'w', encoding='utf-8') as f:
        json.dump(valid, f, indent=2)

if __name__ == "__main__":
    main()
