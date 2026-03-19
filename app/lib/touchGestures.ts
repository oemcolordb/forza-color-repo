/**
 * Touch Gesture Handler
 * Handles swipe, pinch, and tap gestures for mobile
 */

export interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export interface TouchGestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export class TouchGestureHandler {
  private element: HTMLElement;
  private handlers: TouchGestureHandlers;
  private options: Required<TouchGestureOptions>;
  
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private lastTapTime = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  
  private initialDistance = 0;
  private currentScale = 1;

  constructor(
    element: HTMLElement,
    handlers: TouchGestureHandlers,
    options: TouchGestureOptions = {}
  ) {
    this.element = element;
    this.handlers = handlers;
    this.options = {
      swipeThreshold: options.swipeThreshold || 50,
      longPressDelay: options.longPressDelay || 500,
      doubleTapDelay: options.doubleTapDelay || 300
    };

    this.attachListeners();
  }

  private attachListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      // Single touch
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();

      // Start long press timer
      this.longPressTimer = setTimeout(() => {
        this.handlers.onLongPress?.();
      }, this.options.longPressDelay);
    } else if (e.touches.length === 2) {
      // Two finger touch (pinch)
      this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      this.clearLongPressTimer();
    }
  };

  private handleTouchMove = (e: TouchEvent): void {
    this.clearLongPressTimer();

    if (e.touches.length === 2) {
      // Pinch gesture
      e.preventDefault();
      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / this.initialDistance;

      if (scale > this.currentScale) {
        this.handlers.onPinchOut?.(scale);
      } else if (scale < this.currentScale) {
        this.handlers.onPinchIn?.(scale);
      }

      this.currentScale = scale;
    }
  };

  private handleTouchEnd = (e: TouchEvent): void {
    this.clearLongPressTimer();

    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const deltaTime = Date.now() - this.touchStartTime;

      // Check for swipe
      if (Math.abs(deltaX) > this.options.swipeThreshold || Math.abs(deltaY) > this.options.swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.handlers.onSwipeRight?.();
          } else {
            this.handlers.onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            this.handlers.onSwipeDown?.();
          } else {
            this.handlers.onSwipeUp?.();
          }
        }
      } else if (deltaTime < 200) {
        // Quick tap - check for double tap
        const now = Date.now();
        if (now - this.lastTapTime < this.options.doubleTapDelay) {
          this.handlers.onDoubleTap?.();
          this.lastTapTime = 0; // Reset to prevent triple tap
        } else {
          this.lastTapTime = now;
        }
      }
    }

    // Reset pinch state
    if (e.touches.length < 2) {
      this.initialDistance = 0;
      this.currentScale = 1;
    }
  };

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.clearLongPressTimer();
  }
}

/**
 * Create touch gesture handler
 */
export function createTouchGestureHandler(
  element: HTMLElement,
  handlers: TouchGestureHandlers,
  options?: TouchGestureOptions
): TouchGestureHandler {
  return new TouchGestureHandler(element, handlers, options);
}
