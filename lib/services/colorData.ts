/**
 * services/colorData.ts
 *
 * Re-exports getColorData for lazy/async consumers and provides a
 * synchronous default export for legacy components that import
 * `colorData` as a static array.
 *
 * Legacy components (e.g. image-match/page.tsx) import this as:
 *   import colorData from '@/lib/services/colorData'
 * and pass it directly as a prop.  Since getColorData() is async,
 * we export an empty array as the default and let those pages
 * hydrate via useEffect instead.
 */

import { CarColor } from '@/types'

export { getColorData } from '@/lib/services/colorDataLazy'

// Synchronous default for backwards-compatible imports.
// Components should migrate to useEffect + getColorData() for real data.
const colorData: CarColor[] = []
export default colorData
