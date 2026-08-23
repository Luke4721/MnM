const axios = require('axios');
const cheerio = require('cheerio');

async function countPackages() {
    console.log("Crawling monks-n-monkeys.com for package links...");
    try {
        const response = await axios.get('https://www.monks-n-monkeys.com');
        const $ = cheerio.load(response.data);
        const packages = new Set();
        
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && (href.includes('/india-holiday-packages/') || href.includes('/international-holiday-packages/'))) {
                packages.add(href);
            }
        });
        
        const count = packages.size;
        console.log(`\nFound ${count} unique featured packages on the homepage.`);
        return count;
    } catch (e) {
        console.error("Error scraping:", e.message);
    }
}
countPackages();
