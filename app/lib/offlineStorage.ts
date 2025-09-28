import type { CarColor } from '../types/color'

const DB_NAME = 'ForzaColorsDB'
const DB_VERSION = 1
const STORE_NAME = 'colors'
const FAVORITES_STORE = 'favorites'
const HISTORY_STORE = 'history'

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Colors store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('make', 'make', { unique: false })
          store.createIndex('colorType', 'colorType', { unique: false })
          store.createIndex('colorName', 'colorName', { unique: false })
        }
        
        // Favorites store
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' })
        }
        
        // History store
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' })
          historyStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async storeColors(colors: CarColor[]): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    // Clear existing data
    await store.clear()
    
    // Store colors with unique IDs
    colors.forEach((color, index) => {
      store.add({
        ...color,
        id: `${color.make}-${color.model}-${color.colorName}-${index}`,
        cached: Date.now()
      })
    })
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getColors(): Promise<CarColor[]> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async searchColors(query: string): Promise<CarColor[]> {
    const colors = await this.getColors()
    const searchLower = query.toLowerCase()
    
    return colors.filter(color => 
      color.colorName.toLowerCase().includes(searchLower) ||
      color.make.toLowerCase().includes(searchLower) ||
      color.model.toLowerCase().includes(searchLower)
    )
  }

  async getColorsByMake(make: string): Promise<CarColor[]> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('make')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(make)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async storeFavorites(favorites: string[]): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([FAVORITES_STORE], 'readwrite')
    const store = transaction.objectStore(FAVORITES_STORE)
    
    await store.clear()
    await store.add({ id: 'favorites', data: favorites, updated: Date.now() })
  }

  async getFavorites(): Promise<string[]> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([FAVORITES_STORE], 'readonly')
    const store = transaction.objectStore(FAVORITES_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.get('favorites')
      request.onsuccess = () => resolve(request.result?.data || [])
      request.onerror = () => reject(request.error)
    })
  }

  async isOnline(): Promise<boolean> {
    try {
      await fetch('/api/ping', { method: 'HEAD' })
      return true
    } catch {
      return false
    }
  }

  async getCacheInfo(): Promise<{ size: number; lastUpdated: number | null }> {
    const colors = await this.getColors()
    const lastUpdated = colors.length > 0 ? (colors[0] as any).cached || null : null
    
    return {
      size: colors.length,
      lastUpdated
    }
  }
}

export const offlineStorage = new OfflineStorage()