import { useParams, useNavigate } from 'react-router-dom';
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
  XCircle,
  RotateCcw,
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
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-order-status', trackingToken],
    queryFn: () => publicOrderRepository.getOrderStatus(trackingToken!),
    enabled: !!trackingToken,
    refetchInterval: (query) =>
      query.state.data?.status === 'PAYMENT_FAILED' ? false : 15000,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando estado del pedido...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">
            No se encontró el pedido
          </p>
          <p className="text-sm text-muted-foreground">
            Verifica que el enlace sea correcto.
          </p>
        </div>
      </PublicLayout>
    );
  }

  if (data.status === 'PAYMENT_FAILED') {
    return (
      <PublicLayout>
        <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-20 text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              Tu pago no se completó
            </p>
            <p className="text-sm text-muted-foreground">
              No se realizó ningún cargo. Puedes volver a intentarlo.
            </p>
          </div>
          {data.branchSlug && (
            <Button onClick={() => navigate(`/menu/${data.branchSlug}`)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Volver a intentar
            </Button>
          )}
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
          <h2 className="text-2xl font-bold text-foreground">
            Seguimiento de pedido
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.customerName} &middot; {data.orderType === 'DELIVERY' ? 'Domicilio' : 'Recolección'}
          </p>
        </div>

        {/* Progress steps */}
        <div className="rounded-xl border border-border bg-card p-6">
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
                          ? 'bg-fresco-suave text-fresco'
                          : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground dark:bg-card dark:text-muted-foreground'
                      }`}
                    >
                      {step.icon}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          isCompleted
                            ? 'bg-fresco-suave'
                            : 'bg-secondary'
                        }`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pt-2 pb-4">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-fresco'
                          : isCurrent
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground'
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
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">
            Tu pedido
          </h3>
          {data.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-foreground">
                ${item.total.toFixed(2)}
              </span>
            </div>
          ))}
          <div className="pt-3 border-t border-border flex justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary">${data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Scheduled time */}
        {data.scheduledAt && (
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">
                {data.orderType === 'DELIVERY' ? 'Entrega programada' : 'Hora de recolección'}
              </p>
              <p className="text-sm font-medium text-foreground">
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
        <p className="text-center text-xs text-muted-foreground">
          Esta página se actualiza automáticamente cada 15 segundos.
        </p>
      </div>
    </PublicLayout>
  );
};

export default PublicOrderTrackingPage;
