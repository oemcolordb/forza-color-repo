import { useEffect } from 'react'

/**
 * Mobile Gaming Performance Optimizer
 * Optimizes the app specifically for mobile gaming users
 */
export default function MobileGamingOptimizer({ deviceInfo }) {
  useEffect(() => {
    if (!deviceInfo?.isMobile) return

    // Gaming-specific mobile optimizations
    const optimizations = {
      // Reduce motion for better performance on mobile gaming devices
      reduceMotion: () => {
        document.documentElement.style.setProperty('--animation-duration', '0.15s')
        document.documentElement.style.setProperty('--transition-duration', '0.1s')
      },

      // Optimize touch interactions for gaming
      optimizeTouch: () => {
        document.body.style.touchAction = 'manipulation'
        document.body.style.userSelect = 'none'
        document.body.style.webkitUserSelect = 'none'
        document.body.style.webkitTouchCallout = 'none'
        document.body.style.webkitTapHighlightColor = 'transparent'
      },

      // Prevent zoom for gaming experience
      preventZoom: () => {
        const viewport = document.querySelector('meta[name="viewport"]')
        if (viewport) {
          viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
          )
        }
      },

      // Optimize for gaming performance
      optimizePerformance: () => {
        // Enable hardware acceleration
        document.body.style.transform = 'translateZ(0)'
        document.body.style.backfaceVisibility = 'hidden'
        document.body.style.perspective = '1000px'

        // Optimize scrolling
        document.body.style.overscrollBehavior = 'none'
        document.body.style.webkitOverflowScrolling = 'touch'
      },

      // Gaming-specific CSS optimizations
      addGamingStyles: () => {
        // Check if styles already exist
        if (document.getElementById('mobile-gaming-styles')) return

        const style = document.createElement('style')
        style.id = 'mobile-gaming-styles'
        style.textContent = `
          /* Gaming mobile optimizations */
          @media (max-width: 768px) {
            .color-card {
              will-change: transform;
              transform: translateZ(0);
            }
            
            .virtual-grid {
              contain: layout style paint;
            }
            
            .gaming-button {
              touch-action: manipulation;
              user-select: none;
              -webkit-user-select: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            /* Reduce animations on mobile for gaming performance */
            .animate-fade-in,
            .animate-slide-up,
            .animate-scale-in {
              animation-duration: 0.15s !important;
            }
            
            /* Gaming-optimized scrolling */
            .scroll-container {
              -webkit-overflow-scrolling: touch;
              overscroll-behavior: contain;
            }
          }
          
          /* Gaming device specific optimizations */
          @media (max-width: 480px) and (orientation: portrait) {
            .color-grid {
              grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
              gap: 4px;
            }
          }
          
          @media (max-width: 768px) and (orientation: landscape) {
            .color-grid {
              grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
              gap: 3px;
            }
          }
        `
        document.head.appendChild(style)

        // Return cleanup function
        return () => {
          const existingStyle = document.getElementById('mobile-gaming-styles')
          if (existingStyle) {
            existingStyle.remove()
          }
        }
      },
    }

    // Apply all optimizations and collect cleanup functions
    const cleanupFunctions = []
    Object.values(optimizations).forEach(optimize => {
      const cleanup = optimize()
      if (cleanup) cleanupFunctions.push(cleanup)
    })

    // Gaming-specific event listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause animations when tab is hidden (gaming performance)
        document.body.classList.add('paused')
      } else {
        document.body.classList.remove('paused')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [deviceInfo])

  return null
}
