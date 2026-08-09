import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  'ayodhya.png',
  'mumbai.jpg',
  'gujarat.webp',
  'andaman.jpg',
  'ladakh.jpg',
  'darjeeling.jpg'
];

const baseUrl = 'https://mnmtravels.com/img/';
const destDir = path.join(process.cwd(), 'public', 'images');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  for (const img of images) {
    const url = baseUrl + img;
    const dest = path.join(destDir, img);
    try {
      console.log(`Downloading ${img}...`);
      await download(url, dest);
      console.log(`Successfully downloaded ${img}`);
    } catch (err) {
      console.error(`Error downloading ${img}:`, err.message);
    }
  }
};

run();
