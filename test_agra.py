import requests, bs4
import urllib.parse
import json

params = urllib.parse.quote(json.dumps({"destination":"Agra"}))
url = f'https://www.travellerhelpline.com/tour-packages/Agra?params={params}'
print(url)
r = requests.get(url)
soup = bs4.BeautifulSoup(r.text, 'html.parser')
found = False
for h in soup.find_all('h4'):
    if h.find('a'): 
        print(h.text.strip())
        found = True
if not found:
    print('None found!')
