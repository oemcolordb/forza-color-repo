'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'user' | 'premium' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('forza-auth-token')
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]))
        if (userData.exp > Date.now() / 1000) {
          setUser({
            id: userData.sub,
            email: userData.email,
            name: userData.name,
            role: userData.role || 'user'
          })
        } else {
          localStorage.removeItem('forza-auth-token')
        }
      } catch (error) {
        localStorage.removeItem('forza-auth-token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/.netlify/functions/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const { token, user: userData } = await response.json()
    localStorage.setItem('forza-auth-token', token)
    setUser(userData)
  }

  const signup = async (email: string, password: string, name?: string) => {
    const response = await fetch('/.netlify/functions/auth-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }

    const { token, user: userData } = await response.json()
    localStorage.setItem('forza-auth-token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('forza-auth-token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}