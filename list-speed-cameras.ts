import { FH5_SOURCES, safeScrape } from "./src/lib/firecrawl.js";
import { parseMarkdown } from "./src/lib/parsers/fh5.js";

(async () => {
  for (const src of Object.keys(FH5_SOURCES) as (keyof typeof FH5_SOURCES)[]) {
    const md = await safeScrape(src);
    if (md) {
      const locs = parseMarkdown(md, src);
      const cams = locs.filter(l => l.type === "Speed Camera");
      for (const c of cams) {
        console.log(`📍 ${c.name}\n   Type:    ${c.type}\n   Region:  ${c.region}\n   Source:  ${src}\n   Coords:  ${c.coords ? `[${c.coords.x}, ${c.coords.y}]` : "not available"}\n`);
      }
    }
  }
})();
