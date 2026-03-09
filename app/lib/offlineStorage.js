const CACHE_NAME = 'forza-colors-v1'
const COLORS_KEY = 'colors'
const METADATA_KEY = 'metadata'

class OfflineStorage {
  async storeColors(colors) {
    try {
      localStorage.setItem(COLORS_KEY, JSON.stringify(colors))
      localStorage.setItem(
        METADATA_KEY,
        JSON.stringify({
          lastUpdated: new Date().toISOString(),
          count: colors.length,
        })
      )
    } catch (error) {
      throw new Error('Failed to store colors offline')
    }
  }

  async getColors() {
    try {
      const stored = localStorage.getItem(COLORS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  async searchColors(query) {
    const colors = await this.getColors()
    const searchTerm = query.toLowerCase()

    return colors.filter(
      color =>
        color.colorName.toLowerCase().includes(searchTerm) ||
        color.make.toLowerCase().includes(searchTerm) ||
        (color.model && color.model.toLowerCase().includes(searchTerm))
    )
  }

  async getCacheInfo() {
    try {
      const metadata = localStorage.getItem(METADATA_KEY)
      const parsed = metadata ? JSON.parse(metadata) : null

      return {
        size: parsed?.count || 0,
        lastUpdated: parsed?.lastUpdated || null,
      }
    } catch (error) {
      return { size: 0, lastUpdated: null }
    }
  }
}

export const offlineStorage = new OfflineStorage()
