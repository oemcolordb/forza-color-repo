'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { TransitionType, getRandomTransition } from '../components/transitions/PageTransitions'

type TransitionMode = 'random' | 'fixed'

interface TransitionContextType {
  // Current state
  currentTransition: TransitionType
  isTransitioning: boolean
  mode: TransitionMode

  // Actions
  triggerTransition: (transition?: TransitionType) => Promise<void>
  setFixedTransition: (transition: TransitionType) => void
  setRandomMode: () => void
  setTransitionEnabled: (enabled: boolean) => void
  isEnabled: boolean

  // User preferences (persisted)
  userFavorites: TransitionType[]
  toggleFavorite: (transition: TransitionType) => void
  isFavorite: (transition: TransitionType) => boolean

  // Voting
  votes: Record<TransitionType, number>
  userVotes: Record<string, boolean>
  voteForTransition: (transition: TransitionType) => Promise<void>
  removeVote: (transition: TransitionType) => Promise<void>
  hasVoted: (transition: TransitionType) => boolean
  isLoadingVotes: boolean
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined)

const STORAGE_KEY = 'forza-transitions-prefs'
const VOTES_STORAGE_KEY = 'forza-transitions-votes'

interface StoredPreferences {
  mode: TransitionMode
  fixedTransition?: TransitionType
  favorites: TransitionType[]
  enabled: boolean
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  // Core state
  const [currentTransition, setCurrentTransition] = useState<TransitionType>('soft-fade')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mode, setMode] = useState<TransitionMode>('random')
  const [isEnabled, setIsEnabled] = useState(true)

  // User preferences
  const [userFavorites, setUserFavorites] = useState<TransitionType[]>([])

  // Voting state
  const [votes, setVotes] = useState<Record<string, number>>({
    'fade': 0,
    'crossfade': 0,
    'soft-fade': 0,
  })
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const [isLoadingVotes, setIsLoadingVotes] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const prefs: StoredPreferences = JSON.parse(stored)
        setMode(prefs.mode)
        setUserFavorites(prefs.favorites || [])
        setIsEnabled(prefs.enabled !== false)
        if (prefs.mode === 'fixed' && prefs.fixedTransition) {
          setCurrentTransition(prefs.fixedTransition)
        }
      }
    } catch {
      // Ignore parsing errors
    }
    setHasHydrated(true)
  }, [])

  // Save preferences when they change
  useEffect(() => {
    if (!hasHydrated) return

    const prefs: StoredPreferences = {
      mode,
      fixedTransition: mode === 'fixed' ? currentTransition : undefined,
      favorites: userFavorites,
      enabled: isEnabled,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [mode, currentTransition, userFavorites, isEnabled, hasHydrated])

  // Load votes from server on mount
  useEffect(() => {
    const loadVotes = async () => {
      try {
        const response = await fetch('/api/transitions/votes')
        if (response.ok) {
          const data = await response.json()
          setVotes(data.votes)
          setUserVotes(data.userVotes || {})
        }
      } catch (error) {
        console.error('Failed to load votes:', error)
      }
    }
    loadVotes()
  }, [])

  // Trigger a transition
  const triggerTransition = useCallback(async (explicitTransition?: TransitionType): Promise<void> => {
    if (!isEnabled) return Promise.resolve()

    return new Promise((resolve) => {
      setIsTransitioning(true)

      // Determine which transition to use
      let transition: TransitionType
      if (explicitTransition) {
        transition = explicitTransition
      } else if (mode === 'random') {
        transition = getRandomTransition()
      } else {
        transition = currentTransition
      }

      setCurrentTransition(transition)

      // Wait for transition duration (handled by component)
      // The transition component will call onComplete after its animation
      const checkComplete = () => {
        setIsTransitioning(false)
        resolve()
      }

      // Set a maximum timeout for safety (max transition duration is 2000ms)
      setTimeout(checkComplete, 2100)
    })
  }, [isEnabled, mode, currentTransition])

  // Set fixed transition mode
  const setFixedTransition = useCallback((transition: TransitionType) => {
    setCurrentTransition(transition)
    setMode('fixed')
  }, [])

  // Set random mode
  const setRandomMode = useCallback(() => {
    setMode('random')
  }, [])

  // Toggle transition enabled
  const setTransitionEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
  }, [])

  // Favorite management
  const toggleFavorite = useCallback((transition: TransitionType) => {
    setUserFavorites(prev => {
      if (prev.includes(transition)) {
        return prev.filter(t => t !== transition)
      }
      return [...prev, transition]
    })
  }, [])

  const isFavorite = useCallback((transition: TransitionType) => {
    return userFavorites.includes(transition)
  }, [userFavorites])

  // Voting management
  const voteForTransition = useCallback(async (transition: TransitionType) => {
    if (isLoadingVotes) return

    setIsLoadingVotes(true)
    try {
      const response = await fetch('/api/transitions/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitionId: transition, action: 'vote' }),
      })

      if (response.ok) {
        const data = await response.json()
        setVotes(prev => ({ ...prev, [transition]: data.newCount }))
        setUserVotes(prev => ({ ...prev, [transition]: true }))
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setIsLoadingVotes(false)
    }
  }, [isLoadingVotes])

  const removeVote = useCallback(async (transition: TransitionType) => {
    if (isLoadingVotes) return

    setIsLoadingVotes(true)
    try {
      const response = await fetch('/api/transitions/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitionId: transition, action: 'unvote' }),
      })

      if (response.ok) {
        const data = await response.json()
        setVotes(prev => ({ ...prev, [transition]: data.newCount }))
        setUserVotes(prev => ({ ...prev, [transition]: false }))
      }
    } catch (error) {
      console.error('Failed to remove vote:', error)
    } finally {
      setIsLoadingVotes(false)
    }
  }, [isLoadingVotes])

  const hasVoted = useCallback((transition: TransitionType) => {
    return userVotes[transition] || false
  }, [userVotes])

  const value: TransitionContextType = {
    currentTransition,
    isTransitioning,
    mode,
    triggerTransition,
    setFixedTransition,
    setRandomMode,
    setTransitionEnabled,
    isEnabled,
    userFavorites,
    toggleFavorite,
    isFavorite,
    votes,
    userVotes,
    voteForTransition,
    removeVote,
    hasVoted,
    isLoadingVotes,
  }

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  )
}

const noopTransitionContext: TransitionContextType = {
  currentTransition: 'soft-fade',
  isTransitioning: false,
  mode: 'random',
  triggerTransition: async () => {},
  setFixedTransition: () => {},
  setRandomMode: () => {},
  setTransitionEnabled: () => {},
  isEnabled: false,
  userFavorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  votes: {
    'fade': 0,
    'crossfade': 0,
    'soft-fade': 0,
  } as Record<TransitionType, number>,
  userVotes: {},
  voteForTransition: async () => {},
  removeVote: async () => {},
  hasVoted: () => false,
  isLoadingVotes: false,
}

export function useTransition() {
  const context = useContext(TransitionContext)
  return context ?? noopTransitionContext
}
