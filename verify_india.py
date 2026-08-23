import json
import os
import urllib.request

db_path = r"E:\MNM_Website\src\data\mnm_database.json"
public_dir = r"E:\MNM_Website\public"
fallback_image_url = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjUyOXwwfDF8c2VhcmNofDF8fGluZGlhfGVufDB8fHx8MTY4NDQyMjkzNg&ixlib=rb-4.0.3&q=80&w=1080" 

with open(db_path, "r", encoding="utf-8") as f:
    data = json.load(f)

domestic_packages = []
for pkg in data.get("packages", []):
    is_domestic = pkg.get("type") == "Domestic"
    loc = pkg.get("location", "").lower()
    is_india = "india" in loc or "delhi" in loc or "mumbai" in loc or "kerala" in loc or "kashmir" in loc
    
    if is_domestic or is_india:
        domestic_packages.append(pkg)

print(f"Found {len(domestic_packages)} domestic/India packages.")

missing_count = 0
for pkg in domestic_packages:
    img_url = pkg.get("image_url", "")
    if img_url.startswith("/"):
        local_path = os.path.join(public_dir, img_url.lstrip("/"))
    else:
        local_path = ""

    is_valid = False
    if img_url.startswith("http"):
        is_valid = True
    elif local_path and os.path.exists(local_path) and os.path.getsize(local_path) > 1024:
        is_valid = True
        
    if not is_valid:
        print(f"Missing/broken image for package {pkg.get('id')} - {pkg.get('title')}. Fetching fallback...")
        missing_count += 1
        
        new_img_name = f"{pkg.get('id')}_fallback.jpg"
        new_local_path = os.path.join(public_dir, "images", "hires", new_img_name)
        new_img_url = f"/images/hires/{new_img_name}"
        
        try:
            if not os.path.exists(new_local_path):
                urllib.request.urlretrieve(fallback_image_url, new_local_path)
            
            pkg["image_url"] = new_img_url
            if "img" in pkg: pkg["img"] = new_img_url
            if "image" in pkg: pkg["image"] = new_img_url
            if "heroImage" in pkg: pkg["heroImage"] = new_img_url
            if "gallery" in pkg and isinstance(pkg["gallery"], list):
                pkg["gallery"] = [new_img_url, new_img_url]
                
        except Exception as e:
            print(f"Failed to fetch image for {pkg.get('id')}: {e}")

if missing_count > 0:
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Verification complete. Updated {missing_count} packages with fallback images.")
