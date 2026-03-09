'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email?: string
  username: string
  avatar?: string
  provider: 'email' | 'discord' | 'xbox'
  favorites: string[]
  tuningPresets: any[]
  colorSets: any[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithXbox: () => Promise<void>
  signOut: () => Promise<void>
  syncFavorites: (favorites: string[]) => Promise<void>
  syncTuningPresets: (presets: any[]) => Promise<void>
  syncColorSets: (sets: any[]) => Promise<void>
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
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Sign in failed')

      const userData = await response.json()
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
      await fetch('/api/sync/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, favorites }),
      })

      setUser({ ...user, favorites })
    } catch (error) {
      console.error('Sync favorites error:', error)
    }
  }

  const syncTuningPresets = async (presets: any[]) => {
    if (!user) return

    try {
      await fetch('/api/sync/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, presets }),
      })

      setUser({ ...user, tuningPresets: presets })
    } catch (error) {
      console.error('Sync presets error:', error)
    }
  }

  const syncColorSets = async (sets: any[]) => {
    if (!user) return

    try {
      await fetch('/api/sync/colorsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sets }),
      })

      setUser({ ...user, colorSets: sets })
    } catch (error) {
      console.error('Sync color sets error:', error)
    }
  }

  const syncFromCloud = async (userId: string) => {
    try {
      const response = await fetch(`/api/sync/all?userId=${userId}`)
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
