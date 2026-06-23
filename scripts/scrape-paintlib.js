const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BASE_URL = 'https://paintlib.com';
const OUTPUT_FILE = path.join(__dirname, '../data/paintlib_data.json');

// Helper to delay between requests to avoid rate limits
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchPage(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      if (res.status === 403) {
        console.warn(`[403 Forbidden] Cloudflare block on ${url}. Skipping...`);
        return null;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return cheerio.load(text);
    } catch (e) {
      console.error(`Error fetching ${url}: ${e.message}, retrying...`);
      await delay(2000);
    }
  }
  return null;
}

function extractHexFromStyle(styleAttr) {
  if (!styleAttr) return null;
  // match background:#123456
  const bgMatch = styleAttr.match(/background:\s*(#[A-Fa-f0-9]{3,6})/);
  if (bgMatch) return bgMatch[1];
  
  // match radial-gradient(circle at 33% 33%,#light,#dark)
  const radialMatch = styleAttr.match(/radial-gradient\([^,]+,([^,]+),([^)]+)\)/);
  if (radialMatch) {
    return radialMatch[2].trim(); // Usually the second color is the main base color
  }

  // match linear-gradient(135deg,#light 0%,#mid 55%,#dark 100%)
  const linearMatch = styleAttr.match(/linear-gradient\([^,]+,([^,]+),([^,]+)(?:,[^)]+)?\)/);
  if (linearMatch) {
    // Extract the hex part from `#mid 55%`
    const midColorPart = linearMatch[2].trim();
    const hexMatch = midColorPart.match(/(#[A-Fa-f0-9]{3,6})/);
    if (hexMatch) return hexMatch[1];
  }

  return null;
}

async function scrapeBrand(brandUrl, brandName) {
  let page = 1;
  const colors = [];
  
  while (true) {
    const url = `${BASE_URL}${brandUrl}?p=${page}`;
    console.log(`  Scraping ${brandName} - Page ${page}...`);
    const $ = await fetchPage(url);
    if (!$) break;

    const rows = $('.color-row');
    if (rows.length === 0) break;

    rows.each((i, el) => {
      const name = $(el).find('.color-name').text().trim();
      const code = $(el).find('.col-code .cell-val').text().trim();
      const style = $(el).find('.sg').attr('style');
      const hex = extractHexFromStyle(style);

      if (name && hex) {
        colors.push({
          make: brandName,
          paintName: name,
          paintCode: code,
          hex: hex
        });
      }
    });

    // Check if there's a next page
    const nextBtn = $('.pagination a').filter((i, el) => $(el).text().includes('Next'));
    if (nextBtn.length === 0) {
      break;
    }
    
    page++;
    await delay(1000); // 1s delay between pagination
  }
  
  return colors;
}

async function main() {
  console.log('Fetching homepage to get brands...');
  const $ = await fetchPage(BASE_URL + '/');
  if (!$) {
    console.error('Failed to fetch homepage. Check your connection or Cloudflare block.');
    return;
  }

  const brandLinks = [];
  $('.brand-card').each((i, el) => {
    const href = $(el).attr('href');
    const name = $(el).find('.brand-name').text().trim();
    if (href && name) {
      brandLinks.push({ href, name });
    }
  });

  console.log(`Found ${brandLinks.length} brands. Starting scrape...`);
  
  let allColors = [];
  for (const brand of brandLinks) {
    const brandColors = await scrapeBrand(brand.href, brand.name);
    allColors = allColors.concat(brandColors);
    
    // Save incrementally
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allColors, null, 2));
    
    console.log(`Finished ${brand.name}: ${brandColors.length} colors found. Total so far: ${allColors.length}`);
    await delay(2000); // 2s delay between brands
  }

  console.log(`Scraping complete! Total colors extracted: ${allColors.length}`);
  console.log(`Data saved to ${OUTPUT_FILE}`);
}

main();
