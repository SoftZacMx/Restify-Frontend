import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';
import { subscriptionService } from '@/application/services/subscription.service';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';

export const SubscriptionBanner = () => {
  const { status, fetchStatus } = useSubscriptionStore();
  const [dismissed, setDismissed] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  if (!status || dismissed) return null;

  // Banner amarillo: cancelación pendiente
  if (status.isActive && status.cancelAtPeriodEnd) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            Tu suscripción se cancelará en {status.daysRemaining} días.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isReactivating}
            className="text-xs h-7 border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-900/40"
            onClick={async () => {
              setIsReactivating(true);
              try {
                await subscriptionService.reactivate();
                showSuccessToast('Suscripción reactivada');
                await fetchStatus();
              } catch (error: any) {
                showErrorToast('Error', error.message);
              }
              setIsReactivating(false);
            }}
          >
            {isReactivating ? 'Reactivando...' : 'Reactivar'}
          </Button>
          <button onClick={() => setDismissed(true)}>
            <X className="w-4 h-4 text-yellow-500" />
          </button>
        </div>
      </div>
    );
  }

  // Banner rojo: pago fallido
  if (status.status === 'PAST_DUE') {
    return (
      <div className="mb-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">
            Tu pago falló. Tienes {status.daysRemaining} días para actualizar tu método de pago.
          </span>
        </div>
        <button onClick={() => setDismissed(true)}>
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>
    );
  }

  return null;
};
