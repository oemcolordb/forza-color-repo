import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      
      lock.addEventListener('release', () => {
        setWakeLock(null);
      });
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  // Re-request wake lock when document becomes visible again
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, wakeLock, requestWakeLock]);

  return { isSupported, isLocked: wakeLock !== null, requestWakeLock, releaseWakeLock };
}
