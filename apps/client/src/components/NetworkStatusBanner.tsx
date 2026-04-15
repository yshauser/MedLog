import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { useSync } from '../context/SyncContext';

type BannerState = 'hidden' | 'offline' | 'syncing' | 'synced';

export const NetworkStatusBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isOnline } = useNetworkStatus();
  const { isSyncing } = useFirestoreSync();
  const { pendingCount } = useSync();
  const [bannerState, setBannerState] = useState<BannerState>('hidden');

  useEffect(() => {
    if (!isOnline) {
      setBannerState('offline');
      return;
    }

    if (isSyncing) {
      setBannerState('syncing');
      return;
    }

    // Just finished syncing — show "synced" briefly then hide
    if (bannerState === 'syncing' || bannerState === 'offline') {
      setBannerState('synced');
      const timer = setTimeout(() => setBannerState('hidden'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing]);

  if (bannerState === 'hidden') return null;

  const config: Record<Exclude<BannerState, 'hidden'>, {
    bg: string;
    icon: React.ReactNode;
    textKey: string;
  }> = {
    offline: {
      bg: 'bg-amber-500',
      icon: <WifiOff className="w-4 h-4" />,
      textKey: 'network.offline',
    },
    syncing: {
      bg: 'bg-blue-500',
      icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      textKey: 'network.syncing',
    },
    synced: {
      bg: 'bg-emerald-500',
      icon: <CheckCircle className="w-4 h-4" />,
      textKey: 'network.synced',
    },
  };

  const current = config[bannerState as Exclude<BannerState, 'hidden'>];
  if (!current) return null;

  return (
    <div
      className={`${current.bg} text-white text-sm py-1.5 px-4 flex items-center justify-center gap-2 transition-all duration-300`}
      role="status"
      aria-live="polite"
    >
      {current.icon}
      <span>
        {bannerState === 'offline' && pendingCount > 0
          ? t('network.offlinePending', { count: pendingCount })
          : t(current.textKey)}
      </span>
    </div>
  );
};
