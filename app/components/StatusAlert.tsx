'use client'

import React from 'react'
import Button from './ui/Button'

type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface StatusAlertProps {
  title?: string
  message: string
  isDarkMode: boolean
  variant?: AlertVariant
  onDismiss?: () => void
  onRetry?: () => void
}

const StatusAlert: React.FC<StatusAlertProps> = ({
  title,
  message,
  isDarkMode,
  variant = 'error',
  onDismiss,
  onRetry,
}) => {
  const variantClasses: Record<AlertVariant, string> = {
    error: isDarkMode
      ? 'bg-red-900/30 border-red-700 text-red-100'
      : 'bg-red-50 border-red-200 text-red-800',
    warning: isDarkMode
      ? 'bg-amber-900/30 border-amber-700 text-amber-100'
      : 'bg-amber-50 border-amber-200 text-amber-800',
    success: isDarkMode
      ? 'bg-emerald-900/30 border-emerald-700 text-emerald-100'
      : 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: isDarkMode
      ? 'bg-sky-900/30 border-sky-700 text-sky-100'
      : 'bg-sky-50 border-sky-200 text-sky-800',
  }

  return (
    <div
      className={`mx-4 mb-4 rounded-lg border p-3 ${variantClasses[variant]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg" aria-hidden="true">
          {variant === 'error' ? '⚠️' : variant === 'warning' ? '⚠' : variant === 'success' ? '✓' : 'ℹ'}
        </span>
        <div className="min-w-0 flex-1">
          {title && <div className="font-semibold leading-tight">{title}</div>}
          <p className="text-sm leading-snug">{message}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {onRetry && (
            <Button type="button" onClick={onRetry} variant="primary" size="sm">
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              type="button"
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="min-h-[32px] min-w-[32px] rounded p-1"
              aria-label="Dismiss alert"
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusAlert
