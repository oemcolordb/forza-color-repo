'use client'

import React, { useState } from 'react'
import { useAuth } from './AuthProvider'

const AuthModal = ({ isOpen, onClose, isDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, signup } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return React.createElement('div', {
    className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
  }, React.createElement('div', {
    className: `w-full max-w-md rounded-lg shadow-xl ${
      isDarkMode ? 'bg-slate-800' : 'bg-white'
    }`
  }, React.createElement('div', {
    className: "p-6"
  }, [
    React.createElement('div', {
      key: 'header',
      className: "flex justify-between items-center mb-4"
    }, [
      React.createElement('h2', {
        key: 'title',
        className: `text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`
      }, isLogin ? 'Sign In' : 'Create Account'),
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        className: `text-gray-500 hover:text-gray-700 ${isDarkMode ? 'hover:text-gray-300' : ''}`
      }, '✕')
    ]),

    React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmit,
      className: "space-y-4"
    }, [
      !isLogin && React.createElement('div', {
        key: 'name-field'
      }, [
        React.createElement('label', {
          key: 'name-label',
          className: `block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`
        }, 'Name'),
        React.createElement('input', {
          key: 'name-input',
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            isDarkMode
              ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
          }`,
          placeholder: "Your name"
        })
      ]),

      React.createElement('div', {
        key: 'email-field'
      }, [
        React.createElement('label', {
          key: 'email-label',
          className: `block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`
        }, 'Email'),
        React.createElement('input', {
          key: 'email-input',
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true,
          className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            isDarkMode
              ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
          }`,
          placeholder: "your@email.com"
        })
      ]),

      React.createElement('div', {
        key: 'password-field'
      }, [
        React.createElement('label', {
          key: 'password-label',
          className: `block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`
        }, 'Password'),
        React.createElement('input', {
          key: 'password-input',
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
          minLength: 8,
          className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            isDarkMode
              ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
          }`,
          placeholder: "Min 8 characters"
        })
      ]),

      error && React.createElement('div', {
        key: 'error',
        className: "text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded"
      }, error),

      React.createElement('button', {
        key: 'submit',
        type: "submit",
        disabled: loading,
        className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      }, loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account'))
    ]),

    React.createElement('div', {
      key: 'toggle',
      className: "mt-4 text-center"
    }, React.createElement('button', {
      onClick: () => setIsLogin(!isLogin),
      className: `text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`
    }, isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'))
  ])))
}

export default AuthModal