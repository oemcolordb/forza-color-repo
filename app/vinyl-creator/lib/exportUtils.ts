/**
 * Export Utilities
 * Handles exporting vinyl designs in various formats
 */

import { VinylDesign, Shape } from '../types/vinyl'

export type ExportFormat = 'json' | 'csv' | 'svg' | 'html'

/**
 * Export design as JSON
 */
export function exportAsJSON(design: VinylDesign): string {
  return JSON.stringify(design, null, 2)
}

/**
 * Export design as CSV
 */
export function exportAsCSV(design: VinylDesign): string {
  const headers = ['ID', 'Name', 'Role', 'Layer', 'Color', 'Type', 'Opacity']
  const rows = design.shapes.map(shape => [
    shape.id,
    shape.name,
    shape.role,
    shape.layer,
    shape.color,
    shape.role,
    shape.opacity
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

/**
 * Export design as SVG
 */
export function exportAsSVG(design: VinylDesign): string {
  const shapes = design.shapes
    .sort((a, b) => a.layer - b.layer)
    .map(shape => {
      const transform = `translate(${shape.transform.x},${shape.transform.y}) rotate(${shape.transform.rotation}) scale(${shape.transform.scaleX},${shape.transform.scaleY})`
      return `<path d="${shape.pathData}" fill="${shape.color}" opacity="${shape.opacity}" transform="${transform}" />`
    })
    .join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="500" xmlns="http://www.w3.org/2000/svg">
  <title>${design.name}</title>
  <desc>${design.description}</desc>
  ${shapes}
</svg>`
}

/**
 * Export design as HTML
 */
export function exportAsHTML(design: VinylDesign): string {
  const shapesList = design.shapes
    .map(shape => {
      const colorStyle = `background-color: ${shape.color}; opacity: ${shape.opacity};`
      return `
    <div class="shape-item">
      <div class="shape-preview" style="${colorStyle}"></div>
      <div class="shape-info">
        <h4>${shape.name}</h4>
        <p>Role: ${shape.role}</p>
        <p>Layer: ${shape.layer}</p>
        <p>Color: ${shape.color}</p>
      </div>
    </div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${design.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .design-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .shapes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .shape-item {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .shape-preview {
      width: 100%;
      height: 100px;
      border-bottom: 1px solid #eee;
    }
    .shape-info {
      padding: 15px;
    }
    .shape-info h4 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .shape-info p {
      margin: 5px 0;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="design-info">
    <h1>${design.name}</h1>
    <p>${design.description}</p>
    <p><strong>Complexity:</strong> ${design.complexity}</p>
    <p><strong>Total Shapes:</strong> ${design.shapes.length}</p>
  </div>
  <div class="shapes-grid">
    ${shapesList}
  </div>
</body>
</html>`
}

/**
 * Export design in specified format
 */
export function exportDesign(design: VinylDesign, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return exportAsJSON(design)
    case 'csv':
      return exportAsCSV(design)
    case 'svg':
      return exportAsSVG(design)
    case 'html':
      return exportAsHTML(design)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Download exported content as file
 */
export function downloadExport(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(design: VinylDesign, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const sanitizedName = design.name.toLowerCase().replace(/\s+/g, '-')
  const extension = format === 'svg' ? 'svg' : format === 'html' ? 'html' : format === 'csv' ? 'csv' : 'json'
  return `${sanitizedName}-${timestamp}.${extension}`
}

/**
 * Export and download design
 */
export function exportAndDownload(design: VinylDesign, format: ExportFormat) {
  const content = exportDesign(design, format)
  const filename = generateFilename(design, format)
  const mimeTypes: Record<ExportFormat, string> = {
    json: 'application/json',
    csv: 'text/csv',
    svg: 'image/svg+xml',
    html: 'text/html'
  }
  downloadExport(content, filename, mimeTypes[format])
}
