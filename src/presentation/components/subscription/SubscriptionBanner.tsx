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
      <div className="mb-4 flex items-center justify-between rounded-lg border border-apoyo bg-apoyo-suave px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-apoyo" />
          <span className="text-sm text-apoyo-texto">
            Tu suscripción se cancelará en {status.daysRemaining} días.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isReactivating}
            className="text-xs h-7 border-apoyo text-apoyo-texto hover:bg-apoyo-suave"
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
            <X className="w-4 h-4 text-apoyo" />
          </button>
        </div>
      </div>
    );
  }

  // Banner rojo: pago fallido
  if (status.status === 'PAST_DUE') {
    return (
      <div className="mb-4 flex items-center justify-between rounded-lg border border-destructive bg-destructive-suave px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive-texto">
            Tu pago falló. Tienes {status.daysRemaining} días para actualizar tu método de pago.
          </span>
        </div>
        <button onClick={() => setDismissed(true)}>
          <X className="w-4 h-4 text-destructive" />
        </button>
      </div>
    );
  }

  return null;
};
