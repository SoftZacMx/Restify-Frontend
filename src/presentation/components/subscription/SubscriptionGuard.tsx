import { useEffect } from 'react';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';
import SubscriptionBlockedPage from '@/presentation/pages/subscription/SubscriptionBlockedPage';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { status, isLoading, fetchStatus } = useSubscriptionStore();

  useEffect(() => {
    if (!status) {
      fetchStatus();
    }
  }, [status, fetchStatus]);

  if (isLoading || !status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!status.isActive) {
    return <SubscriptionBlockedPage />;
  }

  return <>{children}</>;
};
