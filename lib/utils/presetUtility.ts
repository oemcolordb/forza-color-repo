export interface FavoriteColor {
  colorId: string;
  colorName: string;
  make: string;
  model?: string;
  colorType?: string;
  color1: { h: number; s: number; b: number };
  color2?: { h: number; s: number; b: number };
  year?: number;
}

export interface PresetPalette {
  name: string;
  description?: string;
  tags?: string[];
  colors: FavoriteColor[];
}

export interface ExportPresetData {
  type: 'forza-color-presets';
  version: '1.0';
  exportedAt: string;
  palettes?: PresetPalette[];
  favorites?: FavoriteColor[];
}

/**
 * Initiates a browser download of a JSON file containing the exported presets
 */
export function exportPresetsToFile(
  data: { palettes?: PresetPalette[]; favorites?: FavoriteColor[] },
  fileName: string = 'forza-color-presets.json'
): void {
  if (typeof window === 'undefined') return;

  const exportData: ExportPresetData = {
    type: 'forza-color-presets',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    palettes: data.palettes,
    favorites: data.favorites,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses imported JSON data.
 * Returns the parsed data or throws an Error with a descriptive message.
 */
export function parseAndValidatePresets(jsonString: string): {
  palettes: PresetPalette[];
  favorites: FavoriteColor[];
} {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format. Please upload a valid JSON file.');
  }

  // Support both new export format and direct legacy arrays
  if (parsed && parsed.type === 'forza-color-presets') {
    const palettes: PresetPalette[] = [];
    const favorites: FavoriteColor[] = [];

    if (Array.isArray(parsed.palettes)) {
      parsed.palettes.forEach((p: any, idx: number) => {
        const validated = validatePalette(p, `palettes[${idx}]`);
        if (validated) palettes.push(validated);
      });
    }

    if (Array.isArray(parsed.favorites)) {
      parsed.favorites.forEach((f: any, idx: number) => {
        const validated = validateColor(f, `favorites[${idx}]`);
        if (validated) favorites.push(validated);
      });
    }

    return { palettes, favorites };
  } else if (Array.isArray(parsed)) {
    // Check if it's an array of palettes or an array of colors
    if (parsed.length === 0) {
      return { palettes: [], favorites: [] };
    }

    // Inspect first element
    const first = parsed[0];
    if (first && Array.isArray(first.colors) && typeof first.name === 'string') {
      const palettes: PresetPalette[] = [];
      parsed.forEach((p: any, idx: number) => {
        const validated = validatePalette(p, `[${idx}]`);
        if (validated) palettes.push(validated);
      });
      return { palettes, favorites: [] };
    } else if (first && first.colorId && first.colorName && first.color1) {
      const favorites: FavoriteColor[] = [];
      parsed.forEach((f: any, idx: number) => {
        const validated = validateColor(f, `[${idx}]`);
        if (validated) favorites.push(validated);
      });
      return { palettes: [], favorites };
    }
  }

  throw new Error('Unsupported presets format. Make sure it is a valid export file.');
}

function validateColor(color: any, path: string): FavoriteColor {
  if (!color || typeof color !== 'object') {
    throw new Error(`Invalid color at ${path}: Must be an object.`);
  }
  if (!color.colorName || typeof color.colorName !== 'string') {
    throw new Error(`Invalid color at ${path}: 'colorName' is required.`);
  }
  if (!color.color1 || typeof color.color1 !== 'object') {
    throw new Error(`Invalid color at ${path}: 'color1' object is required.`);
  }
  
  const h1 = Number(color.color1.h);
  const s1 = Number(color.color1.s);
  const b1 = Number(color.color1.b);

  if (isNaN(h1) || isNaN(s1) || isNaN(b1)) {
    throw new Error(`Invalid color at ${path}: color1 HSB values must be numbers.`);
  }

  const result: FavoriteColor = {
    colorId: color.colorId || `imported_${Math.random().toString(36).substring(2, 9)}`,
    colorName: color.colorName,
    make: color.make || 'Custom',
    model: color.model,
    colorType: color.colorType || 'Solid',
    color1: { h: h1, s: s1, b: b1 },
  };

  if (color.color2 && typeof color.color2 === 'object') {
    const h2 = Number(color.color2.h);
    const s2 = Number(color.color2.s);
    const b2 = Number(color.color2.b);
    if (!isNaN(h2) && !isNaN(s2) && !isNaN(b2)) {
      result.color2 = { h: h2, s: s2, b: b2 };
    }
  }

  if (color.year) {
    result.year = Number(color.year);
  }

  return result;
}

function validatePalette(palette: any, path: string): PresetPalette {
  if (!palette || typeof palette !== 'object') {
    throw new Error(`Invalid palette at ${path}: Must be an object.`);
  }
  if (!palette.name || typeof palette.name !== 'string') {
    throw new Error(`Invalid palette at ${path}: 'name' is required.`);
  }
  if (!Array.isArray(palette.colors) || palette.colors.length < 1) {
    throw new Error(`Invalid palette at ${path}: 'colors' must be a non-empty array.`);
  }

  const validatedColors = palette.colors.map((c: any, idx: number) => 
    validateColor(c, `${path}.colors[${idx}]`)
  );

  return {
    name: palette.name,
    description: palette.description || '',
    tags: Array.isArray(palette.tags) ? palette.tags.map((t: any) => String(t)) : [],
    colors: validatedColors,
  };
}
