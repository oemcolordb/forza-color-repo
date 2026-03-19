'use client';

import { useEffect, useRef } from 'react';
import { TouchGestureHandler, TouchGestureHandlers, TouchGestureOptions } from '../lib/touchGestures';

/**
 * React hook for touch gestures
 * @param handlers - Gesture event handlers
 * @param options - Configuration options
 */
export function useTouchGestures(
  handlers: TouchGestureHandlers,
  options?: TouchGestureOptions
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const gestureHandlerRef = useRef<TouchGestureHandler | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    // Create gesture handler
    gestureHandlerRef.current = new TouchGestureHandler(
      elementRef.current,
      handlers,
      options
    );

    // Cleanup
    return () => {
      gestureHandlerRef.current?.destroy();
    };
  }, [handlers, options]);

  return elementRef;
}

/**
 * Hook for swipe gestures only
 */
export function useSwipeGestures(handlers: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}) {
  return useTouchGestures(handlers);
}

/**
 * Hook for pinch zoom gestures
 */
export function usePinchZoom(handlers: {
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
}) {
  return useTouchGestures(handlers);
}
