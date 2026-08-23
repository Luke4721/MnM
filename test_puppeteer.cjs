const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto('https://unsplash.com/s/photos/dubai-tourism', { waitUntil: 'networkidle2' });
    
    const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('images.unsplash.com/photo-'));
    });
    
    console.log(`Found ${images.length} images`);
    if(images.length > 0) console.log(images[0]);
    
    await browser.close();
})();
