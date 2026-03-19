'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { HistoryManager } from '../lib/historyManager';

interface UseHistoryOptions {
  maxSize?: number;
  debounceMs?: number;
}

interface UseHistoryResult<T> {
  state: T;
  setState: (newState: T, description?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  history: Array<{ index: number; description?: string; timestamp: number; isCurrent: boolean }>;
  jumpTo: (index: number) => void;
}

/**
 * React hook for undo/redo functionality
 * @param initialState - Initial state value
 * @param options - Configuration options
 */
export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {}
): UseHistoryResult<T> {
  const { maxSize = 50, debounceMs = 0 } = options;

  const [state, setStateInternal] = useState<T>(initialState);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [history, setHistory] = useState<Array<{ index: number; description?: string; timestamp: number; isCurrent: boolean }>>([]);

  const historyManager = useRef(new HistoryManager<T>(maxSize));
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize with first state
  useEffect(() => {
    historyManager.current.push(initialState, 'Initial state');
    updateHistoryState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateHistoryState = useCallback(() => {
    const stats = historyManager.current.getStats();
    setCanUndo(stats.canUndo);
    setCanRedo(stats.canRedo);
    setHistory(historyManager.current.getHistory());
  }, []);

  const setState = useCallback((newState: T, description?: string) => {
    setStateInternal(newState);

    // Debounce history updates
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (debounceMs > 0) {
      debounceTimer.current = setTimeout(() => {
        historyManager.current.push(newState, description);
        updateHistoryState();
      }, debounceMs);
    } else {
      historyManager.current.push(newState, description);
      updateHistoryState();
    }
  }, [debounceMs, updateHistoryState]);

  const undo = useCallback(() => {
    const previousState = historyManager.current.undo();
    if (previousState !== null) {
      setStateInternal(previousState);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  const redo = useCallback(() => {
    const nextState = historyManager.current.redo();
    if (nextState !== null) {
      setStateInternal(nextState);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  const clear = useCallback(() => {
    historyManager.current.clear();
    historyManager.current.push(state, 'Reset');
    updateHistoryState();
  }, [state, updateHistoryState]);

  const jumpTo = useCallback((index: number) => {
    const targetState = historyManager.current.jumpTo(index);
    if (targetState !== null) {
      setStateInternal(targetState);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    history,
    jumpTo
  };
}
