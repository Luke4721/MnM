import json
import time
import os

live_prices_path = r"E:\MNM_Website\live_prices.json"
db_path = r"E:\MNM_Website\src\data\mnm_database.json"

print(f"Waiting for {live_prices_path}...")
while True:
    if os.path.exists(live_prices_path) and os.path.getsize(live_prices_path) > 500:
        try:
            with open(live_prices_path, 'r', encoding='utf-8') as f:
                live_prices = json.load(f)
            if live_prices:
                break
        except Exception:
            pass
    time.sleep(1)

print(f"Found {live_prices_path}, updating prices...")

with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

packages = db.get('packages', []) if isinstance(db, dict) else db

for package in packages:
    if not isinstance(package, dict): continue
    slug = package.get('slug')
    pkg_id = package.get('id')
    
    new_price = live_prices.get(slug) or live_prices.get(str(pkg_id))
    if new_price and new_price != "Price on Request":
        try:
            # Setting price directly. If new_price is numeric, no need to replace.
            new_price_str = str(new_price).replace(',', '').replace('$', '').replace('€', '').replace('₹', '').strip()
            
            package['price'] = float(new_price_str)
            if 'regularPrice' in package:
                package['regularPrice'] = float(new_price_str)
        except ValueError:
            # Leave as is or set to Price on Request
            pass

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

print("Finished updating prices.")
