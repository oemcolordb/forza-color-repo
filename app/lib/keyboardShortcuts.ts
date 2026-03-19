/**
 * Keyboard Shortcuts Manager
 * Handles global and local keyboard shortcuts
 */

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description?: string;
  handler: (event: KeyboardEvent) => void;
};

export class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private isEnabled = true;

  /**
   * Register a keyboard shortcut
   * @param shortcut - Shortcut configuration
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.createKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   * @param shortcut - Shortcut configuration
   */
  unregister(shortcut: Omit<KeyboardShortcut, 'handler' | 'description'>): void {
    const key = this.createKey(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Handle keyboard event
   * @param event - Keyboard event
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Ctrl+Z, Ctrl+Y, Ctrl+S in inputs
      if (!(event.ctrlKey && ['z', 'y', 's'].includes(event.key.toLowerCase()))) {
        return;
      }
    }

    const key = this.createKeyFromEvent(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.handler(event);
    }
  }

  /**
   * Enable shortcuts
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable shortcuts
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Clear all shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  /**
   * Create unique key from shortcut config
   */
  private createKey(shortcut: Omit<KeyboardShortcut, 'handler' | 'description'>): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('Meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  /**
   * Create key from keyboard event
   */
  private createKeyFromEvent(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }
}

/**
 * Format shortcut for display
 * @param shortcut - Shortcut configuration
 * @returns Formatted string (e.g., "Ctrl+Shift+S")
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'handler'>): string {
  const parts: string[] = [];
  
  // Use platform-specific modifier key
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  
  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  
  // Format key name
  const keyName = shortcut.key.length === 1 
    ? shortcut.key.toUpperCase() 
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);
  
  parts.push(keyName);
  
  return parts.join(isMac ? '' : '+');
}

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'y', ctrl: true, description: 'Redo' },
  REDO_ALT: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  COPY: { key: 'c', ctrl: true, description: 'Copy' },
  PASTE: { key: 'v', ctrl: true, description: 'Paste' },
  CUT: { key: 'x', ctrl: true, description: 'Cut' },
  SELECT_ALL: { key: 'a', ctrl: true, description: 'Select All' },
  FIND: { key: 'f', ctrl: true, description: 'Find' },
  NEW: { key: 'n', ctrl: true, description: 'New' },
  OPEN: { key: 'o', ctrl: true, description: 'Open' },
  CLOSE: { key: 'Escape', description: 'Close' },
  DELETE: { key: 'Delete', description: 'Delete' },
  REFRESH: { key: 'F5', description: 'Refresh' },
  HELP: { key: 'F1', description: 'Help' },
};
