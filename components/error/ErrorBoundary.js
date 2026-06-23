'use client'

import React from 'react'
import Button from '@/components/ui/Button'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
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

const DefaultErrorFallback = ({ error, reset }) => {
  const isWebGLError = error?.message?.toLowerCase().includes('webgl') || error?.message?.toLowerCase().includes('canvas');
  const isAssetError = error?.message?.toLowerCase().includes('fetch') || error?.message?.toLowerCase().includes('load');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center max-w-md rounded-xl p-6 bg-slate-800 border border-red-700/50">
        <h1 className="text-2xl font-bold mb-4 text-red-300">
          {isWebGLError ? 'WebGL Initialization Failed' : isAssetError ? 'Failed to Load Asset' : 'Something went wrong'}
        </h1>
        <p className="text-slate-200 mb-6">
          {isWebGLError 
            ? 'Your browser encountered an issue rendering the 3D preview. Please ensure hardware acceleration is enabled.' 
            : isAssetError 
              ? 'We had trouble loading some required assets. Please check your connection and try again.'
              : error?.message || 'An unexpected error occurred while loading the color data.'}
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
