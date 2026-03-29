/**
 * types/fh5.ts
 * Core types for the FH5 location finder.
 */

export type LocationType =
  | "Barn Find"
  | "Speed Camera"
  | "Danger Sign"
  | "Drift Zone"
  | "Speed Zone"
  | "Trailblazer"
  | "Bonus Board"
  | "Fast Travel Board"
  | "XP Board"
  | "Showcase"
  | "Accolade"
  | "Race Route"
  | "PR Stunt"
  | "Photo Challenge"
  | "Seasonal Event"
  | "Hidden Road"
  | "Unknown";

export type FH5Region =
  | "Guanajuato"
  | "Gran Caldera"
  | "Copper Canyon"
  | "Baja"
  | "Jungle"
  | "Plains"
  | "Festival Grounds"
  | "Dunas Blancas"
  | "Riviera Maya"
  | "Unknown";

export interface FH5Location {
  id: string;
  name: string;
  type: LocationType;
  region: FH5Region;
  source: "IGN" | "G4G" | "both";
  coords?: { x: number; y: number };
  description?: string;
  collectible: boolean;
  tags?: string[];
}

export const COLLECTIBLE_TYPES: LocationType[] = [
  "Bonus Board",
  "Fast Travel Board",
  "XP Board",
  "Barn Find",
  "Photo Challenge",
];

export const ALL_LOCATION_TYPES: LocationType[] = [
  "Barn Find", "Speed Camera", "Danger Sign", "Drift Zone", "Speed Zone",
  "Trailblazer", "Bonus Board", "Fast Travel Board", "XP Board", "Showcase",
  "Accolade", "Race Route", "PR Stunt", "Photo Challenge", "Seasonal Event",
  "Hidden Road", "Unknown",
];

export const ALL_REGIONS: FH5Region[] = [
  "Guanajuato", "Gran Caldera", "Copper Canyon", "Baja", "Jungle",
  "Plains", "Festival Grounds", "Dunas Blancas", "Riviera Maya", "Unknown",
];
