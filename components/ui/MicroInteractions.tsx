'use client'

import React, { useRef, useState, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Micro-Interactions Components
 * 
 * Premium hover effects and interactions that add polish and delight.
 * These small details make the UI feel alive and responsive.
 */

/**
 * Magnetic Button
 * Button that attracts toward the cursor on hover
 */
interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  strength?: number
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  strength = 0.3,
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={`relative ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

/**
 * Text Reveal Effect
 * Text that reveals character by character on hover
 */
interface TextRevealProps {
  text: string
  className?: string
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <span
      className={`inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0.5, y: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0.5,
            y: isHovered ? -2 : 0,
            color: isHovered ? '#60a5fa' : undefined,
          }}
          transition={{
            duration: 0.2,
            delay: i * 0.03,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * Spotlight Card
 * Card with spotlight effect following cursor
 */
interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(59, 130, 246, 0.15)',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
          opacity: isHovered ? 1 : 0,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * Ripple Button
 * Button with expanding ripple effect on click
 */
interface RippleButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  rippleColor?: string
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = '',
  onClick,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { x, y, id }])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)

    onClick?.()
  }

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
          animate={{ 
            width: 500, 
            height: 500, 
            x: -250, 
            y: -250, 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

/**
 * Tilt Card
 * 3D tilt effect on hover
 */
interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltAmount?: number
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltAmount = 10,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(springY, [0, 1], [tiltAmount, -tiltAmount])
  const rotateY = useTransform(springX, [0, 1], [-tiltAmount, tiltAmount])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

/**
 * Gradient Text
 * Animated gradient text effect
 */
interface GradientTextProps {
  children: ReactNode
  className?: string
  colors?: string[]
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  colors = ['#3b82f6', '#8b5cf6', '#ec4899'],
}) => {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`

  return (
    <motion.span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Stagger Container
 * Container that staggers children animations
 */
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade In Item
 * Individual item for stagger animation
 */
interface FadeInItemProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

export const FadeInItem: React.FC<FadeInItemProps> = ({
  children,
  className = '',
  direction = 'up',
  distance = 30,
}) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { y: 0, x: distance },
    right: { y: 0, x: -distance },
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          ...directions[direction],
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: {
            duration: 0.5,
            ease: 'easeOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Hover Scale Image
 * Image that scales with smooth spring on hover
 */
interface HoverScaleImageProps {
  src: string
  alt: string
  className?: string
  scale?: number
}

export const HoverScaleImage: React.FC<HoverScaleImageProps> = ({
  src,
  alt,
  className = '',
  scale = 1.1,
}) => {
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      whileHover={{ scale: 1 }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        whileHover={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </motion.div>
  )
}

/**
 * Bounce On Hover
 * Element that bounces when hovered
 */
interface BounceHoverProps {
  children: ReactNode
  className?: string
}

export const BounceHover: React.FC<BounceHoverProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -8,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 10,
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shimmer Loading Effect
 * Shimmer animation for loading states
 */
interface ShimmerProps {
  className?: string
}

export const Shimmer: React.FC<ShimmerProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

/**
 * Confetti Burst
 * Confetti explosion on click
 */
interface ConfettiBurstProps {
  trigger: boolean
  onComplete?: () => void
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  trigger,
  onComplete,
}) => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5],
    angle: (i / 30) * Math.PI * 2,
    distance: 100 + Math.random() * 100,
  }))

  return (
    <AnimatePresence>
      {trigger && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: p.color }}
              initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                rotate: Math.random() * 720 - 360,
              }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              onAnimationComplete={p.id === 0 ? onComplete : undefined}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// Need AnimatePresence import
import { AnimatePresence } from 'framer-motion'

export default MagneticButton
