// Lazy loading wrapper for the large color data
// Fetches from /carColors.json at runtime to avoid build-time bundling issues
let colorDataCache = null
let colorDataPromise = null

export const getColorData = () => {
  if (colorDataCache) {
    return Promise.resolve(colorDataCache)
  }

  if (colorDataPromise) {
    return colorDataPromise
  }

  colorDataPromise = fetch('/carColors.json')
    .then(response => response.json())
    .then(data => {
      colorDataCache = data
      console.log('Color data loaded:', data?.length || 0, 'colors')
      return colorDataCache || []
    })
    .catch(error => {
      console.error('Failed to load color data:', error)
      return []
    })

  return colorDataPromise
}

// Get unique makes with caching
let makesCache = null

export const getMakes = async () => {
  if (makesCache) {
    return makesCache
  }

  const colors = await getColorData()
  const uniqueMakes = Array.from(new Set(colors.map(color => color.make)))
  makesCache = uniqueMakes.sort()
  return makesCache
}

// Get color chunks for progressive loading
export const getColorChunk = async (offset = 0, limit = 500) => {
  try {
    const allColors = await getColorData()
    return allColors.slice(offset, offset + limit)
  } catch (error) {
    console.error('Failed to load color chunk:', error)
    return []
  }
}

// Get critical colors for instant display
export const getCriticalColors = async () => {
  try {
    const allColors = await getColorData()
    const popularMakes = ['Ferrari', 'Porsche', 'BMW', 'Mercedes-Benz', 'Audi']
    const criticalColors = allColors
      .filter(color => popularMakes.includes(color.make))
      .slice(0, 100)
    return criticalColors.length > 0 ? criticalColors : allColors.slice(0, 100)
  } catch (error) {
    console.error('Failed to load critical colors:', error)
    return []
  }
}

// Efficient filtering and pagination
export const getFilteredColors = async (
  searchQuery = '',
  selectedMake = '',
  page = 1,
  pageSize = 50
) => {
  const allColors = await getColorData()

  let filteredColors = allColors

  if (searchQuery || selectedMake) {
    const searchLower = searchQuery.toLowerCase()
    filteredColors = allColors.filter(color => {
      const matchesSearch =
        !searchQuery ||
        color.colorName.toLowerCase().includes(searchLower) ||
        color.make.toLowerCase().includes(searchLower) ||
        color.model.toLowerCase().includes(searchLower) ||
        (color.year && color.year.toString().includes(searchLower)) ||
        (color.colorType && color.colorType.toLowerCase().includes(searchLower))

      const matchesMake = !selectedMake || color.make === selectedMake

      return matchesSearch && matchesMake
    })
  }

  const totalCount = filteredColors.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (page - 1) * pageSize
  const colors = filteredColors.slice(startIndex, startIndex + pageSize)

  return {
    colors,
    totalCount,
    totalPages,
  }
}
