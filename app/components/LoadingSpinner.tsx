import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'primary', text, fullScreen = false }) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorClasses: Record<string, string> = {
    primary: 'border-[color:var(--bamboo-stalk)]',
    secondary: 'border-[color:var(--bamboo-moss)]',
    white: 'border-white',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p
          className={`text-sm ${color === 'white' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bamboo-surface dark:bamboo-surface-dark rounded-lg p-6 shadow-xl">{spinner}</div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
