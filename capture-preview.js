const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');
  
  console.log('Waiting for search input...');
  // The search input usually has a placeholder or type="text"
  await page.waitForSelector('input[type="text"]');
  await page.fill('input[type="text"]', 'metal flake');
  await page.waitForTimeout(2000); // Wait for filter

  console.log('Finding a color card...');
  // We can click the first color card
  // The color card usually has "group" or similar classes, or we can just click text
  // Let's find any element containing 'Metal Flake'
  const cards = page.locator(':has-text("Metal Flake")');
  if (await cards.count() > 0) {
    await cards.first().click();
  } else {
    console.log('Could not find specific card by text, trying a generic card selector...');
    // A fallback to click the first card-like element
    await page.locator('div.cursor-pointer').first().click();
  }

  console.log('Waiting for the WebGL canvas...');
  await page.waitForSelector('canvas');
  
  // Wait enough time for the HDRI to load and 3D to render
  console.log('Waiting 5 seconds for rendering...');
  await page.waitForTimeout(5000);

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'blended-preview-screenshot.png' });
  
  await browser.close();
  console.log('Screenshot saved to blended-preview-screenshot.png');
})();
