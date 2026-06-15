'use client'

import React, { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Neumorphic Design System
 * 
 * Soft, tactile UI elements that appear to extrude from the background.
 * Perfect for controls, buttons, and cards in dark mode interfaces.
 * Creates a "pressed" or "pushed" physical feel.
 */

interface NeumorphicCardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
  pressed?: boolean
  onClick?: () => void
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  className = '',
  interactive = false,
  pressed = false,
  onClick,
}) => {
  const [isPressed, setIsPressed] = useState(pressed)

  const baseShadow = `
    20px 20px 60px rgba(0, 0, 0, 0.5),
    -20px -20px 60px rgba(255, 255, 255, 0.05)
  `

  const pressedShadow = `
    inset 10px 10px 30px rgba(0, 0, 0, 0.5),
    inset -10px -10px 30px rgba(255, 255, 255, 0.05)
  `

  return (
    <motion.div
      className={`
        relative rounded-3xl bg-gray-900
        ${interactive || onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: isPressed ? pressedShadow : baseShadow,
      }}
      animate={{
        boxShadow: isPressed ? pressedShadow : baseShadow,
      }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (interactive || onClick) {
          setIsPressed(!isPressed)
          onClick?.()
        }
      }}
      whileTap={interactive ? { scale: 0.98 } : undefined}
    >
      {/* Inner gradient for depth */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: isPressed 
            ? 'linear-gradient(145deg, rgba(0,0,0,0.2), rgba(255,255,255,0.02))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.1))',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  )
}

/**
 * Neumorphic Toggle Switch
 * Physical switch with tactile feel
 */
interface NeumorphicToggleProps {
  checked: boolean
  onChange: (_checked: boolean) => void
  label?: string
}

export const NeumorphicToggle: React.FC<NeumorphicToggleProps> = ({
  checked,
  onChange,
  label,
}) => {
  return (
    <div className="flex items-center gap-4">
      <motion.button
        className="relative w-20 h-10 rounded-full bg-gray-900"
        style={{
          boxShadow: `
            inset 5px 5px 10px rgba(0, 0, 0, 0.5),
            inset -5px -5px 10px rgba(255, 255, 255, 0.05)
          `,
        }}
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
      >
        {/* Toggle knob */}
        <motion.div
          className="absolute top-1 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800"
          style={{
            boxShadow: `
              3px 3px 6px rgba(0, 0, 0, 0.4),
              -1px -1px 3px rgba(255, 255, 255, 0.1)
            `,
          }}
          animate={{
            left: checked ? 'calc(100% - 2.25rem)' : '0.25rem',
            background: checked 
              ? 'linear-gradient(145deg, #3b82f6, #1d4ed8)'
              : 'linear-gradient(145deg, #374151, #1f2937)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {/* Knob highlight */}
          <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/20" />
        </motion.div>

        {/* Status indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
          <span className={`text-[10px] font-bold transition-colors ${checked ? 'text-blue-400' : 'text-gray-600'}`}>
            ON
          </span>
          <span className={`text-[10px] font-bold transition-colors ${!checked ? 'text-gray-400' : 'text-gray-600'}`}>
            OFF
          </span>
        </div>
      </motion.button>
      
      {label && (
        <span className="text-sm text-gray-400 font-medium">{label}</span>
      )}
    </div>
  )
}

/**
 * Neumorphic Slider
 * Range input with tactile feel
 */
interface NeumorphicSliderProps {
  value: number
  min?: number
  max?: number
  onChange: (_value: number) => void
  label?: string
}

export const NeumorphicSlider: React.FC<NeumorphicSliderProps> = ({
  value,
  min = 0,
  max = 100,
  onChange,
  label,
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">{label}</span>
          <span className="text-sm font-bold text-gray-300">{Math.round(value)}</span>
        </div>
      )}
      
      <div className="relative h-12 rounded-2xl bg-gray-900 p-2"
        style={{
          boxShadow: `
            inset 6px 6px 12px rgba(0, 0, 0, 0.5),
            inset -6px -6px 12px rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Track background */}
        <div className="absolute inset-2 rounded-xl bg-gray-800/50" />
        
        {/* Fill */}
        <motion.div
          className="absolute top-2 left-2 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400"
          style={{
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
          }}
          animate={{ width: `calc(${percentage}% - 1rem)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        {/* Thumb */}
        <motion.div
          className="absolute top-1 w-10 h-10 rounded-xl bg-gray-800 cursor-grab active:cursor-grabbing"
          style={{
            boxShadow: `
              4px 4px 8px rgba(0, 0, 0, 0.4),
              -2px -2px 6px rgba(255, 255, 255, 0.08),
              inset 1px 1px 2px rgba(255, 255, 255, 0.1)
            `,
            left: `calc(${percentage}% - 1.25rem)`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Thumb highlight */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded bg-gradient-to-br from-white/30 to-transparent" />
        </motion.div>

        {/* Invisible input for functionality */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

/**
 * Neumorphic Button
 * Pressable button with depth
 */
interface NeumorphicButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'raised' | 'pressed' | 'flat'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  onClick,
  variant = 'raised',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const getShadows = () => {
    switch (variant) {
      case 'raised':
        return {
          default: `
            8px 8px 16px rgba(0, 0, 0, 0.4),
            -8px -8px 16px rgba(255, 255, 255, 0.05),
            inset 1px 1px 2px rgba(255, 255, 255, 0.1)
          `,
          pressed: `
            inset 6px 6px 12px rgba(0, 0, 0, 0.4),
            inset -6px -6px 12px rgba(255, 255, 255, 0.05)
          `,
        }
      case 'pressed':
        return {
          default: `
            inset 4px 4px 8px rgba(0, 0, 0, 0.4),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05)
          `,
          pressed: `
            inset 6px 6px 12px rgba(0, 0, 0, 0.5),
            inset -6px -6px 12px rgba(255, 255, 255, 0.02)
          `,
        }
      case 'flat':
        return {
          default: 'none',
          pressed: `
            inset 3px 3px 6px rgba(0, 0, 0, 0.3),
            inset -3px -3px 6px rgba(255, 255, 255, 0.05)
          `,
        }
    }
  }

  const shadows = getShadows()

  return (
    <motion.button
      className={`
        relative rounded-xl font-semibold text-gray-300
        transition-colors duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: 'linear-gradient(145deg, #1f2937, #111827)',
        boxShadow: shadows.default,
      }}
      whileHover={{
        color: '#ffffff',
      }}
      whileTap={{
        boxShadow: shadows.pressed,
        scale: 0.98,
      }}
      onClick={onClick}
    >
      {/* Highlight */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

/**
 * Neumorphic Input
 * Text input with depth
 */
interface NeumorphicInputProps {
  value: string
  onChange: (_value: string) => void
  placeholder?: string
  type?: string
  className?: string
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div
      className={`
        relative rounded-xl bg-gray-900
        transition-all duration-300
        ${isFocused ? 'ring-2 ring-blue-500/50' : ''}
        ${className}
      `}
      style={{
        boxShadow: isFocused
          ? `
            inset 4px 4px 8px rgba(0, 0, 0, 0.5),
            inset -4px -4px 8px rgba(255, 255, 255, 0.05)
          `
          : `
            inset 6px 6px 12px rgba(0, 0, 0, 0.5),
            inset -6px -6px 12px rgba(255, 255, 255, 0.05)
          `,
      }}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="
          w-full px-4 py-3 bg-transparent
          text-gray-300 placeholder-gray-600
          focus:outline-none
          rounded-xl
        "
      />
    </div>
  )
}

export default NeumorphicCard
