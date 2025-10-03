import React, { Component, ReactNode } from 'react'
import { AppError } from '../types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
}

interface State {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: {
        message: error.message,
        code: 'COMPONENT_ERROR',
        details: error.stack
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError: AppError = {
      message: error.message,
      code: 'COMPONENT_ERROR',
      details: { error, errorInfo }
    }
    
    this.props.onError?.(appError)
    console.error('ErrorBoundary caught an error:', appError)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}