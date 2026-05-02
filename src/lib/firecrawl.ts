/**
 * lib/firecrawl.ts
 * Firecrawl scraping helpers for the FH5 location finder.
 * Results are cached in module scope for the lifetime of the session.
 */

const FIRECRAWL_API_KEY = "fc-5d313c8cc6a9486698eefa3a42b6a265";
const FIRECRAWL_URL = "https://api.firecrawl.dev/v1/scrape";

export const FH5_SOURCES = {
  IGN: "https://www.ign.com/maps/forza-horizon-5/mexico",
  G4G: "https://guides4gamers.com/forza-horizon-5/maps/mexico/",
} as const;

export type SourceKey = keyof typeof FH5_SOURCES;

const cache = new Map<string, string>();

// A small set of common User-Agent strings to rotate between when calling
// the Firecrawl API. This helps if the API or target site expects a browser
// like header. Rotation is optional and conservative.
const USER_AGENTS = [
  // Desktop Chrome (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  // Desktop Safari (macOS)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  // Desktop Firefox (Linux)
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0',
  // Mobile Chrome (Android)
  'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.110 Mobile Safari/537.36',
  // A neutral server identifier as a last resort
  'forza-color-repo/1.0 (+https://github.com/forza-color-repo)'
];

function pickHeaders(targetUrl?: string): Record<string, string> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  let referer = '';
  try {
    if (targetUrl) referer = new URL(targetUrl).origin;
  } catch (_) {
    referer = '';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
    'User-Agent': ua,
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'application/json',
  };

  if (referer) headers['Referer'] = referer;
  return headers;
}

async function scrapeUrl(url: string): Promise<string> {
  const payload = {
    url,
    formats: ["markdown"],
    onlyMainContent: true,
    waitFor: 2500,
    actions: [{ type: "wait", milliseconds: 2000 }],
  };

  const headers = pickHeaders(url);
  console.debug(`[FH5] scrapeUrl headers: User-Agent=${headers['User-Agent']} Referer=${headers['Referer'] || '-'} for ${url}`);

  const res = await fetch(FIRECRAWL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // If primary scrape works, return result
  if (res.ok) {
    const json = await res.json();
    return json?.data?.markdown ?? "";
  }

  // If Firecrawl returns 403, try the /v1/crawl endpoint with JS rendering enabled
  if (res.status === 403) {
    try {
      const crawlUrl = "https://api.firecrawl.dev/v1/crawl";
      const crawlPayload = { ...payload, javascript: true } as any;

      const crawlHeaders = pickHeaders(url);
      console.debug(`[FH5] crawl retry headers: User-Agent=${crawlHeaders['User-Agent']} Referer=${crawlHeaders['Referer'] || '-'} for ${url}`);

      const crawlRes = await fetch(crawlUrl, {
        method: 'POST',
        headers: crawlHeaders,
        body: JSON.stringify(crawlPayload),
      });

      if (crawlRes.ok) {
        const json = await crawlRes.json();
        return json?.data?.markdown ?? "";
      }

      const crawlText = await crawlRes.text().catch(() => "");
      throw new Error(`Firecrawl crawl HTTP ${crawlRes.status} for ${url} - ${crawlText.slice(0,200)}`);
    } catch (err: any) {
      throw new Error(`Firecrawl 403 for ${url}; crawl retry failed: ${err?.message ?? err}`);
    }
  }

  // Other non-OK responses: include small body preview to aid debugging
  const bodyText = await res.text().catch(() => "");
  throw new Error(`Firecrawl HTTP ${res.status} for ${url}${bodyText ? ` - ${bodyText.slice(0,200)}` : ''}`);
}

/**
 * Scrape a single FH5 source, with session-level caching.
 * Returns null on failure or sparse result.
 */
export async function safeScrape(source: SourceKey): Promise<string | null> {
  const url = FH5_SOURCES[source];

  if (cache.has(url)) {
    return cache.get(url)!;
  }

  try {
    const markdown = await scrapeUrl(url);
    const lineCount = markdown.split("\n").length;

    if (lineCount < 50) {
      console.warn(
        `[FH5] Sparse scrape (${lineCount} lines) from ${source} - ` +
        `JS rendering may be needed. Check Firecrawl dashboard settings.`
      );
      return null;
    }

    cache.set(url, markdown);
    return markdown;
  } catch (err) {
    console.error(`[FH5] Scrape failed for ${source}:`, err);
    return null;
  }
}

/**
 * Scrape both IGN and G4G in parallel.
 * Returns an object keyed by source.
 */
export async function scrapeAllSources(): Promise<
  Record<SourceKey, string | null>
> {
  const [ign, g4g] = await Promise.all([
    safeScrape("IGN"),
    safeScrape("G4G"),
  ]);
  return { IGN: ign, G4G: g4g };
}

/** Clear the in-memory cache (call to force a re-scrape). */
export function clearScrapeCache(): void {
  cache.clear();
}
