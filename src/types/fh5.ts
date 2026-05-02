import * as z from "zod";

/**
 * types/fh5.ts
 * Core types for the FH5 location finder and Horizon Oracle Databank.
 */

// ============================================================================
// HORIZON ORACLE DATABANK SCHEMAS
// ============================================================================

export const HSVSchema = z.object({
  h: z.number().min(0).max(360),
  s: z.number().min(0).max(100),
  v: z.number().min(0).max(100),
});

export const FH5ClassEnum = z.enum(["D", "C", "B", "A", "S1", "S2", "X"]);

export const FH5DrivetrainEnum = z.enum(["FWD", "RWD", "AWD"]);

export const FH5EnginePlacementEnum = z.enum(["front", "mid", "rear"]);

export const FH5PaintTypeEnum = z.enum(["gloss", "matte", "metallic", "special"]);

export const FH5VehicleSchema = z.object({
  id: z.string(),
  ingame_name: z.string(),
  class: FH5ClassEnum,
  base_pi: z.number().int().min(100).max(999),
  weight_kg: z.number().positive(),
  weight_bias_front: z.number().min(0).max(100),
  drivetrain: FH5DrivetrainEnum,
  engine_placement: FH5EnginePlacementEnum,
});

export const FH5PaintCodeSchema = z.object({
  manufacturer: z.string(),
  color_name: z.string(),
  paint_type: FH5PaintTypeEnum,
  base_hsv: HSVSchema,
  highlight_hsv: HSVSchema,
});

// TypeScript types inferred from Zod schemas
export type HSV = z.infer<typeof HSVSchema>;
export type FH5Class = z.infer<typeof FH5ClassEnum>;
export type FH5Drivetrain = z.infer<typeof FH5DrivetrainEnum>;
export type FH5EnginePlacement = z.infer<typeof FH5EnginePlacementEnum>;
export type FH5PaintType = z.infer<typeof FH5PaintTypeEnum>;
export type FH5Vehicle = z.infer<typeof FH5VehicleSchema>;
export type FH5PaintCode = z.infer<typeof FH5PaintCodeSchema>;

// ============================================================================
// LOCATION FINDER TYPES (Original)
// ============================================================================

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
