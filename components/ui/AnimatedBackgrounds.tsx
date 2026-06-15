'use client'

import React, { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Animated Background Components
 * 
 * Premium animated backgrounds that add life and movement to pages.
 * Includes mesh gradients, aurora effects, and interactive orbs.
 */

/**
 * Aurora Borealis Background
 * Flowing, ethereal gradient waves
 */
export const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      
      {/* Animated aurora layers */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(138, 43, 226, 0.2), transparent),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(59, 130, 246, 0.2), transparent)
          `,
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 30% 30%, rgba(236, 72, 153, 0.2), transparent),
            radial-gradient(ellipse 80% 50% at 70% 70%, rgba(139, 92, 246, 0.2), transparent)
          `,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

/**
 * Mesh Gradient Background
 * Organic, morphing color blobs
 */
export const MeshGradientBackground: React.FC<{ 
  colors?: string[] 
}> = ({ 
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981']
}) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gray-950" />
      
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            left: `${20 + (i % 3) * 30}%`,
            top: `${20 + Math.floor(i / 3) * 30}%`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Grid Lines Background
 * Animated grid with fading lines
 */
export const GridLinesBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gray-950" />
      
      {/* Vertical lines */}
      <div className="absolute inset-0 flex justify-between px-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="w-px h-full bg-gradient-to-b from-transparent via-gray-800 to-transparent"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scaleY: 1,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Horizontal lines */}
      <div className="absolute inset-0 flex flex-col justify-between py-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scaleX: 1,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Intersection glows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute w-2 h-2 rounded-full bg-blue-500/20"
          style={{
            left: `${15 + (i % 3) * 35}%`,
            top: `${20 + Math.floor(i / 3) * 40}%`,
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Spotlight Cursor Effect
 * Interactive spotlight that follows cursor
 */
export const SpotlightCursor: React.FC<{
  color?: string
  size?: number
}> = ({ 
  color = 'rgba(59, 130, 246, 0.15)',
  size = 400 
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - size / 2)
      mouseY.set(e.clientY - size / 2)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, size])

  return (
    <motion.div
      className="fixed pointer-events-none z-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        x: springX,
        y: springY,
      }}
    />
  )
}

/**
 * Floating Orbs
 * Animated floating spheres
 */
export const FloatingOrbs: React.FC = () => {
  const orbs = [
    { color: '#3b82f6', size: 200, x: '20%', y: '30%', duration: 15 },
    { color: '#8b5cf6', size: 300, x: '70%', y: '60%', duration: 20 },
    { color: '#ec4899', size: 150, x: '80%', y: '20%', duration: 18 },
    { color: '#10b981', size: 250, x: '40%', y: '80%', duration: 22 },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            y: [0, -50, 50, 0],
            x: [0, 30, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Starfield Background
 * Twinkling stars effect
 */
export const StarfieldBackground: React.FC = () => {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Racing Stripes Background
 * Speed lines effect for racing theme
 */
export const RacingStripesBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gray-950" />
      
      {/* Diagonal stripes */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 100px,
              rgba(59, 130, 246, 0.1) 100px,
              rgba(59, 130, 246, 0.1) 102px
            )
          `,
        }}
      />
      
      {/* Animated speed lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-full"
          style={{
            top: `${10 + i * 12}%`,
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)',
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Checkered flag pattern at edges */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 opacity-10"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              #000 0px,
              #000 20px,
              #fff 20px,
              #fff 40px
            )
          `,
        }}
      />
    </div>
  )
}

/**
 * Combined Background Selector
 * Easy way to switch between backgrounds
 */
export const BackgroundSelector: React.FC<{
  variant: 'aurora' | 'mesh' | 'grid' | 'spotlight' | 'orbs' | 'stars' | 'racing'
  spotlightColor?: string
}> = ({ 
  variant, 
  spotlightColor 
}) => {
  switch (variant) {
    case 'aurora':
      return <AuroraBackground />
    case 'mesh':
      return <MeshGradientBackground />
    case 'grid':
      return <GridLinesBackground />
    case 'spotlight':
      return <SpotlightCursor color={spotlightColor} />
    case 'orbs':
      return <FloatingOrbs />
    case 'stars':
      return <StarfieldBackground />
    case 'racing':
      return <RacingStripesBackground />
    default:
      return <AuroraBackground />
  }
}

export default BackgroundSelector
