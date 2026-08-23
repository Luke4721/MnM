import requests, urllib.parse, re

def search_google_images(query):
    url = f'https://www.google.com/search?q={urllib.parse.quote(query)}&tbm=isch'
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    r = requests.get(url, headers=headers)
    print("Status:", r.status_code)
    
    # We look for arrays like ["https://example.com/image.jpg", 1024, 768]
    matches = re.findall(r'\["(https://[^"]+?\.(?:jpg|png|jpeg))",\d+,\d+\]', r.text)
    
    if matches:
        print('Found images:', len(matches))
        for m in matches[:5]:
            print(m)
    else:
        print('No images found')

search_google_images("Dubai tourism high resolution")
