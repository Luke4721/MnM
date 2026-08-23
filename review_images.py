import os
import json
from PIL import Image

DB_PATH = 'src/data/mnm_database.json'
IMG_DIR = 'public/images/packages'

with open(DB_PATH, 'r', encoding='utf-8') as f:
    db = json.load(f)

print("Reviewing downloaded images...")
bad_count = 0

for p in db['packages']:
    pkg_id = p['id']
    img_path = os.path.join(IMG_DIR, f"{pkg_id}.jpg")
    
    if os.path.exists(img_path):
        try:
            with Image.open(img_path) as img:
                img.verify() # verify it's a valid image
            
            # Check size
            size_kb = os.path.getsize(img_path) / 1024
            if size_kb < 10:
                raise Exception(f"File too small: {size_kb:.1f}KB")
                
        except Exception as e:
            print(f"Bad image for {pkg_id}: {e}")
            bad_count += 1
            os.remove(img_path)
    else:
        # Not downloaded yet, or failed
        pass

print(f"Review complete. Found {bad_count} bad images.")
