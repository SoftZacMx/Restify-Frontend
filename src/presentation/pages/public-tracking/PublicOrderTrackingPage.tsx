import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Clock,
  CookingPot,
  PackageCheck,
  Truck,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PublicLayout } from '@/presentation/components/layouts/PublicLayout';
import { Button } from '@/presentation/components/ui/button';
import {
  publicOrderRepository,
  type PublicOrderStatusResponse,
} from '@/infrastructure/api/repositories/public-order.repository';

type OrderStatus = PublicOrderStatusResponse['status'];

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'PENDING_PAYMENT', label: 'Esperando pago', icon: <Clock className="h-5 w-5" /> },
  { key: 'PAID', label: 'Pagado', icon: <CheckCircle className="h-5 w-5" /> },
  { key: 'PREPARING', label: 'Preparando', icon: <CookingPot className="h-5 w-5" /> },
  { key: 'READY', label: 'Listo', icon: <PackageCheck className="h-5 w-5" /> },
  { key: 'ON_THE_WAY', label: 'En camino', icon: <Truck className="h-5 w-5" /> },
  { key: 'DELIVERED', label: 'Entregado', icon: <CheckCircle className="h-5 w-5" /> },
];

function getStepIndex(status: OrderStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

const PublicOrderTrackingPage = () => {
  const { trackingToken } = useParams<{ trackingToken: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-order-status', trackingToken],
    queryFn: () => publicOrderRepository.getOrderStatus(trackingToken!),
    enabled: !!trackingToken,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Cargando estado del pedido...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
          <p className="text-red-500 dark:text-red-400 font-medium mb-2">
            No se encontró el pedido
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifica que el enlace sea correcto.
          </p>
        </div>
      </PublicLayout>
    );
  }

  const currentIndex = getStepIndex(data.status);

  // Para pickup: no mostrar "En camino" ni "Entregado" (último estado es "Listo para recoger")
  const steps = data.orderType === 'PICKUP'
    ? STATUS_STEPS.filter((s) => s.key !== 'ON_THE_WAY' && s.key !== 'DELIVERED')
    : STATUS_STEPS;

  const openInMaps = () => {
    // Abre Google Maps con dirección del restaurante → cliente
    window.open('https://www.google.com/maps/dir/', '_blank');
  };

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Seguimiento de pedido
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data.customerName} &middot; {data.orderType === 'DELIVERY' ? 'Domicilio' : 'Recolección'}
          </p>
        </div>

        {/* Progress steps */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const stepOriginalIndex = getStepIndex(step.key);
              const isCompleted = stepOriginalIndex < currentIndex;
              const isCurrent = stepOriginalIndex === currentIndex;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Icon + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {step.icon}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          isCompleted
                            ? 'bg-green-300 dark:bg-green-700'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pt-2 pb-4">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isCurrent
                            ? 'text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Tu pedido
          </h3>
          {data.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                ${item.total.toFixed(2)}
              </span>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
            <span className="font-bold text-slate-900 dark:text-white">Total</span>
            <span className="font-bold text-primary">${data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Scheduled time */}
        {data.scheduledAt && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.orderType === 'DELIVERY' ? 'Entrega programada' : 'Hora de recolección'}
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(data.scheduledAt).toLocaleString('es-MX', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Map button for delivery */}
        {data.orderType === 'DELIVERY' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={openInMaps}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Ver en mapa
          </Button>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Esta página se actualiza automáticamente cada 15 segundos.
        </p>
      </div>
    </PublicLayout>
  );
};

export default PublicOrderTrackingPage;
