// Re-export from colorDataLazy.js for consistent lazy loading behavior
// This avoids static import of the large JSON file which causes build issues
export { getColorData, getMakes, getColorChunk, getCriticalColors, getFilteredColors } from './colorDataLazy'

// Default export for backward compatibility with direct importers
// Note: This is a promise that resolves to the color data array
import { getColorData } from './colorDataLazy'
const colorDataPromise = getColorData()
export default colorDataPromise
