(async () => {
  const target = 'https://www.ign.com/maps/forza-horizon-5/mexico';
  const pinsPath = 'scripts/ign_pins.json';
  const outPrecise = 'scripts/ign_pins_pixels_precise.json';
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';

  try {
    const fs = await import('node:fs');
    if (!fs.existsSync(pinsPath)) {
      console.error('Pins file not found:', pinsPath);
      process.exit(2);
    }
    const pins = JSON.parse(fs.readFileSync(pinsPath, 'utf8'));
    if (!Array.isArray(pins) || pins.length === 0) {
      console.error('No pins to process');
      process.exit(3);
    }

    const playwright = await import('playwright');
    const browser = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 1600, height: 900 } });
    const page = await context.newPage();

    console.log('Opening page...');
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // use first N pins as samples to probe projection
    const samplePins = pins.slice(0, 80).map(p => ({ id: p.id, coords: p.coords }));

    const probeResult = await page.evaluate((samplePins) => {
      // candidate method names to look for
      const methodNames = ['latLngToContainerPoint','latLngToLayerPoint','project','fromLatLngToPoint','toScreenLocation','getPixelFromCoordinate','worldToScreen','screenPointToLatLng','containerPointToLatLng','getContainerPoint'];

      function isPointLike(obj) {
        return obj && typeof obj === 'object' && ((typeof obj.x === 'number' && typeof obj.y === 'number') || (Array.isArray(obj) && typeof obj[0] === 'number' && typeof obj[1] === 'number'));
      }

      function tryCall(obj, method, lat, lng) {
        const argForms = [
          () => obj[method].call(obj, { lat: lat, lng: lng }),
          () => obj[method].call(obj, { lat: lat, lon: lng }),
          () => obj[method].call(obj, { latitude: lat, longitude: lng }),
          () => obj[method].call(obj, [lat, lng]),
          () => obj[method].call(obj, [lng, lat]),
          () => obj[method].call(obj, lat, lng),
          () => obj[method].call(obj, lng, lat)
        ];

        for (let i = 0; i < argForms.length; i++) {
          try {
            const res = argForms[i]();
            if (isPointLike(res)) {
              if (Array.isArray(res)) return { x: res[0], y: res[1], form: i };
              return { x: res.x, y: res.y, form: i };
            }
            // Some libs return objects with .x and .y nested or methods to access
            if (res && typeof res === 'object') {
              if ('point' in res && isPointLike(res.point)) {
                const p = res.point; return Array.isArray(p) ? { x: p[0], y: p[1], form: i } : { x: p.x, y: p.y, form: i };
              }
            }
          } catch (e) {
            // swallow
          }
        }
        return null;
      }

      // gather window property keys
      const keys = Object.keys(window).slice(0, 1000);
      // include some known globals
      ['map','Map','L','mapboxgl','ol','GoogleMaps','google','__MAP__'].forEach(k => { if (!keys.includes(k) && k in window) keys.push(k); });

      for (const key of keys) {
        try {
          const obj = window[key];
          if (!obj || typeof obj !== 'object') continue;
          // inspect own methods
          for (const m of methodNames) {
            try {
              if (typeof obj[m] === 'function') {
                const sample = samplePins[0] && samplePins[0].coords;
                if (!sample || !Array.isArray(sample) || sample.length < 2) continue;
                const lat = sample[0], lng = sample[1];
                const r = tryCall(obj, m, lat, lng);
                if (r) {
                  // map many samples
                  const mapped = [];
                  for (const s of samplePins) {
                    try {
                      const rr = tryCall(obj, m, s.coords[0], s.coords[1]);
                      mapped.push({ id: s.id, coords: s.coords, pixel: rr });
                    } catch (e) { mapped.push({ id: s.id, coords: s.coords, pixel: null }); }
                  }
                  return { found: true, key, method: m, samplePixel: r, mapped };
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
      }

      // no direct candidate
      return { found: false };
    }, samplePins);

    if (!probeResult || !probeResult.found) {
      console.log('No usable projection method found on window objects.');
      await browser.close();
      process.exit(4);
    }

    // probeResult.mapped contains pixel results for samplePins from page context
    // We'll now produce exact pixel mapping for all pins by calling the same method in page context with full list
    const precise = await page.evaluate((probe, fullPins) => {
      function isPointLike(obj) { return obj && typeof obj === 'object' && ((typeof obj.x === 'number' && typeof obj.y === 'number') || (Array.isArray(obj) && typeof obj[0] === 'number' && typeof obj[1] === 'number')); }

      function tryCall(obj, method, lat, lng) {
        const argForms = [
          () => obj[method].call(obj, { lat: lat, lng: lng }),
          () => obj[method].call(obj, { lat: lat, lon: lng }),
          () => obj[method].call(obj, { latitude: lat, longitude: lng }),
          () => obj[method].call(obj, [lat, lng]),
          () => obj[method].call(obj, [lng, lat]),
          () => obj[method].call(obj, lat, lng),
          () => obj[method].call(obj, lng, lat)
        ];

        for (let i = 0; i < argForms.length; i++) {
          try {
            const res = argForms[i]();
            if (isPointLike(res)) {
              if (Array.isArray(res)) return { x: res[0], y: res[1] };
              return { x: res.x, y: res.y };
            }
            if (res && typeof res === 'object') {
              if ('point' in res && isPointLike(res.point)) {
                const p = res.point; return Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y };
              }
            }
          } catch (e) {}
        }
        return null;
      }

      const obj = window[probe.key];
      const method = probe.method;
      const out = [];
      for (const p of fullPins) {
        try {
          const r = tryCall(obj, method, p.coords[0], p.coords[1]);
          out.push({ id: p.id, name: p.name, coords: p.coords, pixel: r });
        } catch (e) { out.push({ id: p.id, name: p.name, coords: p.coords, pixel: null }); }
      }
      return out;
    }, { key: probeResult.key, method: probeResult.method }, pins);

    await browser.close();

    // Write precise mapping to file
    fs.writeFileSync(outPrecise, JSON.stringify({ probe: { key: probeResult.key, method: probeResult.method }, mapped: precise }, null, 2), 'utf8');
    console.log('Wrote precise pixel mapping to', outPrecise, ' — sample mapped:', probeResult.mapped.length);
    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err?.message || err);
    process.exit(11);
  }
})();
