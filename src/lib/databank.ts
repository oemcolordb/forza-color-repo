/**
 * lib/databank.ts
 * Horizon Oracle Databank utility for validating and persisting FH5 data.
 */

import { promises as fs } from "fs";
import { join } from "path";
import {
  FH5VehicleSchema,
  FH5PaintCodeSchema,
  type FH5Vehicle,
  type FH5PaintCode,
} from "../types/fh5.ts";

const DATABANK_ROOT = process.cwd();

export type DatabankCategory = "vehicles" | "tuning_math" | "cosmetics" | "race_types";

type DatabankData = FH5Vehicle | FH5PaintCode;

const categorySchemaMap: Record<DatabankCategory, unknown> = {
  vehicles: FH5VehicleSchema,
  tuning_math: FH5VehicleSchema, // Placeholder - extend as needed
  cosmetics: FH5PaintCodeSchema,
  race_types: FH5VehicleSchema, // Placeholder - extend as needed
};

/**
 * Validates and writes data to the Horizon Oracle Databank.
 *
 * @param category - The databank subdirectory (vehicles, tuning_math, cosmetics, race_types)
 * @param id - Unique identifier for the data entry (used as filename)
 * @param data - The data object to validate and persist
 * @throws Error if validation fails or write operation fails
 */
export async function writeToDatabank(
  category: DatabankCategory,
  id: string,
  data: DatabankData
): Promise<void> {
  // Validate category
  if (!categorySchemaMap[category]) {
    throw new Error(`Invalid databank category: ${category}`);
  }

  // Get schema for category
  const schema = categorySchemaMap[category];

  // Validate data against schema
  const parseResult = (schema as { safeParse: (_data: unknown) => { success: boolean; error?: { errors: { path: (string | number)[]; message: string }[] } } }).safeParse(data);

  if (!parseResult.success) {
    const errorMessages = parseResult.error?.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    ).join("; ");
    throw new Error(`Validation failed for ${category}/${id}: ${errorMessages}`);
  }

  // Ensure valid filename
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeId}.json`;

  // Build full path
  const dirPath = join(DATABANK_ROOT, "horizon_databank", category);
  const filePath = join(dirPath, filename);

  // Ensure directory exists
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }

  // Write formatted JSON
  const formattedJson = JSON.stringify(data, null, 2);

  try {
    await fs.writeFile(filePath, formattedJson, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write to ${filePath}: ${error}`);
  }
}

/**
 * Reads data from the Horizon Oracle Databank.
 *
 * @param category - The databank subdirectory
 * @param id - The identifier for the data entry
 * @returns Parsed JSON data
 * @throws Error if file doesn't exist or read fails
 */
export async function readFromDatabank(
  category: DatabankCategory,
  id: string
): Promise<unknown> {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeId}.json`;
  const filePath = join(DATABANK_ROOT, "horizon_databank", category, filename);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read from ${filePath}: ${error}`);
  }
}

/**
 * Lists all entries in a databank category.
 *
 * @param category - The databank subdirectory
 * @returns Array of entry IDs (filenames without extension)
 */
export async function listDatabankEntries(category: DatabankCategory): Promise<string[]> {
  const dirPath = join(DATABANK_ROOT, "horizon_databank", category);

  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    // Directory doesn't exist or is empty
    return [];
  }
}
