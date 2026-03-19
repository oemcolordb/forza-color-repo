/**
 * Batch Export Utility
 * Export colors in various formats (JSON, CSV, TXT)
 */

interface CarColor {
  make: string;
  model: string;
  year: number | null;
  colorName: string;
  colorType: string;
  color1: { h: number; s: number; b: number };
  color2: { h: number; s: number; b: number };
}

/**
 * Export colors as JSON
 * @param colors - Array of colors
 * @param filename - Output filename
 */
export function exportAsJSON(colors: CarColor[], filename: string = 'forza-colors.json'): void {
  const data = JSON.stringify(colors, null, 2);
  downloadFile(data, filename, 'application/json');
}

/**
 * Export colors as CSV
 * @param colors - Array of colors
 * @param filename - Output filename
 */
export function exportAsCSV(colors: CarColor[], filename: string = 'forza-colors.csv'): void {
  const headers = ['Make', 'Model', 'Year', 'Color Name', 'Color Type', 'H1', 'S1', 'B1', 'H2', 'S2', 'B2'];
  
  const rows = colors.map(color => [
    escapeCSV(color.make),
    escapeCSV(color.model),
    color.year?.toString() || '',
    escapeCSV(color.colorName),
    escapeCSV(color.colorType),
    color.color1.h.toFixed(3),
    color.color1.s.toFixed(3),
    color.color1.b.toFixed(3),
    color.color2.h.toFixed(3),
    color.color2.s.toFixed(3),
    color.color2.b.toFixed(3)
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export colors as plain text
 * @param colors - Array of colors
 * @param filename - Output filename
 */
export function exportAsText(colors: CarColor[], filename: string = 'forza-colors.txt'): void {
  const lines = colors.map(color => {
    const hsb1 = `HSB(${Math.round(color.color1.h * 360)}°, ${Math.round(color.color1.s * 100)}%, ${Math.round(color.color1.b * 100)}%)`;
    return `${color.colorName} - ${color.make} ${color.model} (${color.year || 'N/A'}) - ${color.colorType} - ${hsb1}`;
  });

  const text = lines.join('\n');
  downloadFile(text, filename, 'text/plain');
}

/**
 * Export colors as HTML
 * @param colors - Array of colors
 * @param filename - Output filename
 */
export function exportAsHTML(colors: CarColor[], filename: string = 'forza-colors.html'): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forza Colors Export</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: #fff; }
    h1 { color: #4CAF50; }
    .color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    .color-card { background: #2a2a2a; border-radius: 8px; padding: 15px; border: 1px solid #444; }
    .color-swatch { width: 100%; height: 80px; border-radius: 4px; margin-bottom: 10px; }
    .color-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
    .color-info { font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <h1>Forza Colors Export (${colors.length} colors)</h1>
  <div class="color-grid">
    ${colors.map(color => `
      <div class="color-card">
        <div class="color-swatch" style="background: hsl(${color.color1.h * 360}, ${color.color1.s * 100}%, ${color.color1.b * 100}%);"></div>
        <div class="color-name">${escapeHTML(color.colorName)}</div>
        <div class="color-info">${escapeHTML(color.make)} ${escapeHTML(color.model)}</div>
        <div class="color-info">${color.year || 'N/A'} • ${escapeHTML(color.colorType)}</div>
        <div class="color-info">HSB: ${Math.round(color.color1.h * 360)}°, ${Math.round(color.color1.s * 100)}%, ${Math.round(color.color1.b * 100)}%</div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `.trim();

  downloadFile(html, filename, 'text/html');
}

/**
 * Export colors as Photoshop ACO (Adobe Color Swatch)
 * @param colors - Array of colors
 * @param filename - Output filename
 */
export function exportAsACO(colors: CarColor[], filename: string = 'forza-colors.aco'): void {
  // ACO format is binary, simplified version
  const header = new Uint8Array([0, 1, 0, 0]); // Version 1, 0 colors (placeholder)
  const colorCount = new Uint16Array([colors.length]);
  
  // Note: Full ACO implementation would require proper binary encoding
  // This is a simplified version
  alert('ACO export coming soon! Use JSON or CSV for now.');
}

/**
 * Download file to user's computer
 * @param content - File content
 * @param filename - Filename
 * @param mimeType - MIME type
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Escape CSV field
 * @param value - Field value
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Escape HTML
 * @param value - HTML string
 */
function escapeHTML(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Get export format options
 */
export const EXPORT_FORMATS = {
  JSON: { label: 'JSON', extension: '.json', handler: exportAsJSON },
  CSV: { label: 'CSV (Excel)', extension: '.csv', handler: exportAsCSV },
  TXT: { label: 'Text', extension: '.txt', handler: exportAsText },
  HTML: { label: 'HTML', extension: '.html', handler: exportAsHTML },
} as const;

export type ExportFormat = keyof typeof EXPORT_FORMATS;
