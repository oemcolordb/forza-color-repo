'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PageTransition } from '@/components/transitions/PageTransitions'
import { useTransition } from '@/context/TransitionContext'

/**
 * Inner wrapper that uses useSearchParams
 * Must be wrapped in Suspense for static generation
 */
const TransitionWrapperInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {
    currentTransition,
    isTransitioning,
    triggerTransition,
    isEnabled,
    mode: _mode
  } = useTransition()

  const [isAnimating, setIsAnimating] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [_pendingChildren, setPendingChildren] = useState<React.ReactNode>(null)

  // Track route changes
  useEffect(() => {
    // Don't animate on initial load
    if (!isEnabled) {
      setDisplayChildren(children)
      return
    }

    // Store the new children as pending
    setPendingChildren(children)

    // Trigger the transition
    const startTransition = async () => {
      setIsAnimating(true)

      // Wait for transition to start (small delay for DOM to update)
      await new Promise(resolve => setTimeout(resolve, 50))

      // Trigger the transition animation
      await triggerTransition()

      // Transition complete - swap children
      setDisplayChildren(children)
      setPendingChildren(null)
      setIsAnimating(false)
    }

    startTransition()
  }, [pathname, searchParams, isEnabled, triggerTransition, children])

  // Handle transition complete callback from animation component
  const handleTransitionComplete = useCallback(() => {
    // Animation is done, children should already be swapped
  }, [])

  return (
    <>
      {/* The page transition overlay */}
      <PageTransition
        type={currentTransition}
        isActive={isAnimating || isTransitioning}
        onComplete={handleTransitionComplete}
      />

      {/* Render the appropriate children */}
      <div style={{ opacity: isAnimating ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        {displayChildren}
      </div>
    </>
  )
}

/**
 * Outer wrapper with Suspense boundary
 */
export const TransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={children}>
      <TransitionWrapperInner>{children}</TransitionWrapperInner>
    </Suspense>
  )
}

/**
 * Link component that triggers transitions
 *
 * Wraps Next.js Link with transition trigger on click
 */
import Link from 'next/link'

interface TransitionLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  href,
  children,
  className,
  onClick
}) => {
  const { isEnabled: _isEnabled } = useTransition()

  const handleClick = useCallback((_e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    }

    // Link will handle navigation, wrapper will detect route change
  }, [onClick])

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}

export default TransitionWrapper
