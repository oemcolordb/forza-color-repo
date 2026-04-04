#!/usr/bin/env node
// scripts/scrape_autocolor_strict.js
// Stricter extractor for AutoColorLibrary product pages.
// - Fetches product sitemaps from https://www.autocolorlibrary.com/sitemap.xml
// - Fetches each product JSON (/<handle>.json)
// - Parses `body_html` with cheerio to extract: Exact Color Name, Chip Formula Number, Manufacturer/ Paint Code, hex values
// - Collects variants, SKUs, and image URLs (prefers paint chip/swatches where available)
// - Optional CLI flags: --limit N, --concurrency N, --delay ms, --output <path>, --dedupe

const fs = require('fs').promises;
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const pLimitModule = require('p-limit');
const pLimit = pLimitModule.default || pLimitModule;
const cheerio = require('cheerio');

let fetchFn;
try { fetchFn = globalThis.fetch || require('node-fetch'); } catch (e) { fetchFn = require('node-fetch'); }

const SITEMAP_INDEX = 'https://www.autocolorlibrary.com/sitemap.xml';
const DEFAULT_OUTPUT = path.resolve(process.cwd(), 'carColors_autocolor_strict.json');

function parseArgs() {
  const raw = process.argv.slice(2);
  const get = (k, short) => {
    const i = raw.indexOf(k);
    if (i !== -1) return raw[i + 1] && !raw[i + 1].startsWith('--') ? raw[i + 1] : true;
    if (short) {
      const j = raw.indexOf(short);
      if (j !== -1) return raw[j + 1] && !raw[j + 1].startsWith('--') ? raw[j + 1] : true;
    }
    return null;
  };
  return {
    limit: parseInt(get('--limit','-n') || '0', 10) || 0,
    concurrency: parseInt(get('--concurrency') || '8', 10) || 8,
    delay: parseInt(get('--delay') || '150', 10) || 150,
    output: get('--output') || DEFAULT_OUTPUT,
    dedupe: !!get('--dedupe'),
    sample: parseInt(get('--sample') || '0', 10) || 0,
  };
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchFn(url, { headers: { 'User-Agent': 'forza-color-repo-scraper/1.0 (+https://github.com/forza-color-repo)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

function extractLocsFromSitemapXml(xml) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const locs = [];
  if (parsed?.sitemapindex?.sitemap) {
    const items = Array.isArray(parsed.sitemapindex.sitemap) ? parsed.sitemapindex.sitemap : [parsed.sitemapindex.sitemap];
    for (const it of items) if (it.loc) locs.push(it.loc);
  }
  if (parsed?.urlset?.url) {
    const items = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    for (const it of items) if (it.loc) locs.push(it.loc);
  }
  return locs;
}

function tidy(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

function extractFieldsFromHtml(html) {
  if (!html) return {};
  const $ = cheerio.load(html);
  const plain = tidy($.root().text());
  const fields = {};

  const tryRegex = (re) => {
    const m = plain.match(re);
    return m ? tidy(m[1]) : null;
  };

  fields.exactColorName = tryRegex(/Exact\s*Color\s*Name[:\s]*([^:\n]+)/i) || tryRegex(/Exact\s*Color[:\s]*([^:\n]+)/i);
  fields.chipFormula = tryRegex(/Chip\s*Formula\s*(?:Number)?[:\s]*([^:\n]+)/i) || tryRegex(/Formula\s*(?:Number)?[:\s]*([^:\n]+)/i);
  fields.manufacturerCode = tryRegex(/Manufacturer\s*(?:Paint\s*)?Code[:\s]*([^:\n]+)/i) || tryRegex(/Manufacturer\s*Code[:\s]*([^:\n]+)/i);
  fields.manufacturer = tryRegex(/Manufacturer[:\s]*([^:\n]+)/i);
  fields.hex = tryRegex(/(#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))/i);

  // Fallback: labels in bold / strong followed by sibling text
  if (!fields.exactColorName) {
    let found = null;
    $('b, strong, label').each((i, el) => {
      const txt = $(el).text();
      if (/Exact\s*Color/i.test(txt)) {
        const val = tidy($(el).next().text() || $(el).parent().text().replace(txt, ''));
        if (val) found = val;
      }
    });
    if (found) fields.exactColorName = found;
  }

  // If still nothing, try to pull trailing proper-name-like phrase from body
  if (!fields.exactColorName) {
    const m = plain.match(/(?:color|paint|oem)\s*[:\-]?\s*([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){0,4})$/i);
    if (m) fields.exactColorName = tidy(m[1]);
  }

  return fields;
}

async function crawlAll(opts) {
  console.log('Fetching sitemap index...');
  const indexXml = await fetchText(SITEMAP_INDEX);
  const sitemapLocs = extractLocsFromSitemapXml(indexXml);
  const productSitemaps = sitemapLocs.filter(u => typeof u === 'string' && u.includes('sitemap_products'));
  console.log(`Found ${productSitemaps.length} product sitemap(s).`);

  const productUrls = new Set();
  for (const sm of productSitemaps) {
    try {
      console.log('Fetching product sitemap:', sm);
      const xml = await fetchText(sm);
      const locs = extractLocsFromSitemapXml(xml);
      for (const l of locs) productUrls.add(l);
    } catch (err) {
      console.warn('Failed to fetch sitemap', sm, err.message);
    }
  }

  const urls = Array.from(productUrls).sort();
  console.log(`Discovered ${urls.length} product URLs (deduped).`);
  const toProcess = opts.limit && opts.limit > 0 ? urls.slice(0, opts.limit) : urls;
  console.log(`Processing ${toProcess.length} product URLs.`);

  const limit = pLimit(opts.concurrency || 8);
  const results = [];
  let counter = 0;

  await Promise.all(toProcess.map(url => limit(async () => {
    const idx = ++counter;
    try {
      const jsonUrl = url.endsWith('.json') ? url : `${url}.json`;
      const txt = await fetchText(jsonUrl);
      const j = JSON.parse(txt);
      const p = j.product || j;
      const html = p.body_html || '';
      const extracted = extractFieldsFromHtml(html);

      // Heuristic color from title
      let heuristicColor = p.title || '';
      if (p.vendor && heuristicColor.toLowerCase().startsWith((p.vendor || '').toLowerCase())) {
        heuristicColor = heuristicColor.slice((p.vendor || '').length).replace(/^(OEM\s*)/i, '').trim();
      }
      if (!extracted.exactColorName && heuristicColor) {
        // take trailing phrase
        const trail = heuristicColor.replace(/^(?:OEM\s*)/i, '').trim();
        if (trail) extracted.exactColorName = trail;
      }

      const images = (p.images || []).map(i => (typeof i === 'string' ? i : i.src || i.location)).filter(Boolean);
      const swatch = images.find(u => /ACL_PaintType|PaintType|ACL_Paint/i.test(u)) || images[0] || null;

      const item = {
        id: p.handle || `${p.id || ''}`,
        handle: p.handle || null,
        url,
        title: p.title || null,
        vendor: p.vendor || null,
        product_type: p.product_type || null,
        tags: p.tags || null,
        created_at: p.created_at || null,
        updated_at: p.updated_at || null,
        description: (p.body_html || '').replace(/<[^>]*>/g, '').trim().slice(0, 2000),
        exactColorName: extracted.exactColorName || null,
        chipFormula: extracted.chipFormula || null,
        manufacturerCode: extracted.manufacturerCode || null,
        manufacturer: extracted.manufacturer || null,
        hex: extracted.hex || null,
        skus: (p.variants || []).map(v => v.sku).filter(Boolean),
        variants: (p.variants || []).map(v => ({ id: v.id, title: v.title, sku: v.sku, price: v.price })),
        images,
        swatchImage: swatch,
        scrapedAt: new Date().toISOString(),
      };

      results.push(item);
      if (idx % 100 === 0) console.log(`Processed ${idx}/${toProcess.length}`);
    } catch (err) {
      console.error(`Failed product ${url}:`, err.message);
    } finally {
      await new Promise(r => setTimeout(r, opts.delay || 150));
    }
  })));

  console.log('Extraction finished. Records:', results.length);

  let final = results;
  if (opts.dedupe) {
    const map = new Map();
    for (const r of results) {
      const key = (r.manufacturerCode || r.chipFormula || r.exactColorName || r.title || r.handle || '').toLowerCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, r);
    }
    final = Array.from(map.values());
    console.log('Deduplicated ->', final.length, 'records');
  }

  await fs.writeFile(opts.output, JSON.stringify(final, null, 2), 'utf8');
  console.log('Wrote', opts.output);
  return final;
}

(async function main(){
  try {
    const opts = parseArgs();
    console.log('Options:', opts);
    await crawlAll(opts);
    console.log('Done.');
  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  }
})();
