import json, time, requests, urllib.parse

DB_PATH = r"e:\MNM_Website\src\data\mnm_database.json"

with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

existing = {p['id']: p for p in db.get('packages', [])}

with open('parsed_251_packages.json', 'r', encoding='utf-8') as f:
    new_pkgs = json.load(f)

def get_img(query):
    try:
        url = "https://commons.wikimedia.org/w/api.php"
        params = {
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": f"filetype:bitmap {query}", "gsrlimit": 1,
            "prop": "imageinfo", "iiprop": "url|size", "iiurlwidth": "1280"
        }
        r = requests.get(url, params=params, headers={"User-Agent": "MNMTravelBot/2.0"}, timeout=5)
        pages = r.json().get("query", {}).get("pages", {})
        for _, page in pages.items():
            info = page.get("imageinfo", [{}])[0]
            if info.get("thumburl"): return info["thumburl"]
            if info.get("url"): return info["url"]
    except: pass
    return f"https://via.placeholder.com/1280x720?text={urllib.parse.quote(query)}"

added = 0
for pkg in new_pkgs:
    if pkg['id'] not in existing:
        print(f"Adding new package: {pkg['title']}")
        img = get_img(pkg['title'] + " travel")
        pkg['image_url'] = img
        pkg['img'] = img
        pkg['image'] = img
        pkg['heroImage'] = img
        pkg['gallery'] = [img, img]
        existing[pkg['id']] = pkg
        added += 1
        time.sleep(0.1)

db['packages'] = list(existing.values())

with open(DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print(f"Added {added} new packages! Total is now {len(db['packages'])}")
