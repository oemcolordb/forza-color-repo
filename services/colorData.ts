import { getColorData } from './colorDataLazy'

// Default export as a static array for compatibility with older components
// Note: In a production app with thousands of colors, you'd want to use the 
// lazy loading or a search API instead.
export const colorData = getColorData()

export default colorData
