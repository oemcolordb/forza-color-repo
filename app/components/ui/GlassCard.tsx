'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  hoverScale?: number
  onClick?: () => void
}

/**
 * Glassmorphism Card Component
 * 
 * Inspired by modern glassmorphism trend - frosted glass effect with
 * backdrop blur, subtle borders, and ethereal glow effects.
 * Perfect for gaming/automotive UI aesthetics.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = '#3b82f6',
  hoverScale = 1.02,
  onClick,
}) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-2xl
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: `
          0 8px 32px 0 rgba(0, 0, 0, 0.37),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {/* Gradient glow effect */}
      <div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}15, transparent 40%)`,
        }}
      />
      
      {/* Inner highlight */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

/**
 * Glass Button - Premium button with glassmorphism
 */
interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: ReactNode
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantStyles = {
    primary: {
      background: 'rgba(59, 130, 246, 0.2)',
      border: 'rgba(59, 130, 246, 0.3)',
      glow: '#3b82f6',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      glow: '#ffffff',
    },
    ghost: {
      background: 'transparent',
      border: 'rgba(255, 255, 255, 0.1)',
      glow: '#ffffff',
    },
  }

  const style = variantStyles[variant]

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-xl font-semibold
        flex items-center justify-center gap-2
        backdrop-blur-md
        transition-all duration-300
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        boxShadow: `
          0 4px 24px ${style.glow}20,
          inset 0 1px 0 rgba(255,255,255,0.1)
        `,
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: `
          0 8px 32px ${style.glow}40,
          inset 0 1px 0 rgba(255,255,255,0.2)
        `,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 55%, transparent 60%)',
        }}
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

/**
 * Floating Glass Island - For navigation or floating actions
 */
interface GlassIslandProps {
  children: ReactNode
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const GlassIsland: React.FC<GlassIslandProps> = ({
  children,
  className = '',
  position = 'bottom',
}) => {
  const positionClasses = {
    top: 'top-6 left-1/2 -translate-x-1/2',
    bottom: 'bottom-6 left-1/2 -translate-x-1/2',
    left: 'left-6 top-1/2 -translate-y-1/2',
    right: 'right-6 top-1/2 -translate-y-1/2',
  }

  return (
    <motion.div
      className={`
        fixed ${positionClasses[position]} z-50
        px-6 py-3 rounded-full
        backdrop-blur-2xl
        border border-white/20
        shadow-2xl
        ${className}
      `}
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
      initial={{ y: position === 'bottom' ? 100 : position === 'top' ? -100 : 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Ambient glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2), transparent 70%)',
        }}
      />
      <div className="relative z-10 flex items-center gap-4">
        {children}
      </div>
    </motion.div>
  )
}

export default GlassCard
