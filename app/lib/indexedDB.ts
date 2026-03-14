// IndexedDB wrapper for better storage
import { CarColor } from '../types'

class IndexedDBManager {
  private dbName = 'ForzaColorDB'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // Colors store
        if (!db.objectStoreNames.contains('colors')) {
          const colorStore = db.createObjectStore('colors', { keyPath: 'id' })
          colorStore.createIndex('make', 'make', { unique: false })
          colorStore.createIndex('colorType', 'colorType', { unique: false })
        }

        // Favorites store
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' })
        }

        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async storeColors(colors: CarColor[]): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['colors'], 'readwrite')
    const store = transaction.objectStore('colors')

    for (const color of colors) {
      const colorWithId = {
        ...color,
        id: `${color.make}-${color.colorName}-${color.year || 'unknown'}`,
      }
      store.put(colorWithId)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getColors(): Promise<CarColor[]> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['colors'], 'readonly')
    const store = transaction.objectStore('colors')
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async storeFavorites(favorites: string[]): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['favorites'], 'readwrite')
    const store = transaction.objectStore('favorites')

    // Clear existing favorites
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    })

    // Store new favorites
    for (const favorite of favorites) {
      store.add({ id: favorite })
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getFavorites(): Promise<string[]> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['favorites'], 'readonly')
    const store = transaction.objectStore('favorites')
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result.map(item => item.id))
      request.onerror = () => reject(request.error)
    })
  }

  async setCache(key: string, data: unknown, ttl: number = 600000): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')

    const cacheItem = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    }

    store.put(cacheItem)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getCache(key: string): Promise<any> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['cache'], 'readonly')
    const store = transaction.objectStore('cache')
    const request = store.get(key)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // Check if cache is expired
        if (Date.now() - result.timestamp > result.ttl) {
          this.deleteCache(key)
          resolve(null)
          return
        }

        resolve(result.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    store.delete(key)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    const index = store.index('timestamp')
    const request = index.openCursor()

    return new Promise((resolve, reject) => {
      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const item = cursor.value
          if (Date.now() - item.timestamp > item.ttl) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const indexedDBManager = new IndexedDBManager()
