/**
 * History Manager for Undo/Redo Functionality
 * Implements command pattern with history stack
 */

export interface HistoryState<T> {
  data: T;
  timestamp: number;
  description?: string;
}

export class HistoryManager<T> {
  private history: HistoryState<T>[] = [];
  private currentIndex = -1;
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Push new state to history
   * @param state - State data
   * @param description - Optional description
   */
  push(state: T, description?: string): void {
    // Remove any states after current index (redo history)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push({
      data: this.deepClone(state),
      timestamp: Date.now(),
      description
    });

    // Maintain max size (remove oldest)
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Undo to previous state
   * @returns Previous state or null
   */
  undo(): T | null {
    if (!this.canUndo()) {
      return null;
    }

    this.currentIndex--;
    return this.deepClone(this.history[this.currentIndex].data);
  }

  /**
   * Redo to next state
   * @returns Next state or null
   */
  redo(): T | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.deepClone(this.history[this.currentIndex].data);
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrentState(): T | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.deepClone(this.history[this.currentIndex].data);
    }
    return null;
  }

  /**
   * Get history at specific index
   */
  getStateAt(index: number): T | null {
    if (index >= 0 && index < this.history.length) {
      return this.deepClone(this.history[index].data);
    }
    return null;
  }

  /**
   * Jump to specific state in history
   */
  jumpTo(index: number): T | null {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      return this.deepClone(this.history[index].data);
    }
    return null;
  }

  /**
   * Get history list
   */
  getHistory(): Array<{ index: number; description?: string; timestamp: number; isCurrent: boolean }> {
    return this.history.map((state, index) => ({
      index,
      description: state.description,
      timestamp: state.timestamp,
      isCurrent: index === this.currentIndex
    }));
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get statistics
   */
  getStats(): { size: number; currentIndex: number; canUndo: boolean; canRedo: boolean } {
    return {
      size: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Deep clone object
   */
  private deepClone(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * Create a history manager instance
 */
export function createHistoryManager<T>(maxSize?: number): HistoryManager<T> {
  return new HistoryManager<T>(maxSize);
}
