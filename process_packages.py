import json
import re

with open('src/data/mnm_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

packages = data['packages']

for p in packages:
    print(p['id'], "==>", p.get('name'))
