---
name: content-scraper
description: 'Scrape and parse Forza Horizon 5 car data from external sources (e.g., KudosPrime, IGN). Extracts raw tabular data or text and formats it accurately into the cars.json schema.'
argument-hint: 'Provide the URL or paste the raw markup to parse'
---

# Content Scraper: Forza Dataset

This skill provides a systematic approach to fetching, parsing, and formatting raw car or map data from trusted external sources (like KudosPrime, IGN, or official databases) into the project's strict JSON schema.

## When to Use
- When updating `cars.json` with new series updates or missing vehicles.
- When migrating external wiki tables or lists into structured application data.
- When validating a list of cars against an external source of truth.

## Procedure

### 1. Acquire the Raw Data
- **Via URL**: Run the bundled Firecrawl scraping script. This script automatically handles Cloudflare bypass and IP proxy rotation.
  ```bash
  node .github/skills/content-scraper/scripts/fetch.js "<target_url>"
  ```
- **Via User Input**: If the user pastes a raw table or list into the chat, use that as the source text.

### 2. Analyze the Source Structure
- Identify how the source formats key attributes: Year, Manufacturer, Model, Class/PI, Price, and Rarity.
- Note any missing fields that will require sensible defaults or secondary lookups (e.g., if handling/speed stats are missing, determine if they can be estimated or if they need to be left as 0).

### 3. Extract and Map to the `cars.json` Schema
Transform the extracted data to match the exact `Car` interface used in the project:
```json
{
  "year": "String (e.g., '2021')",
  "manufacturer": "String",
  "model": "String",
  "type": "String (e.g., 'Hypercar', 'Sedan')",
  "price": "Number",
  "rarity": "Common | Rare | Epic | Legendary",
  "country": "String",
  "stats": {
    "speed": "Number",
    "handling": "Number",
    "acceleration": "Number",
    "launch": "Number",
    "braking": "Number",
    "offroad": "Number"
  },
  "pi": {
    "class": "D | C | B | A | S1 | S2 | X",
    "value": "Number"
  }
}
```

### 4. Data Cleansing & Validation
- **Normalize Text**: Ensure manufacturers and models are spelled consistently (e.g., "Mercedes-AMG" vs "Mercedes Benz").
- **Type Checking**: Cast prices to integers, stats to floats, and years to strings as per the schema.
- **Deduplication Check**: Run the newly parsed data against the existing `cars.json` via the `data-audit` skill to prevent overwriting or duplicating existing correct entries.

### 5. Output
Produce the final JSON array and offer to either write it to a temporary staging file (e.g., `cars_update.json`) or append it directly to `cars.json` and `public/cars.json`.
