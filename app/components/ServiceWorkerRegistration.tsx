'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  cacheSize: number;
}

/**
 * Service Worker Registration Component
 * Handles PWA installation and offline support
 */
export default function ServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    updateAvailable: false,
    cacheSize: 0
  });

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers not supported');
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Only register in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SW] Skipping registration in development');
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[SW] Registered successfully:', registration.scope);
      setState(prev => ({ ...prev, isRegistered: true }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] Update available');
              setState(prev => ({ ...prev, updateAvailable: true }));
              
              // Show update notification
              showUpdateNotification();
            }
          });
        }
      });

      // Get cache size
      getCacheSize();

    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  };

  const handleOnline = () => {
    console.log('[SW] Back online');
    setState(prev => ({ ...prev, isOnline: true }));
    
    // Trigger background sync
    if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration: any) => {
        return registration.sync.register('sync-scans');
      }).catch((error: Error) => {
        console.error('[SW] Background sync failed:', error);
      });
    }
  };

  const handleOffline = () => {
    console.log('[SW] Gone offline');
    setState(prev => ({ ...prev, isOnline: false }));
  };

  const showUpdateNotification = () => {
    // Show toast or banner
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
      ">
        <div style="font-weight: bold; margin-bottom: 5px;">Update Available</div>
        <div style="font-size: 14px; margin-bottom: 10px;">A new version is ready to install</div>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #4CAF50;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        ">Reload Now</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      banner.remove();
    }, 10000);
  };

  const getCacheSize = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        const sizeInMB = (event.data.size / 1024 / 1024).toFixed(2);
        console.log('[SW] Cache size:', sizeInMB, 'MB');
        setState(prev => ({ ...prev, cacheSize: event.data.size }));
      };

      registration.active?.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error('[SW] Failed to get cache size:', error);
    }
  };

  const clearCache = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: 'CLEAR_CACHE' });
      
      console.log('[SW] Cache cleared');
      setState(prev => ({ ...prev, cacheSize: 0 }));
      
      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('[SW] Failed to clear cache:', error);
    }
  };

  // Don't render anything (invisible component)
  return null;
}

// Export utility functions
export function isOnline(): boolean {
  return navigator.onLine;
}

export function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    return navigator.storage.persist();
  }
  return Promise.resolve(false);
}

export async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate();
  }
  return null;
}
