(async () => {
  const target = 'https://www.ign.com/maps/forza-horizon-5/mexico';
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
  const headers = {
    'User-Agent': ua,
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  try {
    console.log('=== Server fetch (node fetch) ===');
    const res = await fetch(target, { headers });
    console.log('FETCH STATUS', res.status);
    const text = await res.text();
    console.log('HTML length:', text.length);
    console.log('--- START HTML (truncated 5000 chars) ---');
    console.log(text.slice(0, 5000));
    console.log('--- END HTML TRUNC ---');

    const hasMapScript = /map|interactive|canvas|MapGenie|ign\.com\/maps|leaflet|openlayers|google\.com\/maps|tile/i.test(text);
    console.log('Heuristic match for map/js rendering markers:', hasMapScript);
  } catch (err) {
    console.error('Server fetch failed:', err);
  }

  // Try headless rendering with Playwright or Puppeteer if available
  try {
    console.log('\n=== Attempt headless render via Playwright (improved) ===');
    const playwright = await import('playwright');
    const browser = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Increase navigation timeout, try domcontentloaded then wait for map markers
    try {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
    } catch (navErr) {
      console.warn('Playwright navigation warning/timeout (continuing):', navErr?.message || navErr);
    }

    let canvasFound = false;
    try {
      await page.waitForSelector('canvas, #map, .map, [data-map], [id*=map]', { timeout: 90000 });
      canvasFound = true;
    } catch (selErr) {
      console.warn('Playwright: map selector not found within timeout:', selErr?.message || selErr);
    }

    if (canvasFound) await page.waitForTimeout(3000);

    const html = await page.content();
    console.log('Playwright content length:', html.length);
    console.log('--- START PLAYWRIGHT HTML (truncated 8000 chars) ---');
    console.log(html.slice(0, 8000));
    console.log('--- END PLAYWRIGHT TRUNC ---');

    const canvas = await page.$('canvas');
    console.log('Canvas element present (playwright)?', !!canvas);

    try {
      // await page.screenshot({ path: 'tmp/ign_playwright.png', fullPage: false });
    } catch (sErr) {
      console.warn('Screenshot failed:', sErr?.message || sErr);
    }

    await browser.close();
  } catch (err) {
    console.error('Playwright fetch failed or not available:', err?.message || err);
    try {
      console.log('\n=== Attempt headless render via Puppeteer ===');
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
      const page = await browser.newPage();
      await page.setUserAgent(ua);
      try {
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
      } catch (navErr) {
        console.warn('Puppeteer navigation warning/timeout (continuing):', navErr?.message || navErr);
      }
      let canvasFound = false;
      try {
        await page.waitForSelector('canvas, #map, .map, [data-map], [id*=map]', { timeout: 90000 });
        canvasFound = true;
      } catch (selErr) {
        console.warn('Puppeteer: map selector not found within timeout:', selErr?.message || selErr);
      }
      if (canvasFound) await page.waitForTimeout(3000);
      const html = await page.content();
      console.log('Puppeteer content length:', html.length);
      console.log('--- START PUPPETEER HTML (truncated 8000 chars) ---');
      console.log(html.slice(0, 8000));
      console.log('--- END PUPPETEER TRUNC ---');
      const canvas = await page.$('canvas');
      console.log('Canvas element present (puppeteer)?', !!canvas);
      await browser.close();
    } catch (err2) {
      console.error('Puppeteer fetch failed or not installed:', err2?.message || err2);
    }
  }
})();
