(async () => {
  const target = 'https://www.ign.com/maps/forza-horizon-5/mexico';
  const pinsPath = 'scripts/ign_pins.json';
  const outPixels = 'scripts/ign_pins_pixels.json';
  const outTransform = 'scripts/ign_transform.json';
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
    await page.waitForSelector('canvas, #map, .map, [data-map], [id*=map]', { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Limit to first N pins for matching speed
    const sample = pins.slice(0, 200);

    const matches = await page.evaluate((samplePins) => {
      function centerOf(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      }

      function nodeMatchesPin(node, pin) {
        const name = (pin.name || '').toString().trim().toLowerCase();
        const slug = (pin.raw && pin.raw.markerSlug) ? String(pin.raw.markerSlug) : null;
        try {
          if (slug) {
            // attribute or id match
            if (node.id && node.id.indexOf(slug) !== -1) return true;
            for (const k in node.dataset) {
              if (String(node.dataset[k]).indexOf(slug) !== -1) return true;
            }
            for (let i = 0; i < node.attributes.length; i++) {
              const a = node.attributes[i];
              if (String(a.value).indexOf(slug) !== -1) return true;
            }
          }
          // text/title/aria-label match
          const txt = (node.getAttribute && (node.getAttribute('title') || node.getAttribute('aria-label'))) || node.textContent || '';
          if (txt && typeof txt === 'string' && txt.toLowerCase().indexOf(name) !== -1) return true;
        } catch (e) {}
        return false;
      }

      const found = [];
      const nodes = Array.from(document.querySelectorAll('body *'));
      for (const pin of samplePins) {
        const pname = (pin.name || '').toString().trim();
        let matched = null;
        // fast checks first: data attributes
        try {
          if (pin.raw && pin.raw.markerSlug) {
            const slug = pin.raw.markerSlug;
            const s1 = document.querySelector(`[data-marker-slug='${slug}']`) || document.querySelector(`[data-marker='${slug}']`) || document.querySelector(`#${CSS.escape(slug)}`) || document.querySelector(`[id*='${slug}']`);
            if (s1) matched = s1;
          }
        } catch (e) {}
        if (!matched) {
          // scan nodes for text or attributes
          for (const n of nodes) {
            try {
              if (nodeMatchesPin(n, pin)) { matched = n; break; }
            } catch (e) {}
          }
        }
        if (matched) {
          try {
            const c = centerOf(matched);
            // ignore very small or offscreen
            if (c.w < 2 || c.h < 2) continue;
            found.push({ id: pin.id, name: pin.name, slug: pin.raw && pin.raw.markerSlug, coords: pin.coords, pixel: c });
          } catch (e) {}
        }
      }
      return found;
    }, sample);

    await browser.close();

    // If not enough matched DOM points, fallback to extent-based mapping using canvas bounding box
    let transform = null;
    if (!matches || matches.length < 3) {
      console.warn('Not enough matched DOM points (found:', matches && matches.length, '). Falling back to extent-based mapping.');
      // get canvas bbox
      try {
        const playwright = await import('playwright');
        const browser2 = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
        const context2 = await browser2.newContext({ userAgent: ua, viewport: { width: 1600, height: 900 } });
        const page2 = await context2.newPage();
        await page2.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => {});
        await page2.waitForTimeout(3000);
        const canvasBox = await page2.evaluate(() => {
          const c = document.querySelector('canvas');
          if (!c) return null;
          const r = c.getBoundingClientRect();
          return { left: r.left, top: r.top, width: r.width, height: r.height };
        });
        await browser2.close();
        if (!canvasBox) {
          console.error('Could not find canvas for extent fallback');
          fs.writeFileSync(outPixels, JSON.stringify({ transform: null, matches }, null, 2));
          process.exit(6);
        }

        // compute data extents from pins
        const lats = pins.map(p => (p.coords && p.coords[0] !== undefined) ? p.coords[0] : null).filter(Boolean);
        const lngs = pins.map(p => (p.coords && p.coords[1] !== undefined) ? p.coords[1] : null).filter(Boolean);
        if (lats.length === 0 || lngs.length === 0) {
          console.error('No numeric coords in pins for extent mapping');
          fs.writeFileSync(outPixels, JSON.stringify({ transform: null, matches }, null, 2));
          process.exit(7);
        }
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // linear mapping: x = left + (lng - minLng)/(maxLng-minLng) * width
        //                 y = top  + (lat - minLat)/(maxLat-minLat) * height
        const a1 = canvasBox.left - minLng * (canvasBox.width / (maxLng - minLng));
        const b1 = canvasBox.width / (maxLng - minLng);
        const a2 = canvasBox.top - minLat * (canvasBox.height / (maxLat - minLat));
        const b2 = canvasBox.height / (maxLat - minLat);

        transform = {
          method: 'extent-fallback',
          canvasBox,
          dataExtent: { minLat, maxLat, minLng, maxLng },
          px_from_lnglat: { a: b1, b: 0, c: a1 },
          py_from_lnglat: { a: 0, b: b2, c: a2 }
        };

      } catch (e) {
        console.error('Extent fallback failed:', e?.message || e);
        fs.writeFileSync(outPixels, JSON.stringify({ transform: null, matches }, null, 2));
        process.exit(8);
      }
    }

    // If we had enough matched points earlier, compute transform from matches
    if (!transform) {
      // Prepare linear system to solve affine transform: [px] = [lng lat 1] * [a1 a2 a3]^T
      const A = []; // rows [lng, lat, 1]
      const PX = []; // px
      const PY = []; // py
      matches.forEach(m => {
        const lat = (m.coords && m.coords[0] !== undefined) ? m.coords[0] : null;
        const lng = (m.coords && m.coords[1] !== undefined) ? m.coords[1] : null;
        if (lat === null || lng === null) return;
        A.push([lng, lat, 1]);
        PX.push(m.pixel.x);
        PY.push(m.pixel.y);
      });

      function matMul(A, B) {
        const m = A.length, n = A[0].length, p = B[0].length;
        const C = Array.from({ length: m }, () => Array(p).fill(0));
        for (let i = 0; i < m; i++) for (let k = 0; k < n; k++) for (let j = 0; j < p; j++) C[i][j] += A[i][k] * B[k][j];
        return C;
      }
      function transpose(M) { return M[0].map((_, i) => M.map(r => r[i])); }

      const At = transpose(A);
      const AtA = matMul(At, A); // 3x3
      const AtPX = matMul(At, PX.map(v => [v])); // 3x1
      const AtPY = matMul(At, PY.map(v => [v]));

      function invert3(m) {
        const a = m[0][0], b = m[0][1], c = m[0][2];
        const d = m[1][0], e = m[1][1], f = m[1][2];
        const g = m[2][0], h = m[2][1], i = m[2][2];
        const A = e * i - f * h;
        const B = -(d * i - f * g);
        const C = d * h - e * g;
        const D = -(b * i - c * h);
        const E = a * i - c * g;
        const F = -(a * h - b * g);
        const G = b * f - c * e;
        const H = -(a * f - c * d);
        const I = a * e - b * d;
        const det = a * A + b * B + c * C;
        if (!det) return null;
        const inv = [ [A / det, D / det, G / det], [B / det, E / det, H / det], [C / det, F / det, I / det] ];
        return inv;
      }

      const invAtA = invert3(AtA);
      if (!invAtA) { console.error('Normal matrix not invertible'); process.exit(5); }

      const solX = matMul(invAtA, AtPX).map(r => r[0]);
      const solY = matMul(invAtA, AtPY).map(r => r[0]);

      transform = {
        method: 'affine-from-matches',
        px_from_lnglat: { a: solX[0], b: solX[1], c: solX[2] },
        py_from_lnglat: { a: solY[0], b: solY[1], c: solY[2] },
        matchedPoints: matches.length
      };
    }

    // transform already computed (either extent-fallback or affine-from-matches)

    // Apply transform to all pins to get pixel predictions
    const mapped = pins.map(p => {
      const lat = (p.coords && p.coords[0] !== undefined) ? p.coords[0] : null;
      const lng = (p.coords && p.coords[1] !== undefined) ? p.coords[1] : null;
      if (lat === null || lng === null) return { id: p.id, name: p.name, coords: p.coords, pixel: null };
      const x = transform.px_from_lnglat.a * lng + (transform.px_from_lnglat.b || 0) * lat + (transform.px_from_lnglat.c || 0);
      const y = transform.py_from_lnglat.a * lng + (transform.py_from_lnglat.b || 0) * lat + (transform.py_from_lnglat.c || 0);
      return { id: p.id, name: p.name, coords: p.coords, pixel: { x, y } };
    });

    fs.writeFileSync(outTransform, JSON.stringify(transform, null, 2), 'utf8');
    fs.writeFileSync(outPixels, JSON.stringify(mapped, null, 2), 'utf8');

    console.log('Wrote', outTransform, 'and', outPixels, ' — matched DOM points:', matches.length);
    // Print a few sample mapped pins
    mapped.slice(0, 10).forEach(m => console.log(JSON.stringify({ id: m.id, name: m.name, pixel: m.pixel }, null, 2)));

    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err?.message || err);
    process.exit(11);
  }
})();
