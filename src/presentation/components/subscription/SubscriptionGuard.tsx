import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';
import SubscriptionBlockedPage from '@/presentation/pages/subscription/SubscriptionBlockedPage';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { status, error, fetchStatus } = useSubscriptionStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    fetchStatus().finally(() => {
      if (!cancelled) setIsReady(true);
    });
    return () => { cancelled = true; };
  }, [fetchStatus]);

  // Mientras no termine el fetch, mostrar spinner (children NUNCA se monta antes)
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Fail closed: si hay error, no hay status, o no está activa → bloquear
  if (error || !status || !status.isActive) {
    return <SubscriptionBlockedPage />;
  }

  return <>{children}</>;
};
