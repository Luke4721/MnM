import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

old_map = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2011_Dimos_Thiras.png/1280px-2011_Dimos_Thiras.png"
new_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Oia_Santorini_Greece.jpg/1280px-Oia_Santorini_Greece.jpg"

if old_map in data:
    data = data.replace(old_map, new_image)
    with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
        f.write(data)
    print("Map image removed and replaced with a valid image successfully!")
else:
    print("Could not find the map image URL in Home.tsx.")
