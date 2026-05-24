'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import Button from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Error caught by boundary
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

const DefaultErrorFallback = ({ error, reset }: { error?: Error; reset: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center max-w-md rounded-xl p-6 bamboo-surface-dark border border-red-700/50">
        <h1 className="text-2xl font-bold mb-4 text-red-300">Something went wrong</h1>
        <p className="text-slate-200 mb-6">
          {error?.message || 'An unexpected error occurred while loading the color data.'}
        </p>
        <div className="space-y-3">
          <Button onClick={reset} variant="primary" size="md" className="w-full">
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()} variant="ghost" size="md" className="w-full">
            Reload Page
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-slate-800 rounded text-xs overflow-auto text-red-300">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default ErrorBoundary
