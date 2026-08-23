import urllib.request
import urllib.parse
import json

def get_wikimedia_image(query):
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    
    if not data['query']['search']:
        return None
        
    title = data['query']['search'][0]['title']
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&pithumbsize=1280&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
    pages = data['query']['pages']
    for page_id in pages:
        if 'thumbnail' in pages[page_id]:
            return pages[page_id]['thumbnail']['source']
    return None

def download_image(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open(dest, 'wb') as f:
            f.write(response.read())

import time
db_path = r"e:\MNM_Website\src\data\mnm_database.json"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

updated = False
for pkg in db["packages"]:
    if pkg["title"] == "Jewels of North East":
        img_url = get_wikimedia_image("Gangtok city view")
        if img_url:
            dest = f"e:/MNM_Website/public/images/hires/23_fixed.jpg"
            download_image(img_url, dest)
            pkg["image_url"] = "/images/hires/23_fixed.jpg"
            pkg["img"] = "/images/hires/23_fixed.jpg"
            pkg["image"] = "/images/hires/23_fixed.jpg"
            pkg["heroImage"] = "/images/hires/23_fixed.jpg"
            pkg["gallery"] = ["/images/hires/23_fixed.jpg", "/images/hires/23_fixed.jpg"]
            updated = True
            print(f"Downloaded {img_url} to 23_fixed.jpg")
    elif pkg["title"] == "Treasures of Kolkata & Orissa":
        img_url = get_wikimedia_image("Kolkata Victoria Memorial")
        if img_url:
            dest = f"e:/MNM_Website/public/images/hires/24_fixed.jpg"
            download_image(img_url, dest)
            pkg["image_url"] = "/images/hires/24_fixed.jpg"
            pkg["img"] = "/images/hires/24_fixed.jpg"
            pkg["image"] = "/images/hires/24_fixed.jpg"
            pkg["heroImage"] = "/images/hires/24_fixed.jpg"
            pkg["gallery"] = ["/images/hires/24_fixed.jpg", "/images/hires/24_fixed.jpg"]
            updated = True
            print(f"Downloaded {img_url} to 24_fixed.jpg")

if updated:
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
    print("Updated mnm_database.json")

print("Done")
