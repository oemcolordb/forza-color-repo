'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'

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
  signIn: (_email: string, _password: string) => Promise<void>
  signUp: (_email: string, _password: string, _username: string) => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithXbox: () => Promise<void>
  signOut: () => Promise<void>
  syncFavorites: (_favorites: string[]) => Promise<void>
  syncTuningPresets: (_presets: any[]) => Promise<void>
  syncColorSets: (_sets: any[]) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const [localFavorites, setLocalFavorites] = React.useState<string[]>([])

  // Convert NextAuth session to the app's User interface
  const user: User | null = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || undefined,
    username: session.user.name || 'User',
    avatar: session.user.image || undefined,
    provider: (session.user as any).provider || 'discord',
    favorites: localFavorites, // We will hydrate this from DB later
    tuningPresets: [],
    colorSets: [],
  } : null

  useEffect(() => {
    if (user) {
      // Fetch user's data from cloud when session loads
      syncFromCloud(user.id)
    }
  }, [session])

  const signIn = async (email: string, password: string) => {
    // Left for legacy credentials if needed
    console.warn('Credentials sign in is not fully implemented in NextAuth yet')
  }

  const signUp = async (email: string, password: string, username: string) => {
    console.warn('Credentials sign up is not fully implemented in NextAuth yet')
  }

  const signInWithDiscord = async () => {
    await nextAuthSignIn('discord')
  }

  const signInWithXbox = async () => {
    // Microsoft / Xbox login can be added via AzureAD provider later
    console.warn('Xbox sign in requires Azure AD setup')
  }

  const signOut = async () => {
    await nextAuthSignOut()
  }

  const syncFavorites = async (favorites: string[]) => {
    if (!user) return
    setLocalFavorites(favorites)
    try {
      await fetch('/api/sync/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, favorites }),
      })
    } catch (error) {
      console.error('Sync favorites error:', error)
    }
  }

  const syncTuningPresets = async (presets: any[]) => {
    console.log('Syncing presets:', presets)
  }

  const syncColorSets = async (sets: any[]) => {
    console.log('Syncing color sets:', sets)
  }

  const syncFromCloud = async (userId: string) => {
    try {
      const response = await fetch(`/api/sync/all?userId=${userId}`)
      if (!response.ok) return
      const data = await response.json()
      if (data.favorites) {
        setLocalFavorites(data.favorites)
        localStorage.setItem('forza-favorites', JSON.stringify(data.favorites))
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

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </SessionProvider>
  )
}
