(async () => {
  const target = 'https://www.ign.com/maps/forza-horizon-5/mexico';
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';

  try {
    const playwright = await import('playwright');
    const browser = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    const networkJsons = [];
    page.on('response', async (res) => {
      try {
        const url = res.url();
        const ct = (res.headers()['content-type'] || '').toLowerCase();
        const shouldTry = ct.includes('application/json') || /map|maps|mapgenie|locations|markers|pins|wikimaps|features|places/i.test(url);
        if (!shouldTry) return;
        try {
          const json = await res.json();
          networkJsons.push({ url, json });
        } catch (e) {
          // not JSON or failed to parse
        }
      } catch (e) {}
    });

    console.log('Navigating to target...');
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });

    // wait for map-like DOM or a stable moment
    await page.waitForSelector('canvas, #map, .map, [data-map], [id*=map]', { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Find candidate arrays / objects in window and inline scripts
    const candidates = await page.evaluate(() => {
      function isPinObj(o) {
        return o && typeof o === 'object' && !Array.isArray(o) && (
          o.name || o.title || o.label || o.text || o.lat || o.lng || o.latitude || o.longitude || o.coords || (o.x && o.y) || o.icon
        );
      }

      const results = [];

      // window properties
      Object.keys(window).forEach((k) => {
        try {
          const v = window[k];
          if (Array.isArray(v) && v.length && v.some(isPinObj)) {
            results.push({ key: k, kind: 'array', length: v.length, sample: v.slice(0, 50) });
          } else if (v && typeof v === 'object') {
            ['locations', 'markers', 'pins', 'features', 'items', 'places', 'data', 'mapPins', 'map_data', 'mapData', 'points', 'markersData'].forEach((prop) => {
              if (Array.isArray(v[prop]) && v[prop].length && v[prop].some(isPinObj)) {
                results.push({ key: k + '.' + prop, kind: 'propArray', length: v[prop].length, sample: v[prop].slice(0, 50) });
              }
            });
          }
        } catch (e) {}
      });

      // inline scripts: try to JSON.parse obvious JSON blobs
      const inline = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent).filter(Boolean);
      inline.forEach((text, idx) => {
        try {
          // look for large JSON blob boundaries
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start >= 0 && end > start && end - start < 1e6) {
            const maybe = text.slice(start, end + 1);
            try {
              const parsed = JSON.parse(maybe);
              function findArrays(obj, path='root') {
                if (Array.isArray(obj) && obj.length && obj.some(isPinObj)) {
                  results.push({ key: `inline[${idx}].${path}`, kind: 'inlineArray', length: obj.length, sample: obj.slice(0,50) });
                  return;
                }
                if (obj && typeof obj === 'object') {
                  Object.keys(obj).forEach(k => findArrays(obj[k], path + '.' + k));
                }
              }
              findArrays(parsed);
            } catch (e) {
              // not JSON
            }
          }
        } catch (e) {}
      });

      return results;
    });

    // Also attempt to collect MapMarker objects from client-side data (Next.js __NEXT_DATA__ or window)
    const extractedMarkers = await page.evaluate(() => {
      const out = [];
      function looksLikeMarker(m) {
        return m && typeof m === 'object' && (
          m.markerName || m.name || m.title || m.markerSlug || m.id
        ) && (m.lat !== undefined || m.latitude !== undefined || (m.coords && (Array.isArray(m.coords) || typeof m.coords === 'object')));
      }

      // 1) __NEXT_DATA__ serialized props (typical for Next.js)
      try {
        const nd = document.getElementById('__NEXT_DATA__');
        if (nd && nd.textContent) {
          try {
            const parsed = JSON.parse(nd.textContent);
            const map = parsed?.props?.pageProps?.page?.map;
            if (map && Array.isArray(map.overlays)) {
              map.overlays.forEach((ov) => {
                if (Array.isArray(ov.markers)) ov.markers.forEach(m => looksLikeMarker(m) && out.push(m));
              });
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {}

      // 2) scan window properties for arrays/props that contain marker-like objects
      try {
        Object.keys(window).forEach((k) => {
          try {
            const v = window[k];
            if (Array.isArray(v)) v.forEach(item => looksLikeMarker(item) && out.push(item));
            else if (v && typeof v === 'object') {
              ['markers', 'markes', 'overlays', 'locations', 'pins', 'data', 'mapData', 'items', 'features'].forEach((prop) => {
                if (Array.isArray(v[prop])) v[prop].forEach(item => looksLikeMarker(item) && out.push(item));
              });
            }
          } catch (e) {}
        });
      } catch (e) {}

      return out;
    });

    const pageHtml = await page.content();
    await browser.close();

    // Normalize markers into a compact FH5-like shape
    const normalize = (m) => {
      const name = m.markerName || m.name || m.title || null;
      const slug = m.markerSlug || (m.id && String(m.id)) || null;
      const icon = m.iconSlug || m.icon || null;
      let coords = null;
      if (m.lat !== undefined && m.lng !== undefined) coords = [m.lat, m.lng];
      else if (m.latitude !== undefined && m.longitude !== undefined) coords = [m.latitude, m.longitude];
      else if (m.coords && Array.isArray(m.coords)) coords = m.coords;
      else if (m.coords && typeof m.coords === 'object' && (m.coords.x !== undefined && m.coords.y !== undefined)) coords = [m.coords.x, m.coords.y];

      const type = icon || m.typeSlug || (m.__typename || null) || 'Unknown';
      const collectibleTypes = ['bonus_board','fast_travel_board','xp_board','barn_find','photo_challenge','xp_board','bonus_board','fast_travel'];
      const collectible = icon ? collectibleTypes.includes(icon) : false;

      return {
        id: slug ? `${slug}` : (name ? name.replace(/\s+/g,'-').toLowerCase() : null),
        name,
        type,
        region: m.regionId || m.region || null,
        source: 'IGN',
        coords,
        description: m.description || m.summary || null,
        collectible,
        raw: m
      };
    };

    const normalized = extractedMarkers.map(normalize).filter(x => x.name || x.id);

    // deduplicate by id or name
    const seen = new Set();
    const deduped = [];
    normalized.forEach((p) => {
      const key = p.id || p.name;
      if (!key) return;
      if (seen.has(key)) return;
      seen.add(key);
      deduped.push(p);
    });

    // save to file
    try {
      const fs = await import('node:fs');
      fs.writeFileSync('scripts/ign_pins.json', JSON.stringify(deduped, null, 2), 'utf8');
      console.log('\nWROTE scripts/ign_pins.json - entries:', deduped.length);
    } catch (e) {
      console.warn('Could not write output file:', e?.message || e);
    }

    const summary = { candidatesCount: candidates.length, candidates: candidates.map(c => ({ key: c.key, kind: c.kind, length: c.length })), networkJsonsCount: networkJsons.length, extractedMarkersCount: extractedMarkers.length, dedupedCount: deduped.length };
    console.log('===PARSE SUMMARY===');
    console.log(JSON.stringify(summary, null, 2));

    // Print up to first 5 network JSON responses (truncated)
    const MAX_NET = 5;
    for (let i = 0; i < Math.min(networkJsons.length, MAX_NET); i++) {
      const item = networkJsons[i];
      console.log('\n---NETWORK JSON URL---\n' + item.url + '\n');
      try {
        const pretty = JSON.stringify(item.json, (k, v) => (typeof v === 'object' && v && Object.keys(v).length > 50) ? '[OBJECT]' : v, 2);
        console.log(pretty.slice(0, 20000));
      } catch (e) {
        console.log('[unable to stringify network json]');
      }
    }

    // Print a compact sample for each candidate
    candidates.slice(0, 20).forEach((c, i) => {
      console.log('\n---CANDIDATE ' + (i+1) + ' : ' + c.key + ' (len=' + c.length + ') ---');
      try {
        console.log(JSON.stringify(c.sample.slice(0, 20), (k, v) => (typeof v === 'object' && v && Object.keys(v).length > 50) ? '[OBJECT]' : v, 2).slice(0, 24000));
      } catch (e) {
        console.log('[cant stringify sample]');
      }
    });

    // Print top 15 parsed pins (name + coords + type)
    console.log('\n===PARSED PINS (top 15)===');
    deduped.slice(0, 15).forEach((p) => {
      console.log(JSON.stringify({ name: p.name, coords: p.coords, type: p.type, id: p.id }, null, 2));
    });

    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err?.message || err);
    process.exit(2);
  }
})();
