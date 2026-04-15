import { useState, useEffect, useRef } from 'react';
import { waitForPendingWrites } from 'firebase/firestore';
import { db } from '../firebase';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Tracks whether Firestore has pending local writes that haven't synced yet.
 * When the app comes back online, it checks for pending writes and resolves
 * once sync is complete.
 */
export function useFirestoreSync(): { hasPendingWrites: boolean; isSyncing: boolean } {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingWrites, setHasPendingWrites] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setHasPendingWrites(true);
      setIsSyncing(false);
      return;
    }

    // Just came back online — check for pending writes
    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setIsSyncing(true);

      waitForPendingWrites(db)
        .then(() => {
          setHasPendingWrites(false);
          setIsSyncing(false);
        })
        .catch((err) => {
          console.error('Error waiting for pending Firestore writes:', err);
          setHasPendingWrites(false);
          setIsSyncing(false);
        });
    }
  }, [isOnline]);

  return { hasPendingWrites, isSyncing };
}
