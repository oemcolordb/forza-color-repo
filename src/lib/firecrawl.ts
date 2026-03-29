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

async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(FIRECRAWL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 2500,
      actions: [{ type: "wait", milliseconds: 2000 }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Firecrawl HTTP ${res.status} for ${url}`);
  }

  const json = await res.json();
  return json?.data?.markdown ?? "";
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
