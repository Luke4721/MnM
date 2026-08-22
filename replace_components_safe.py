import glob
import re

files = [
    'src/pages/About.tsx',
    'src/pages/CategoryDetail.tsx',
    'src/pages/Gallery.tsx',
    'src/pages/Home.tsx'
]

images = [
    "/images/0b9903d33f4b2867c46621f3eb86c7cd.jpg",
    "/images/2667045e2fd96444a1e5a7796a6ab43b.jpg",
    "/images/30ca80d455a76609dc911a25a68d87e2.jpg",
    "/images/3ac9bf62d5bb14289acd33e9f5a63ee3.jpg",
    "/images/6b2bb97f0c1b6d7f2e78e37589eae965.jpg",
    "/images/6f3ad43a139e289fdcc2ccc6d497923b.jpg",
    "/images/7c677b5e8b51587496b66ed9709845df.jpg",
    "/images/8b2e185fc79ab5f9983920bbc1f8f6b5.jpg",
    "/images/8c22906dc1ab06a9031e5f0fde298c5b.jpg",
    "/images/9c904a1b42b78bb14a34bb65cc768a40.jpg",
    "/images/9dd341eb42d8bf61fd830a7fb49fcea0.jpg",
    "/images/addd9c793a887b86533272b59634079b.jpg",
    "/images/bc26215b8a86f23ba325cec734f67987.jpg",
    "/images/d0d74fa518ccf2c3f270d33d480a52ec.jpg",
    "/images/e97b55b625311db0391ed5d31752fe46.jpg",
    "/images/f426fde8514dd68edc767474c1fa719a.jpg",
]

idx = 0
def repl(match):
    global idx
    img = images[idx % len(images)]
    idx += 1
    return img

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        data = f.read()
    new_data = re.sub(r'https://images\.unsplash\.com/[a-zA-Z0-9\-\?\=\&\%_]+', repl, data)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_data)

print("Done")
