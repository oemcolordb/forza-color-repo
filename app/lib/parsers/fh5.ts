/**
 * lib/parsers/fh5.ts
 * Converts Firecrawl markdown into typed FH5Location objects.
 */

import type {
  FH5Location,
  FH5Region,
  LocationType,
} from "../../types/fh5";
import { COLLECTIBLE_TYPES } from "../../types/fh5";

type RawSource = "IGN" | "G4G";

const TYPE_KEYWORDS: Record<string, LocationType> = {
  "barn find": "Barn Find",
  "speed camera": "Speed Camera",
  "danger sign": "Danger Sign",
  "drift zone": "Drift Zone",
  "speed zone": "Speed Zone",
  trailblazer: "Trailblazer",
  "bonus board": "Bonus Board",
  "fast travel board": "Fast Travel Board",
  "xp board": "XP Board",
  showcase: "Showcase",
  accolade: "Accolade",
  "race route": "Race Route",
  "pr stunt": "PR Stunt",
  "photo challenge": "Photo Challenge",
  "seasonal event": "Seasonal Event",
  "hidden road": "Hidden Road",
};

const REGION_KEYWORDS: Record<string, FH5Region> = {
  guanajuato: "Guanajuato",
  "gran caldera": "Gran Caldera",
  caldera: "Gran Caldera",
  volcano: "Gran Caldera",
  canyon: "Copper Canyon",
  "copper canyon": "Copper Canyon",
  baja: "Baja",
  coastal: "Baja",
  jungle: "Jungle",
  rainforest: "Jungle",
  ruin: "Jungle",
  mayan: "Jungle",
  plain: "Plains",
  farmland: "Plains",
  festival: "Festival Grounds",
  horizon: "Festival Grounds",
  dune: "Dunas Blancas",
  "dunas blancas": "Dunas Blancas",
  sand: "Dunas Blancas",
  riviera: "Riviera Maya",
  resort: "Riviera Maya",
};

function classifyType(text: string): LocationType {
  const lower = text.toLowerCase();
  for (const [kw, type] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(kw)) return type;
  }
  return "Unknown";
}

function inferRegion(text: string): FH5Region {
  const lower = text.toLowerCase();
  for (const [kw, region] of Object.entries(REGION_KEYWORDS)) {
    if (lower.includes(kw)) return region;
  }
  return "Unknown";
}

function extractCoords(
  text: string
): { x: number; y: number } | undefined {
  const match = text.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (!match) return undefined;
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
}

function slugify(name: string, source: string): string {
  return `${name}-${source}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseLine(
  line: string,
  source: RawSource,
  contextRegion: FH5Region
): FH5Location | null {
  const clean = line
    .replace(/#+\s*/g, "")
    .replace(/\*+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

  if (clean.length < 5 || clean.length > 140) return null;
  if (/^https?:|^!\[|\|/.test(clean)) return null;

  const type = classifyType(clean);
  const region = type !== "Unknown"
    ? inferRegion(clean) !== "Unknown"
      ? inferRegion(clean)
      : contextRegion
    : contextRegion;

  const name = clean.replace(/^\d+[.)]\s*/, "").replace(/^[-•]\s*/, "").trim();
  if (!name) return null;

  return {
    id: slugify(name, source),
    name,
    type,
    region,
    source,
    coords: extractCoords(clean),
    collectible: COLLECTIBLE_TYPES.includes(type),
  };
}

/**
 * Parse raw Firecrawl markdown into a deduplicated FH5Location array.
 */
export function parseMarkdown(
  markdown: string,
  source: RawSource
): FH5Location[] {
  const lines = markdown.split("\n");
  const results: FH5Location[] = [];
  const seen = new Set<string>();
  let contextRegion: FH5Region = "Unknown";

  for (const line of lines) {
    // Track current region from headings
    if (/^#{1,3}\s/.test(line)) {
      const inferred = inferRegion(line);
      if (inferred !== "Unknown") contextRegion = inferred;
    }

    const loc = parseLine(line, source, contextRegion);
    if (!loc) continue;

    const dedupKey = loc.name.toLowerCase().slice(0, 50);
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    results.push(loc);
  }

  return results;
}

/**
 * Merge IGN and G4G location arrays, deduplicating by name.
 * Entries found in both sources get source: "both".
 */
export function mergeLocations(
  ign: FH5Location[],
  g4g: FH5Location[]
): FH5Location[] {
  const map = new Map<string, FH5Location>();

  for (const loc of ign) {
    map.set(loc.name.toLowerCase(), loc);
  }

  for (const loc of g4g) {
    const key = loc.name.toLowerCase();
    if (map.has(key)) {
      const existing = map.get(key)!;
      map.set(key, {
        ...existing,
        source: "both",
        coords: existing.coords ?? loc.coords,
        description: existing.description ?? loc.description,
      });
    } else {
      map.set(key, loc);
    }
  }

  return Array.from(map.values());
}
