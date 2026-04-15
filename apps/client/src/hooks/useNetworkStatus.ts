import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks browser online/offline status via navigator.onLine and window events.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const goOnline = useCallback(() => setIsOnline(true), []);
  const goOffline = useCallback(() => setIsOnline(false), []);

  useEffect(() => {
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [goOnline, goOffline]);

  return { isOnline };
}
