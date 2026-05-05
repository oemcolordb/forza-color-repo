'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface TuningPreset {
  id: string
  name: string
  carId?: string
  settings: Record<string, number | string>
  createdAt?: string
}

interface ColorSet {
  id: string
  name: string
  colors: string[]
  createdAt?: string
}

interface User {
  id: string
  email?: string
  username: string
  avatar?: string
  provider: 'email' | 'discord' | 'xbox'
  favorites: string[]
  tuningPresets: TuningPreset[]
  colorSets: ColorSet[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (_email: string, _password: string) => Promise<void>
  signUp: (_email: string, _password: string, _username: string) => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithXbox: () => Promise<void>
  signOut: () => Promise<void>
  syncFavorites: (_favorites: string[]) => Promise<void>
  syncTuningPresets: (_presets: TuningPreset[]) => Promise<void>
  syncColorSets: (_sets: ColorSet[]) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('forza-user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.warn('Failed to parse saved user from localStorage:', error)
        localStorage.removeItem('forza-user')
      }
    }
    setLoading(false)
  }, [])

  const syncFromCloud = async (userId: string) => {
    // This function will be called after login to sync data
    // Implement cloud sync logic here if needed
  }

  const mergeLocalFavorites = async (userId: string, cloudFavorites: string[] = []) => {
    try {
      const savedLocal = localStorage.getItem('forza-offline-colors')
      const localFavorites: string[] = savedLocal ? JSON.parse(savedLocal) : []

      if (localFavorites.length > 0) {
        // Merge without duplicates
        const mergedFavorites = Array.from(new Set([...cloudFavorites, ...localFavorites]))
        
        // Sync merged up to cloud
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, favorites: mergedFavorites }),
        })
        
        return mergedFavorites
      }
    } catch (e) {
      console.warn('Failed to merge local favorites:', e)
    }
    return cloudFavorites
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Sign in failed')

      const userData = await response.json()
      
      // Fetch user's current cloud favorites
      let cloudFavorites: string[] = []
      try {
        const favRes = await fetch(`/api/favorites?userId=${userData.id}`)
        if (favRes.ok) {
          const favData = await favRes.json()
          cloudFavorites = favData.favorites || []
        }
      } catch (e) {
        console.warn('Could not fetch cloud favorites during sign in', e)
      }

      // Merge local storage favorites
      const mergedFavorites = await mergeLocalFavorites(userData.id, cloudFavorites)
      userData.favorites = mergedFavorites

      setUser(userData)
      localStorage.setItem('forza-user', JSON.stringify(userData))

      // Sync data from cloud
      await syncFromCloud(userData.id)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })

      if (!response.ok) throw new Error('Sign up failed')

      const userData = await response.json()
      
      // Merge local storage favorites for new user
      const mergedFavorites = await mergeLocalFavorites(userData.id, [])
      userData.favorites = mergedFavorites

      setUser(userData)
      localStorage.setItem('forza-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithDiscord = async () => {
    try {
      // Discord OAuth flow
      const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
      const redirectUri = `${window.location.origin}/auth/discord/callback`
      const scope = 'identify email'

      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`

      window.location.href = authUrl
    } catch (error) {
      console.error('Discord sign in error:', error)
      throw error
    }
  }

  const signInWithXbox = async () => {
    try {
      // Xbox Live OAuth flow
      const clientId = process.env.NEXT_PUBLIC_XBOX_CLIENT_ID
      const redirectUri = `${window.location.origin}/auth/xbox/callback`

      const authUrl = `https://login.live.com/oauth20_authorize.srf?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=XboxLive.signin`

      window.location.href = authUrl
    } catch (error) {
      console.error('Xbox sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('forza-user')
  }

  const syncFavorites = async (favorites: string[]) => {
    if (!user) return

    try {
      const response = await fetch('/api/sync/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, favorites }),
      })

      if (!response.ok) throw new Error('Failed to sync favorites')
      setUser({ ...user, favorites })
    } catch (error) {
      console.error('Sync favorites error:', error)
    }
  }

  const syncTuningPresets = async (presets: TuningPreset[]) => {
    if (!user) return

    try {
      const response = await fetch('/api/sync/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, presets }),
      })

      if (!response.ok) throw new Error('Failed to sync presets')
      setUser({ ...user, tuningPresets: presets })
    } catch (error) {
      console.error('Sync presets error:', error)
    }
  }

  const syncColorSets = async (sets: ColorSet[]) => {
    if (!user) return

    try {
      const response = await fetch('/api/sync/colorsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sets }),
      })

      if (!response.ok) throw new Error('Failed to sync color sets')
      setUser({ ...user, colorSets: sets })
    } catch (error) {
      console.error('Sync color sets error:', error)
    }
  }

  const syncFromCloud = async (userId: string) => {
    try {
      const response = await fetch(`/api/sync/all?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to sync from cloud')

      const data = await response.json()

      if (data.favorites) {
        localStorage.setItem('forza-favorites', JSON.stringify(data.favorites))
      }
      if (data.presets) {
        localStorage.setItem('forza-presets', JSON.stringify(data.presets))
      }
      if (data.colorSets) {
        localStorage.setItem('forza-colorsets', JSON.stringify(data.colorSets))
      }
    } catch (error) {
      console.error('Sync from cloud error:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithDiscord,
        signInWithXbox,
        signOut,
        syncFavorites,
        syncTuningPresets,
        syncColorSets,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
