'use client'

import React, { useState } from 'react'
import { useAuth } from './AuthProvider'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, signup } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
      onClose()
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 ${isDarkMode ? 'hover:text-gray-300' : ''}`}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
                placeholder="Min 8 characters"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal