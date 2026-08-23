import requests, bs4
from urllib.parse import urljoin, urlparse
import json

visited = set()
packages = set()

def crawl(url, depth=0):
    if depth > 2 or url in visited: return
    visited.add(url)
    try:
        r = requests.get(url, timeout=5)
        soup = bs4.BeautifulSoup(r.text, 'html.parser')
        for a in soup.find_all('a', href=True):
            href = a['href']
            full = urljoin(url, href)
            if '/india-holiday-packages/' in full or '/international-holiday-packages/' in full:
                packages.add(full)
            elif urlparse(full).netloc == 'www.monks-n-monkeys.com' or urlparse(full).netloc == 'monks-n-monkeys.com':
                if full not in visited and not full.endswith(('.jpg', '.png', '.pdf')):
                    crawl(full, depth+1)
    except Exception as e: pass

print("Crawling...")
crawl('https://www.monks-n-monkeys.com')

with open('scraped_urls.json', 'w') as f:
    json.dump(list(packages), f, indent=2)
print('Found packages:', len(packages))
