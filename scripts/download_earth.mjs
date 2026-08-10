import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const texturesDir = path.join(__dirname, '../public/textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

const fileUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg';
const dest = path.join(texturesDir, 'earth.jpg');

console.log('Downloading Earth texture...');

const file = fs.createWriteStream(dest);
https.get(fileUrl, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Earth texture downloaded successfully.');
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Error downloading texture:', err.message);
});
