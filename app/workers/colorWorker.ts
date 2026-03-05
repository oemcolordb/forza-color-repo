/**
 * Web Worker for loading and processing large color datasets
 * Prevents blocking the main thread during data operations
 */

self.addEventListener('message', async (e) => {
  const { type, payload } = e.data

  switch (type) {
    case 'LOAD_COLORS':
      try {
        const response = await fetch('/data/carColors.json')
        const colors = await response.json()
        self.postMessage({ type: 'COLORS_LOADED', payload: colors })
      } catch (error) {
        self.postMessage({ type: 'ERROR', payload: error.message })
      }
      break

    case 'FILTER_COLORS':
      const { colors, filters } = payload
      const filtered = colors.filter(color => {
        if (filters.make && color.make !== filters.make) return false
        if (filters.type && color.colorType !== filters.type) return false
        if (filters.search) {
          const search = filters.search.toLowerCase()
          return color.colorName.toLowerCase().includes(search) ||
                 color.make.toLowerCase().includes(search)
        }
        return true
      })
      self.postMessage({ type: 'COLORS_FILTERED', payload: filtered })
      break

    case 'SORT_COLORS':
      const { colors: colorsToSort, sortBy } = payload
      const sorted = [...colorsToSort].sort((a, b) => {
        if (sortBy === 'name') return a.colorName.localeCompare(b.colorName)
        if (sortBy === 'make') return a.make.localeCompare(b.make)
        return 0
      })
      self.postMessage({ type: 'COLORS_SORTED', payload: sorted })
      break
  }
})
