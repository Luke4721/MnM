import json
import os
import time
from icrawler.builtin import BingImageCrawler

DB_PATH = 'src/data/mnm_database.json'
OUT_DIR = 'public/images/packages'

if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR)

with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

print(f"Starting hi-res image download for {len(db['packages'])} packages...")

# Custom crawler to rename files
class CustomCrawler(BingImageCrawler):
    def __init__(self, *args, pkg_id="", **kwargs):
        self.pkg_id = pkg_id
        super().__init__(*args, **kwargs)
        
    def set_logger(self, log_level=50): # disable logs
        import logging
        logging.getLogger('icrawler').setLevel(logging.CRITICAL)

for p in db['packages']:
    pkg_id = p['id']
    dest_path = os.path.join(OUT_DIR, f"{pkg_id}.jpg")
    
    # Check if already downloaded
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10000:
        continue
        
    query = (p.get('destination') or p.get('title', '').split(' ')[0]) + ' tourism high resolution landscape'
    if 'dubai' in p['title'].lower(): query = 'Dubai city tourism high resolution landscape'
    if 'singapore' in p['title'].lower(): query = 'Singapore city tourism high resolution landscape'
    
    print(f"Downloading for {pkg_id}: '{query}'")
    
    # Create a temporary dir for this package
    tmp_dir = os.path.join(OUT_DIR, f"tmp_{pkg_id}")
    if not os.path.exists(tmp_dir): os.makedirs(tmp_dir)
    
    crawler = BingImageCrawler(storage={'root_dir': tmp_dir})
    # suppress logs
    import logging
    logging.getLogger('icrawler').setLevel(logging.CRITICAL)
    
    try:
        crawler.crawl(keyword=query, max_num=1)
        
        # Move and rename
        files = os.listdir(tmp_dir)
        if files:
            src_file = os.path.join(tmp_dir, files[0])
            os.rename(src_file, dest_path)
            
            # Update DB
            img_url = f"/images/packages/{pkg_id}.jpg"
            p['image_url'] = img_url
            p['img'] = img_url
            p['image'] = img_url
            p['heroImage'] = img_url
            p['gallery'] = [img_url, img_url]
            
            print(f"  -> Saved {img_url}")
        else:
            print("  -> Failed to find image")
    except Exception as e:
        print("  -> Error:", e)
        
    # cleanup temp dir
    try:
        for f in os.listdir(tmp_dir):
            os.remove(os.path.join(tmp_dir, f))
        os.rmdir(tmp_dir)
    except:
        pass
        
    # Save DB incrementally
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        
    time.sleep(1) # delay to avoid rate limit

print("Done downloading all hi-res images!")
