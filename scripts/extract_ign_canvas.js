(async () => {
  const target = 'https://www.ign.com/maps/forza-horizon-5/mexico';
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
  const outPath = 'scripts/ign_map_canvas.png';

  try {
    const playwright = await import('playwright');
    const browser = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 1600, height: 900 } });
    const page = await context.newPage();

    console.log('Navigating to', target);
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => {});
    // Wait for any canvas to appear
    await page.waitForSelector('canvas', { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const canvases = await page.$$('canvas');
    if (!canvases || canvases.length === 0) {
      throw new Error('No canvas elements found on page');
    }

    // Choose the largest visible canvas by bounding box area
    let best = null;
    let bestArea = 0;
    for (const c of canvases) {
      try {
        const box = await c.boundingBox();
        if (!box) continue;
        const area = (box.width || 0) * (box.height || 0);
        if (area > bestArea) {
          bestArea = area;
          best = c;
        }
      } catch (e) {
        continue;
      }
    }

    if (!best) {
      throw new Error('No visible canvas with bounding box found');
    }

    // Try element.screenshot first
    let wrote = false;
    try {
      await best.screenshot({ path: outPath });
      console.log('Wrote canvas screenshot to', outPath);
      wrote = true;
    } catch (e) {
      console.warn('element.screenshot failed, will fallback to toDataURL:', e?.message || e);
    }

    // Fallback: ask the page to read canvas.toDataURL and write it
    if (!wrote) {
      try {
        const dataUrl = await page.evaluate((elIndex) => {
          const canv = document.querySelectorAll('canvas')[elIndex];
          return canv ? canv.toDataURL('image/png') : null;
        }, canvases.indexOf(best));
        if (!dataUrl) throw new Error('toDataURL returned null');
        const base64 = dataUrl.split(',')[1];
        const fs = await import('node:fs');
        fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
        console.log('Wrote canvas PNG via toDataURL to', outPath);
        wrote = true;
      } catch (e) {
        console.error('Fallback to toDataURL failed:', e?.message || e);
      }
    }

    await browser.close();
    if (!wrote) process.exit(2);
    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err?.message || err);
    process.exit(3);
  }
})();
