import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { LogManager } from '../services/logManager';
import { addKid, updateKid } from '../services/firestoreService';
import { LogEntry, Kid } from '../types';

type Operation = 'add' | 'update';

interface PendingLogItem {
  collection: 'logs';
  operation: 'add';
  entry: LogEntry;
}

interface PendingKidItem {
  collection: 'kids';
  operation: Operation;
  entry: Kid;
}

type PendingItem = PendingLogItem | PendingKidItem;

interface SyncContextType {
  addPending: (collection: 'logs', operation: 'add', entry: LogEntry) => void;
  addPendingKid: (operation: Operation, entry: Kid) => void;
  pendingCount: number;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [pendingQueue, setPendingQueue] = useState<PendingItem[]>([]);
  const pendingRef = useRef<PendingItem[]>(pendingQueue);

  useEffect(() => { pendingRef.current = pendingQueue; }, [pendingQueue]);

  const addPending = (collection: 'logs', operation: 'add', entry: LogEntry) => {
    setPendingQueue(prev => [...prev, { collection, operation, entry }]);
  };

  const addPendingKid = (operation: Operation, entry: Kid) => {
    setPendingQueue(prev => [...prev, { collection: 'kids', operation, entry }]);
  };

  const flushPending = () => {
    const queue = pendingRef.current;
    if (queue.length === 0) return;

    console.log(`SyncContext: flushing ${queue.length} pending item(s) to Firestore`);
    setPendingQueue([]);

    queue.forEach((item) => {
      if (item.collection === 'logs') {
        LogManager.addLog(item.entry).catch(err =>
          console.error('SyncContext: failed to sync log entry:', err)
        );
      } else if (item.collection === 'kids') {
        if (item.operation === 'add') {
          addKid(item.entry).catch(err =>
            console.error('SyncContext: failed to sync kid add:', err)
          );
        } else {
          updateKid(item.entry.id, item.entry).catch(err =>
            console.error('SyncContext: failed to sync kid update:', err)
          );
        }
      }
    });
  };

  useEffect(() => {
    window.addEventListener('online', flushPending);
    return () => window.removeEventListener('online', flushPending);
  }, []);

  return (
    <SyncContext.Provider value={{ addPending, addPendingKid, pendingCount: pendingQueue.length }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
