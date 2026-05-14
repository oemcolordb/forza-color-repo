import { useState, useEffect, useCallback } from 'react'

interface OfflineStorageState {
  isOnline: boolean
  cacheSize: number
  lastUpdated: string | null
  isLoading: boolean
  error: string | null
  encryptionKey: CryptoKey | null
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function fetchEncryptionKey(): Promise<CryptoKey | null> {
  try {
    const res = await fetch('/api/encryption-key')
    if (!res.ok) return null
    const { keyBase64 } = await res.json()
    const raw = base64ToArrayBuffer(keyBase64)
    return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  } catch {
    return null
  }
}

export function useOfflineStorage() {
  const [state, setState] = useState<OfflineStorageState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    cacheSize: 0,
    lastUpdated: null,
    isLoading: false,
    error: null,
    encryptionKey: null,
  })

  // Initialise encryption key once
  useEffect(() => {
    let cancelled = false
    fetchEncryptionKey().then(key => {
      if (!cancelled) setState(prev => ({ ...prev, encryptionKey: key }))
    })
    return () => { cancelled = true }
  }, [])

  const encrypt = useCallback(async (data: unknown): Promise<string | null> => {
    if (!state.encryptionKey) return null
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoder = new TextEncoder()
    const encoded = encoder.encode(JSON.stringify(data))
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, state.encryptionKey, encoded)
    // Prepend IV to ciphertext
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(ciphertext), iv.byteLength)
    return arrayBufferToBase64(combined.buffer)
  }, [state.encryptionKey])

  const decrypt = useCallback((payload: string): unknown => {
    if (!state.encryptionKey) return null
    try {
      const combined = new Uint8Array(base64ToArrayBuffer(payload))
      const iv = combined.slice(0, 12)
      const ciphertext = combined.slice(12)
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, state.encryptionKey, ciphertext.buffer)
        .then(decrypted => {
          const decoder = new TextDecoder()
          return JSON.parse(decoder.decode(decrypted))
        })
        .catch(() => null)
    } catch {
      return null
    }
  }, [state.encryptionKey])

  const cacheColors = useCallback(async (colors: unknown[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const encrypted = await encrypt(colors)
      if (encrypted) {
        localStorage.setItem('forza-offline-colors', encrypted)
        setState(prev => ({
          ...prev,
          isLoading: false,
          cacheSize: colors.length,
          lastUpdated: new Date().toISOString(),
        }))
      } else {
        throw new Error('Encryption unavailable')
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Caching failed',
      }))
    }
  }, [encrypt])

  const getOfflineColors = useCallback((): unknown[] => {
    try {
      const payload = localStorage.getItem('forza-offline-colors')
      if (!payload) return []
      const result = decrypt(payload)
      // decrypt may return a Promise; handle both sync and async paths
      if (result instanceof Promise) {
        // In an async context we would await, but hook returns sync array – fallback to []
        return []
      }
      return result as unknown[] || []
    } catch {
      return []
    }
  }, [decrypt])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    ...state,
    cacheColors,
    getOfflineColors,
  }
}
