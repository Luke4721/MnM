const https = require('https');
const locations = ['Ayodhya', 'Gateway_of_India', 'Rann_of_Kutch', 'Radhanagar_Beach', 'Pangong_Tso', 'Kathmandu', 'Paro_Taktsang', 'Palolem_Beach', 'Dubai_Marina', 'Bali_temple'];

async function fetchWikiImage(loc) {
  return new Promise(resolve => {
    https.get('https://en.wikipedia.org/w/api.php?action=query&titles=' + loc + '&prop=pageimages&format=json&pithumbsize=800', { headers: { 'User-Agent': 'curl/7.81.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    });
  });
}

(async () => {
  let urls = [];
  for (const loc of locations) {
    const url = await fetchWikiImage(loc);
    if (url) urls.push(url);
  }
  console.log(JSON.stringify(urls, null, 2));
})();
