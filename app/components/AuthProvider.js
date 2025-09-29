'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const token = sessionStorage.getItem('forza-auth-token')
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
          sessionStorage.removeItem('forza-auth-token')
        }
      } catch (error) {
        sessionStorage.removeItem('forza-auth-token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await fetch('/.netlify/functions/auth-login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const { token, user: userData } = await response.json()
    sessionStorage.setItem('forza-auth-token', token)
    setUser(userData)
  }

  const signup = async (email, password, name) => {
    const response = await fetch('/.netlify/functions/auth-signup', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }

    const { token, user: userData } = await response.json()
    sessionStorage.setItem('forza-auth-token', token)
    setUser(userData)
  }

  const logout = () => {
    sessionStorage.removeItem('forza-auth-token')
    setUser(null)
  }

  return React.createElement(AuthContext.Provider, {
    value: { user, login, signup, logout, loading }
  }, children)
}