'use client';

import { useEffect, useRef, useCallback } from 'react';
import { KeyboardShortcut, KeyboardShortcutManager } from '../lib/keyboardShortcuts';

/**
 * React hook for keyboard shortcuts
 * @param shortcuts - Object mapping shortcut keys to handlers
 * @param enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
): void {
  const managerRef = useRef<KeyboardShortcutManager | null>(null);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new KeyboardShortcutManager();
    }

    const manager = managerRef.current;

    // Register shortcuts
    Object.entries(shortcuts).forEach(([key, handler]) => {
      const shortcut = parseShortcutKey(key, handler);
      if (shortcut) {
        manager.register(shortcut);
      }
    });

    // Set enabled state
    if (enabled) {
      manager.enable();
    } else {
      manager.disable();
    }

    // Add event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      manager.handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      manager.clear();
    };
  }, [shortcuts, enabled]);
}

/**
 * Parse shortcut key string into KeyboardShortcut object
 * @param key - Shortcut key string (e.g., "Ctrl+S", "Shift+Alt+D")
 * @param handler - Handler function
 */
function parseShortcutKey(key: string, handler: () => void): KeyboardShortcut | null {
  const parts = key.split('+').map(p => p.trim().toLowerCase());
  
  if (parts.length === 0) return null;

  const shortcut: KeyboardShortcut = {
    key: parts[parts.length - 1],
    handler: () => handler(),
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command')
  };

  return shortcut;
}

/**
 * Hook for common shortcuts (undo, redo, save, etc.)
 */
export function useCommonShortcuts(handlers: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  onFind?: () => void;
}) {
  const shortcuts: Record<string, () => void> = {};

  if (handlers.onSave) shortcuts['Ctrl+S'] = handlers.onSave;
  if (handlers.onUndo) shortcuts['Ctrl+Z'] = handlers.onUndo;
  if (handlers.onRedo) {
    shortcuts['Ctrl+Y'] = handlers.onRedo;
    shortcuts['Ctrl+Shift+Z'] = handlers.onRedo;
  }
  if (handlers.onCopy) shortcuts['Ctrl+C'] = handlers.onCopy;
  if (handlers.onPaste) shortcuts['Ctrl+V'] = handlers.onPaste;
  if (handlers.onDelete) shortcuts['Delete'] = handlers.onDelete;
  if (handlers.onClose) shortcuts['Escape'] = handlers.onClose;
  if (handlers.onFind) shortcuts['Ctrl+F'] = handlers.onFind;

  useKeyboardShortcuts(shortcuts);
}

/**
 * Hook to show keyboard shortcuts help
 */
export function useShortcutHelp(shortcuts: Record<string, string>) {
  const showHelp = useCallback(() => {
    const helpText = Object.entries(shortcuts)
      .map(([key, description]) => `${key}: ${description}`)
      .join('\n');
    
    console.log('Keyboard Shortcuts:\n' + helpText);
    
    // Could also show a modal or toast
  }, [shortcuts]);

  useKeyboardShortcuts({
    'F1': showHelp,
    'Shift+?': showHelp
  });

  return showHelp;
}
